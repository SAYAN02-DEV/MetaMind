// Test real-time activity tracking functionality
import activityTracker from './activityTracker.js';

export async function testRealTimeTracking() {
  console.log('=== Testing Real-Time Activity Tracking ===');
  
  // Test 1: Check if we're in Electron
  const isElectron = activityTracker.isElectronApp();
  console.log('Running in Electron:', isElectron);
  
  if (!isElectron) {
    console.log('Activity tracking only works in Electron app');
    return { success: false, reason: 'Not in Electron' };
  }
  
  // Test 2: Get current active window
  try {
    const activeWindow = await activityTracker.getCurrentActiveWindow();
    console.log('Current active window:', activeWindow);
  } catch (error) {
    console.error('Failed to get active window:', error);
  }
  
  // Test 3: Check tracking status
  const status = activityTracker.getTrackingStatus();
  console.log('Current tracking status:', status);
  
  // Test 4: Load existing activity data
  try {
    const existingData = await activityTracker.getActivityData();
    console.log('Existing activity data:', existingData);
  } catch (error) {
    console.error('Failed to load existing data:', error);
  }
  
  // Test 5: Simulate a session manually
  console.log('Simulating manual session...');
  const testSession = {
    app: 'ManualTestApp',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 5000).toISOString(), // 5 seconds later
    duration: 5,
    title: 'Manual Test Session',
    url: ''
  };
  
  // Add to completed sessions and trigger sync
  activityTracker.completedSessions.push({
    ...testSession,
    category: activityTracker.categorizeApp(testSession.app)
  });
  
  console.log('Triggering manual sync...');
  await activityTracker.syncToStorage();
  
  // Test 6: Verify the data was saved
  try {
    const updatedData = await activityTracker.getActivityData();
    console.log('Updated activity data after manual sync:', updatedData);
  } catch (error) {
    console.error('Failed to load updated data:', error);
  }
  
  return {
    success: true,
    isElectron,
    status,
    testSession
  };
}

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.testRealTimeTracking = testRealTimeTracking;
}
