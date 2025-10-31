const puppeteer = require('puppeteer');
const TestExecutor = require('./TestExecutor');
const ResultManager = require('./ResultManager');
const DataGenerator = require('./DataGenerator');

class TestRunner {
  constructor(config = {}) {
    this.config = {
      headless: false,
      slowMo: 5,
      viewport: { width: 1024, height: 625 },
      ...config
    };
    const now = new Date();
    this.timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  }

  async run(testCases) {
    const browser = await puppeteer.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: ['--ignore-certificate-errors', '--ignore-ssl-errors']
    });

    const executor = new TestExecutor(browser, this.config);
    const results = [];

    for (let i = 0; i < testCases.tests.length; i++) {
      const result = await executor.execute(testCases.tests[i], i + 1);
      results.push(result);
    }

    await browser.close();
    return { results, generatedData: DataGenerator.storage, timestamp: this.timestamp, testCases };
  }
}

module.exports = TestRunner;