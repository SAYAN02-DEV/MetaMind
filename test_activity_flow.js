// Test the complete activity tracking flow
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const STORAGE_DIR = path.join(os.homedir(), '.metamind');

async function testActivityFlow() {
  console.log('Testing complete activity tracking flow...');
  
  // Simulate activity data that should be created
  const testActivityData = {
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
            title: 'Test Window',
            url: ''
          }
        ]
      },
      'Chrome': {
        app: 'Chrome',
        category: 'browsing',
        duration: 600,
        sessions: [
          {
            startTime: '2025-09-07T07:05:00.000Z',
            endTime: '2025-09-07T07:15:00.000Z',
            duration: 600,
            title: 'GitHub - MetaMind',
            url: 'https://github.com'
          }
        ]
      }
    }
  };
  
  // Create the activity_data.json file
  const activityFilePath = path.join(STORAGE_DIR, 'activity_data.json');
  await fs.writeFile(activityFilePath, JSON.stringify(testActivityData, null, 2));
  console.log('Created activity_data.json file:', activityFilePath);
  
  // Create auth.json file
  const authData = {
    token: 'test_token_123',
    user: {
      name: 'Test User',
      email: 'test@example.com',
      occupation: 'Developer'
    },
    loginTime: new Date().toISOString()
  };
  
  const authFilePath = path.join(STORAGE_DIR, 'auth.json');
  await fs.writeFile(authFilePath, JSON.stringify(authData, null, 2));
  console.log('Created auth.json file:', authFilePath);
  
  // Create usage.json file
  const usageData = {
    '2025-09-07': {
      'VS Code': { duration: 1800, sessions: 3 },
      'Chrome': { duration: 1200, sessions: 5 },
      'Terminal': { duration: 600, sessions: 2 }
    }
  };
  
  const usageFilePath = path.join(STORAGE_DIR, 'usage.json');
  await fs.writeFile(usageFilePath, JSON.stringify(usageData, null, 2));
  console.log('Created usage.json file:', usageFilePath);
  
  // List all files
  const files = await fs.readdir(STORAGE_DIR);
  console.log('All files in storage directory:', files);
  
  return { success: true, files };
}

testActivityFlow().catch(console.error);
