const fs = require('fs');

class TestLoader {
  static load(userInput) {
    const filePath = `./src/${userInput}`;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

module.exports = TestLoader;