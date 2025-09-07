// Test script to manually check active-win and simulate data storage
import activeWin from 'active-win';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const STORAGE_DIR = join(homedir(), '.metamind');

async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

async function testActiveWinAndStorage() {
  console.log('🔍 Testing active-win library and data storage...\n');
  
  try {
    // Test active-win
    const window = await activeWin();
    
    if (window) {
      console.log('✅ Active window detected:');
      console.log('  Title:', window.title);
      console.log('  Owner:', window.owner.name);
      console.log('  PID:', window.owner.pid);
      console.log('  Memory:', window.memoryUsage || 0, 'bytes');
      
      // Simulate activity tracking data structure
      const activityData = {
        email: 'test@example.com',
        appUsages: [
          {
            date: new Date().toISOString().split('T')[0],
            apps: [
              {
                app: window.owner.name,
                duration: 5,
                sessions: [
                  {
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 5000).toISOString(),
                    title: window.title,
                    category: 'development',
                    memoryUsage: window.memoryUsage || 0
                  }
                ]
              }
            ]
          }
        ]
      };
      
      // Create storage directory and save test data
      await ensureStorageDir();
      const testFile = join(STORAGE_DIR, 'test_usage.json');
      await fs.writeFile(testFile, JSON.stringify(activityData, null, 2));
      
      console.log('\n✅ Test data saved to:', testFile);
      console.log('\n📁 View saved data with:');
      console.log(`   cat ${testFile}`);
      
      // Show the data structure
      console.log('\n📊 Data structure:');
      console.log(JSON.stringify(activityData, null, 2));
      
    } else {
      console.log('❌ No active window detected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testActiveWinAndStorage();
