class TestExecutor {
  constructor(browser, config) {
    this.browser = browser;
    this.config = config;
  }

  async execute(test, index) {
    const page = await this.browser.newPage();
    await page.setViewport(this.config.viewport);

    try {
      await page.goto(test.url);

      for (const action of test.actions) {
        await this.performAction(page, action);
      }

      await page.waitForTimeout(2000);

      if (test.resultActions) {
        for (const action of test.resultActions) {
          await this.performAction(page, action);
        }
        await page.waitForTimeout(2000);
      }

      return await this.validateTest(page, test, index);

    } catch (error) {
      return {
        testName: `${test.name}_${index}`,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      await page.close();
    }
  }

  async performAction(page, action) {
    switch (action.type) {
      case 'type':
        await page.type(action.selector, action.value);
        break;
      case 'click':
        await page.click(action.selector);
        break;
      case 'key':
        await page.keyboard.press(action.key);
        break;
      case 'delay':
        await page.waitForTimeout(action.value);
        break;
    }
  }

  async validateTest(page, test, index) {
    const currentUrl = page.url();
    
    const urlCheck = test.expectedUrlContains ? currentUrl.includes(test.expectedUrlContains) : true;
    const textCheckResult = await this.checkExpectedText(page, test.expectedElement, test.expectedText);
    
    const passed = urlCheck && textCheckResult.passed;

    const result = {
      testName: `${test.name}_${index}`,
      status: passed ? 'PASS' : 'FAIL',
      url: currentUrl,
      timestamp: new Date().toISOString()
    };

    if (!passed) {
      result.failures = [];
      if (!urlCheck) {
        result.failures.push(`URL check failed: Expected '${test.expectedUrlContains}' in '${currentUrl}'`);
      }
      if (!textCheckResult.passed) {
        result.failures.push(`Text check failed: ${textCheckResult.message}`);
      }
    }

    return result;
  }

  async checkExpectedText(page, expectedElement, expectedText) {
    if (!expectedText) return { passed: true };
    
    const selector = expectedElement || 'body';
    const elementText = await page.$eval(selector, el => el.textContent);
    
    if (Array.isArray(expectedText)) {
      const failedTexts = expectedText.filter(text => !elementText.includes(text));
      return {
        passed: failedTexts.length === 0,
        message: failedTexts.length > 0 ? `Missing texts: [${failedTexts.join(', ')}]` : 'All texts found'
      };
    }
    
    const passed = elementText.includes(expectedText);
    return {
      passed,
      message: passed ? 'Text found' : `Missing text: '${expectedText}'`
    };
  }
}

module.exports = TestExecutor;