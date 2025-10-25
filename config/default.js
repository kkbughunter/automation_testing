module.exports = {
  browser: {
    headless: false,
    slowMo: 25,
    viewport: { width: 1024, height: 625 }
  },
  output: {
    directory: './result',
    filename: 'test-results.json'
  },
  timeout: 2000
};