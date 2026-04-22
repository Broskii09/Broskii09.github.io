// Playwright config for local OMJN TEST smoke checks.
// Pages are loaded from disk so these tests do not require a dev server.
module.exports = {
  testDir: "./tests",
  timeout: 30000,
  use: {
    browserName: "chromium",
    trace: "on-first-retry",
  },
};
