const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelConverter {
  static convert(testCasesFile, resultsFile, outputDir, append = false) {
    const testCases = JSON.parse(fs.readFileSync(testCasesFile, 'utf8'));
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    const baseName = path.basename(testCasesFile, path.extname(testCasesFile)).replace(/_\d{4}-\d{2}-\d{2}_.*/, '');
    const timestamp = path.basename(testCasesFile, path.extname(testCasesFile)).match(/_(.*)$/)?.[1] || '';
    const rows = [];

    testCases.tests.forEach((test, index) => {
      const result = results[index] || {};
      
      const testSteps = test.actions.map((action, i) => {
        const actionType = Array.isArray(action.type) ? action.type[0] : action.type;
        return `${i + 1}. ${actionType} ${action.selector || ''}`;
      }).join('\n');

      const inputData = test.actions.map(action => {
        if (action.generatedValue) return action.generatedValue;
        if (action.value) return action.value;
        return '';
      }).filter(v => v).join(', ');

      const expectedResult = [
        test.expectedUrlContains ? `URL contains: ${test.expectedUrlContains}` : '',
        test.expectedText ? `Text: ${test.expectedText.join(', ')}` : ''
      ].filter(v => v).join('\n');

      const actualResult = result.failures ? result.failures.join('\n') : result.url || '';

      rows.push({
        'Testcase ID': baseName,
        'Test Name': test.name || '',
        'Description': test.description || '',
        'Execution Time': timestamp,
        'Test Steps': testSteps,
        'Input Data': inputData,
        'Expected Result': expectedResult,
        'Actual Result': actualResult,
        'Execution Status': result.status || 'N/A'
      });
    });

    const excelFile = path.join(outputDir, 'TestResults.xlsx');
    let workbook;
    let worksheet;
    let existingData = [];

    if (append && fs.existsSync(excelFile)) {
      workbook = XLSX.readFile(excelFile);
      worksheet = workbook.Sheets['Test Results'];
      existingData = XLSX.utils.sheet_to_json(worksheet);
      existingData.push(...rows);
      worksheet = XLSX.utils.json_to_sheet(existingData);
      workbook.Sheets['Test Results'] = worksheet;
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Results');
    }

    XLSX.writeFile(workbook, excelFile);
    console.log(`Excel report ${append ? 'appended to' : 'saved to'} ${excelFile}`);
  }
}

module.exports = ExcelConverter;
