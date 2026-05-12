function installConsoleErrorGuard(page, options = {}) {
  const consoleErrors = [];

  page.on('console', message => {
    if (message.type() !== 'error') return;

    const text = message.text();
    const harmless = [
      /Failed to load resource: net::ERR_ABORTED/i,
      /downloadable font:/i,
      ...(options.ignorePatterns || [])
    ].some(pattern => pattern.test(text));

    if (!harmless) consoleErrors.push(text);
  });

  return consoleErrors;
}

module.exports = { installConsoleErrorGuard };
