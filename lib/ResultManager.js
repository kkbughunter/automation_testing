const fs = require('fs');
const path = require('path');

class ResultManager {
  constructor(outputDir = './result') {
    this.outputDir = outputDir;
  }

  save(results, inputFilename, timestamp) {
    const baseName = path.basename(inputFilename, path.extname(inputFilename));
    const inputDir = path.dirname(inputFilename);
    const resultDir = path.join(this.outputDir, inputDir);
    
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }
    
    const resultFile = path.join(resultDir, `${baseName}_result_${timestamp}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${resultFile}`);
  }

  saveGeneratedData(generatedData, inputFilename, timestamp, testCases) {
    const baseName = path.basename(inputFilename, path.extname(inputFilename));
    const inputDir = path.dirname(inputFilename);
    const resultDir = path.join(this.outputDir, inputDir);
    
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }
    
    const resolvedTestCases = JSON.parse(JSON.stringify(testCases));
    resolvedTestCases.tests.forEach(test => {
      test.actions?.forEach(action => {
        if (typeof action.value === 'string' && action.value.startsWith('$')) {
          action.value = generatedData[action.value.substring(1)] || action.value;
        }
        if (Array.isArray(action.type) && action.type[0] === 'type' && action.type[1]) {
          const generatedValue = generatedData[action.selector] || generatedData[action.storeAs];
          if (generatedValue) {
            action.generatedValue = generatedValue;
          }
        }
      });
      test.resultActions?.forEach(action => {
        if (typeof action.value === 'string' && action.value.startsWith('$')) {
          action.value = generatedData[action.value.substring(1)] || action.value;
        }
      });
      if (test.expectedText) {
        test.expectedText = test.expectedText.map(text => 
          typeof text === 'string' && text.startsWith('$') ? generatedData[text.substring(1)] || text : text
        );
      }
    });
    
    const dataFile = path.join(resultDir, `${baseName}_${timestamp}.json`);
    fs.writeFileSync(dataFile, JSON.stringify(resolvedTestCases, null, 2));
    console.log(`Generated data saved to ${dataFile}`);
  }


}

module.exports = ResultManager;