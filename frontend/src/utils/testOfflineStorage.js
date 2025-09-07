// Test script to verify offline storage functionality
import offlineStorage from './offlineStorage.js';

export async function testOfflineStorage() {
  console.log('Testing offline storage...');
  
  // Test 1: Check if we're in Electron
  console.log('Is Electron:', offlineStorage.isElectronApp());
  
  // Test 2: Test basic storage
  const testData = {
    timestamp: new Date().toISOString(),
    message: 'Test storage data',
    number: 42
  };
  
  console.log('Storing test data:', testData);
  const storeResult = await offlineStorage.store('test_storage', testData);
  console.log('Store result:', storeResult);
  
  // Test 3: Test retrieval
  const retrievedData = await offlineStorage.retrieve('test_storage');
  console.log('Retrieved data:', retrievedData);
  
  // Test 4: Test activity data storage
  const activityData = {
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
      }
    }
  };
  
  console.log('Storing activity data:', activityData);
  const activityStoreResult = await offlineStorage.store('activity_data', activityData);
  console.log('Activity store result:', activityStoreResult);
  
  // Test 5: Test activity data retrieval
  const retrievedActivityData = await offlineStorage.retrieve('activity_data');
  console.log('Retrieved activity data:', retrievedActivityData);
  
  // Test 6: Get storage directory
  try {
    const storageDir = await offlineStorage.getStorageDirectory();
    console.log('Storage directory:', storageDir);
  } catch (error) {
    console.error('Failed to get storage directory:', error);
  }
  
  return {
    storeResult,
    retrievedData,
    activityStoreResult,
    retrievedActivityData
  };
}

// Auto-run test if in browser console
if (typeof window !== 'undefined' && window.electronAPI) {
  window.testOfflineStorage = testOfflineStorage;
}
