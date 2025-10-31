const TestRunner = require('./lib/TestRunner');
const TestLoader = require('./tests/TestLoader');
const ResultManager = require('./lib/ResultManager');
const config = require('./config/default');

async function main() {
  const userInput = process.argv[2] || 'test-cases.json';
  const generateExcel = process.argv.includes('-d');
  const appendExcel = process.argv.includes('-a');

  const testCases = TestLoader.load(userInput);
  const runner = new TestRunner(config.browser);
  const resultManager = new ResultManager(config.output.directory);

  console.log('Starting test execution...');
  const { results, generatedData, timestamp, testCases: executedTestCases } = await runner.run(testCases);
  
  const baseName = require('path').basename(userInput, require('path').extname(userInput));
  const inputDir = require('path').dirname(userInput);
  const resultDir = require('path').join(config.output.directory, inputDir);
  
  resultManager.save(results, userInput, timestamp);
  resultManager.saveGeneratedData(generatedData, userInput, timestamp, executedTestCases);
  
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'PASS').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    errors: results.filter(r => r.status === 'ERROR').length
  };
  console.log('Test Summary:', summary);

  if (generateExcel || appendExcel) {
    const ExcelConverter = require('./lib/ExcelConverter');
    const testCasesFile = require('path').join(resultDir, `${baseName}_${timestamp}.json`);
    const resultsFile = require('path').join(resultDir, `${baseName}_result_${timestamp}.json`);
    ExcelConverter.convert(testCasesFile, resultsFile, resultDir, appendExcel);
  }
}

main().catch(console.error);