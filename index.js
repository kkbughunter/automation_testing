const TestRunner = require('./lib/TestRunner');
const TestLoader = require('./tests/TestLoader');
const ResultManager = require('./lib/ResultManager');
const config = require('./config/default');

async function main() {
  const userInput = process.argv[2] || 'test-cases.json';

  const testCases = TestLoader.load(userInput);
  const runner = new TestRunner(config.browser);
  const resultManager = new ResultManager(config.output.directory);

  console.log('Starting test execution...');
  const results = await runner.run(testCases);
  
  resultManager.save(results, userInput);
  resultManager.generateReport(results);
}

main().catch(console.error);