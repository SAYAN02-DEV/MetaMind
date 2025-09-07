// Direct test of storage functionality
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const STORAGE_DIR = path.join(os.homedir(), '.metamind');

async function testDirectStorage() {
  console.log('Testing direct storage functionality...');
  console.log('Storage directory:', STORAGE_DIR);
  
  // Ensure directory exists
  try {
    await fs.access(STORAGE_DIR);
    console.log('Storage directory exists');
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    console.log('Created storage directory');
  }
  
  // Test data
  const testData = {
    timestamp: new Date().toISOString(),
    message: 'Direct storage test',
    activityData: {
      '2025-09-07': {
        'TestApp': {
          app: 'TestApp',
          category: 'development',
          duration: 300,
          sessions: [
            {
              startTime: '2025-09-07T07:00:00.000Z',
              endTime: '2025-09-07T07:05:00.000Z',
              duration: 300,
              title: 'Test Window'
            }
          ]
        }
      }
    }
  };
  
  // Write test file
  const testFilePath = path.join(STORAGE_DIR, 'direct_test.json');
  await fs.writeFile(testFilePath, JSON.stringify(testData, null, 2));
  console.log('Test file written:', testFilePath);
  
  // Read test file
  const readData = await fs.readFile(testFilePath, 'utf8');
  const parsedData = JSON.parse(readData);
  console.log('Test file read successfully:', parsedData.message);
  
  // List all files in storage directory
  const files = await fs.readdir(STORAGE_DIR);
  console.log('Files in storage directory:', files);
  
  return { success: true, files };
}

testDirectStorage().catch(console.error);
