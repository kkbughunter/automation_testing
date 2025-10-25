const fs = require('fs');
const path = require('path');

class ResultManager {
  constructor(outputDir = './result') {
    this.outputDir = outputDir;
  }

  save(results, inputFilename) {
    const filename = this.generateResultFilename(inputFilename);
    const inputDir = path.dirname(inputFilename);
    const resultDir = path.join(this.outputDir, inputDir);
    const filePath = path.join(resultDir, filename);
    
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${filePath}`);
  }

  generateResultFilename(inputFilename) {
    const baseName = path.basename(inputFilename, path.extname(inputFilename));
    return `${baseName}_result.json`;
  }

  generateReport(results) {
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      errors: results.filter(r => r.status === 'ERROR').length
    };
    
    console.log('Test Summary:', summary);
    return summary;
  }
}

module.exports = ResultManager;