// Playwright config for local OMJN TEST smoke checks.
const port = Number(process.env.PORT || 3000);
const baseURL = `http://127.0.0.1:${port}/TEST/`;

module.exports = {
  testDir: "./tests",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL,
    browserName: "chromium",
    trace: "on-first-retry",
  },
  webServer: {
    command: `node scripts/static-server.cjs --port ${port}`,
    url: `${baseURL}operator.html`,
    reuseExistingServer: !process.env.CI,
  },
};
