# How to use 

```bash
# Default
npm test
```
```bash
# Custom files
node index.js test-case.json
node index.js login/TC001.json
```

## Input File Syntax

```json
{
  "tests": [
    {
      "name": "Test_Name",
      "url": "https://example.com",
      "actions": [
        {
          "type": "type",
          "selector": "input[name='field']",
          "value": "text to type"
        },
        {
          "type": "click",
          "selector": "button#submit"
        },
        {
          "type": "key",
          "key": "Enter"
        },
        {
          "type": "select",
          "selector": "select[name='industry']",
          "value": "Tyres"
        },
        {
          "type": "delay",
          "duration": 2000
        }
      ],
      "resultActions": [
        {
          "type": "click",
          "selector": "a[href='#form-elements']"
        },
        {
          "type": "delay",
          "duration": 1000
        }
      ],
      "expectedText": "Expected text on page",
      "expectedElement": "#element-selector",
      "expectedUrlContains": "/expected-path",
      "screenshotPath": "./screenshots/test.png"
    }
  ]
}
```