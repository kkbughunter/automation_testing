# Test Automation Suite

## Setup

### 1. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install React UI dependencies
cd test-ui
npm install
cd ..
```

### 2. Install Additional Server Dependencies
```bash
npm install express cors
```

## Running the Application

### Start the Test Server (Terminal 1)
```bash
node src/server.js
```

### Start the React UI (Terminal 2)
```bash
cd test-ui
npm run dev
```

## Usage

1. Open the React UI in your browser (usually http://localhost:5173)
2. Click "Select Test JSON File" and choose a test case JSON file
3. Click "Run Tests" to execute the tests
4. View results in the UI
5. Test results are automatically saved in the `result/` folder with timestamps

## Test JSON Format

See `test-cases/test-case0.json` for example format.
