const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/run-tests', async (req, res) => {
    const testCases = req.body;
    const results = [];

    const browser = await puppeteer.launch({ headless: false, slowMo: 25 });

    try {
        for (let i = 0; i < testCases.tests.length; i++) {
            const test = testCases.tests[i];
            const page = await browser.newPage();
            await page.setViewport({ width: 1024, height: 625 });

            try {
                await page.goto(test.url);

                for (const action of test.actions) {
                    if (action.type === 'type') {
                        await page.type(action.selector, action.value);
                    } else if (action.type === 'click') {
                        await page.click(action.selector);
                        if (action.waitAfter) {
                            await page.waitForTimeout(action.waitAfter);
                        }
                    } else if (action.type === 'wait') {
                        await page.waitForTimeout(action.duration);
                    }
                }

                await page.waitForTimeout(2000);

                const currentUrl = page.url();
                const elementSelector = test.expectedElement || 'body';
                const elementText = await page.$eval(elementSelector, el => el.textContent);

                let passed = currentUrl.includes(test.expectedUrlContains) &&
                    elementText.includes(test.expectedText);

                if (test.checkInContainer) {
                    const containerExists = await page.$(test.checkInContainer);
                    if (containerExists) {
                        const containerText = await page.$eval(test.checkInContainer, el => el.textContent);
                        passed = passed && containerText.includes(test.expectedText);
                    } else {
                        passed = false;
                    }
                }

                if (test.screenshotPath && test.screenshotPath.trim() !== '') {
                    await page.screenshot({ path: test.screenshotPath });
                }

                results.push({
                    testName: `${test.name}_${i + 1}`,
                    status: passed ? 'PASS' : 'FAIL',
                    url: currentUrl,
                    expectedText: test.expectedText,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                results.push({
                    testName: `${test.name}_${i + 1}`,
                    status: 'ERROR',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }

            await page.close();
        }

        await browser.close();

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const resultPath = path.join(__dirname, '../result', `test-results-${timestamp}.json`);
        fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));

        res.json(results);

    } catch (error) {
        await browser.close();
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Test server running on http://localhost:3001');
});
