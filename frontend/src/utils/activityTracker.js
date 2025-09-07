import offlineStorage from './offlineStorage.js';

class ActivityTracker {
  constructor() {
    this.isTracking = false;
    this.currentSessions = new Map(); // Track ongoing sessions by app name
    this.completedSessions = [];
    this.syncInterval = null;
    this.autoSyncIntervalMs = 30000; // 30 seconds
  }

  // Check if we're running in Electron (dynamic check)
  get isElectron() {
    const hasElectronAPI = typeof window !== 'undefined' && window.electronAPI;
    console.log('ActivityTracker isElectron check:', hasElectronAPI, !!window.electronAPI);
    return hasElectronAPI;
  }

  // Check if we're running in Electron
  isElectronApp() {
    return this.isElectron;
  }

  // Start activity tracking
  async startTracking(intervalMs = 5000) {
    if (!this.isElectron) {
      console.warn('Activity tracking only available in Electron app');
      return false;
    }

    try {
      console.log('🚀 STARTING: Activity tracking initialization...');
      
      // Load sync state first
      await this.loadSyncState();
      
      // Set up event listeners for session events
      window.electronAPI.activityTracker.onSessionStarted((event, session) => {
        console.log('📱 SESSION STARTED:', session.app);
        this.handleSessionStarted(session);
      });

      window.electronAPI.activityTracker.onSessionEnded((event, session) => {
        console.log('⏹️ SESSION ENDED:', session.app, `(${session.duration}s)`);
        this.handleSessionEnded(session);
      });

      // Start tracking on the main process
      const result = await window.electronAPI.activityTracker.startTracking(intervalMs);
      
      if (result) {
        this.isTracking = true;
        this.startAutoSync();
        
        console.log('✅ TRACKING ACTIVE: Monitoring apps every', intervalMs/1000, 'seconds');
        
        // Perform initial full sync
        setTimeout(() => {
          console.log('🔄 INITIAL SYNC: Checking for pending data...');
          this.performFullSync();
        }, 5000);
        
        // Set up periodic full sync every 10 minutes
        this.fullSyncInterval = setInterval(() => {
          console.log('⏰ PERIODIC SYNC: Running scheduled sync...');
          this.performFullSync();
        }, 10 * 60 * 1000);
        
        return true;
      } else {
        console.error('❌ FAILED: Could not start activity tracking');
        return false;
      }
    } catch (error) {
      console.error('🔥 ERROR: Activity tracking startup failed!', error);
      return false;
    }
  }

  // Stop activity tracking
  async stopTracking() {
    if (!this.isElectron) {
      return false;
    }

    try {
      const result = await window.electronAPI.activityTracker.stopTracking();
      
      if (result) {
        this.isTracking = false;
        this.stopAutoSync();
        
        // Clear periodic sync interval
        if (this.fullSyncInterval) {
          clearInterval(this.fullSyncInterval);
          this.fullSyncInterval = null;
        }
        
        console.log('🛑 STOPPED: Activity tracking disabled');
        return true;
      } else {
        console.error('❌ FAILED: Could not stop activity tracking');
        return false;
      }
    } catch (error) {
      console.error('🔥 ERROR: Activity tracking stop failed!', error);
      return false;
    }
  }

  // Handle new session started
  handleSessionStarted(session) {
    console.log('Session started:', session);
    
    // Store the session as ongoing
    this.currentSessions.set(session.app, {
      ...session,
      category: this.categorizeApp(session.app)
    });
  }

  // Handle session ended
  handleSessionEnded(session) {
    console.log('Session ended:', session);
    
    // Calculate duration
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const duration = Math.round((endTime - startTime) / 1000); // Duration in seconds

    const completedSession = {
      ...session,
      duration,
      category: this.categorizeApp(session.app)
    };

    // Add to completed sessions
    this.completedSessions.push(completedSession);
    
    // Remove from current sessions
    this.currentSessions.delete(session.app);

    // Trigger immediate sync if we have many completed sessions
    if (this.completedSessions.length >= 10) {
      this.syncToStorage();
    }
  }

  // Categorize apps based on their names
  categorizeApp(appName) {
    const app = appName.toLowerCase();
    
    if (app.includes('code') || app.includes('studio') || app.includes('terminal') || 
        app.includes('git') || app.includes('vim') || app.includes('emacs') ||
        app.includes('intellij') || app.includes('eclipse') || app.includes('atom')) {
      return 'development';
    }
    
    if (app.includes('chrome') || app.includes('firefox') || app.includes('safari') || 
        app.includes('edge') || app.includes('browser')) {
      return 'browsing';
    }
    
    if (app.includes('word') || app.includes('excel') || app.includes('powerpoint') || 
        app.includes('office') || app.includes('docs') || app.includes('sheets') ||
        app.includes('notion') || app.includes('obsidian')) {
      return 'productivity';
    }
    
    if (app.includes('slack') || app.includes('teams') || app.includes('discord') || 
        app.includes('zoom') || app.includes('skype') || app.includes('telegram') ||
        app.includes('whatsapp')) {
      return 'communication';
    }
    
    if (app.includes('spotify') || app.includes('music') || app.includes('video') || 
        app.includes('netflix') || app.includes('youtube') || app.includes('game')) {
      return 'entertainment';
    }
    
    return 'other';
  }

  // Start auto-sync
  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncToStorage();
    }, this.autoSyncIntervalMs);
  }

  // Stop auto-sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync completed sessions to storage
  async syncToStorage() {
    console.log(`Syncing ${this.completedSessions.length} completed sessions to storage`);
    
    if (this.completedSessions.length === 0) {
      console.log('No completed sessions to sync');
      return;
    }

    try {
      // Get current date for grouping
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      console.log('Syncing data for date:', today);

      // Load existing activity data
      console.log('Loading existing activity data...');
      let activityData = await offlineStorage.retrieve('activity_data') || {};
      console.log('Existing activity data:', activityData);
      
      // Initialize today's data if it doesn't exist
      if (!activityData[today]) {
        activityData[today] = {};
        console.log('Initialized data for today');
      }

      // Process completed sessions
      for (const session of this.completedSessions) {
        const appName = session.app;
        
        // Initialize app data if it doesn't exist
        if (!activityData[today][appName]) {
          activityData[today][appName] = {
            app: appName,
            category: session.category,
            duration: 0,
            sessions: []
          };
        }

        // Add session data
        activityData[today][appName].sessions.push({
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.duration,
          title: session.title || '',
          url: session.url || ''
        });

        // Update total duration
        activityData[today][appName].duration += session.duration;
      }

      // Save to storage
      console.log('Saving activity data to storage:', activityData);
      const saveResult = await offlineStorage.store('activity_data', activityData);
      console.log('Storage save result:', saveResult);
      
      if (saveResult) {
        console.log(`Successfully synced ${this.completedSessions.length} sessions to storage`);
        
        // Clear completed sessions after successful sync
        this.completedSessions = [];

        // Try to sync to server if online
        await this.syncToServer(activityData[today]);
      } else {
        console.error('Failed to save activity data to storage');
      }

    } catch (error) {
      console.error('Failed to sync activity data to storage:', error);
    }
  }

  // Track synced sessions to prevent duplicates
  syncedSessions = new Set();
  lastSyncTimestamp = null;

  // Generate unique session ID
  generateSessionId(session) {
    return `${session.app}_${session.startTime}_${session.endTime}_${session.duration}`;
  }

  // Check if session was already synced
  isSessionSynced(session) {
    const sessionId = this.generateSessionId(session);
    return this.syncedSessions.has(sessionId);
  }

  // Mark session as synced
  markSessionSynced(session) {
    const sessionId = this.generateSessionId(session);
    this.syncedSessions.add(sessionId);
  }

  // Sync to server (if online) with duplicate prevention
  async syncToServer(todayData) {
    try {
      // Check if server is available
      const isOnline = await offlineStorage.checkServerConnection();
      if (!isOnline) {
        console.log('📡 OFFLINE: Server not available, data stored locally 💾');
        return;
      }

      // Get auth data
      const authData = await offlineStorage.retrieveAuth();
      if (!authData || !authData.token) {
        console.log('🔐 NO AUTH: Missing token, skipping server sync 🚫');
        return;
      }

      // Filter out already synced sessions
      const newAppsData = [];
      let totalNewSessions = 0;

      Object.values(todayData).forEach(appData => {
        const newSessions = appData.sessions.filter(session => !this.isSessionSynced(session));
        
        if (newSessions.length > 0) {
          const newDuration = newSessions.reduce((sum, session) => sum + session.duration, 0);
          
          newAppsData.push({
            app: appData.app,
            duration: newDuration,
            sessions: newSessions.map(session => ({
              startTime: session.startTime,
              endTime: session.endTime,
              duration: session.duration,
              title: session.title || '',
              url: session.url || ''
            }))
          });
          
          totalNewSessions += newSessions.length;
        }
      });

      if (newAppsData.length === 0) {
        console.log('💤 SKIP: No new sessions to sync to server');
        return;
      }

      // Prepare data for server
      const today = new Date().toISOString().split('T')[0];
      const serverData = {
        date: today,
        apps: newAppsData
      };

      console.log(`📤 UPLOADING: ${totalNewSessions} new sessions across ${newAppsData.length} apps to backend... 🔄`);

      // Send to server using the /activities endpoint
      const response = await fetch('http://localhost:3000/api/users/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': authData.token // Use 'token' header as expected by backend
        },
        body: JSON.stringify(serverData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`🚀 SUCCESS: Uploaded ${totalNewSessions} sessions to backend! ✅`, result.message);
        
        // Mark sessions as synced
        Object.values(todayData).forEach(appData => {
          appData.sessions.forEach(session => {
            this.markSessionSynced(session);
          });
        });
        
        this.lastSyncTimestamp = Date.now();
        
        // Store sync state to localStorage
        await this.saveSyncState();
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ FAILED: Could not upload to backend! 😞`, response.statusText, errorData);
      }

    } catch (error) {
      console.error('🔥 ERROR: Server sync failed! 💥', error);
    }
  }

  // Save sync state to prevent duplicates across app restarts
  async saveSyncState() {
    try {
      const syncState = {
        syncedSessions: Array.from(this.syncedSessions),
        lastSyncTimestamp: this.lastSyncTimestamp
      };
      await offlineStorage.store('activity_sync_state', syncState);
    } catch (error) {
      console.error('Failed to save sync state:', error);
    }
  }

  // Load sync state to restore duplicate prevention
  async loadSyncState() {
    try {
      const syncState = await offlineStorage.retrieve('activity_sync_state');
      if (syncState) {
        this.syncedSessions = new Set(syncState.syncedSessions || []);
        this.lastSyncTimestamp = syncState.lastSyncTimestamp;
        console.log(`Loaded sync state: ${this.syncedSessions.size} synced sessions`);
      }
    } catch (error) {
      console.error('Failed to load sync state:', error);
    }
  }

  // Periodic full sync for any missed data
  async performFullSync() {
    if (!this.isElectron) return;

    try {
      console.log('🔍 SYNC CHECK: Looking for data to sync...');
      const todayData = await this.getTodayData();
      
      if (todayData && todayData.sessions && todayData.sessions.length > 0) {
        console.log(`📊 FOUND DATA: ${todayData.sessions.length} sessions for today`);
        await this.syncToServer(todayData);
      } else {
        console.log('📭 NO DATA: No sessions found to sync');
      }
    } catch (error) {
      console.error('🔥 SYNC ERROR: Full sync failed!', error);
    }
  }

  // Get current activity data
  async getActivityData(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const activityData = await offlineStorage.retrieve('activity_data') || {};
    return activityData[targetDate] || {};
  }

  // Get today's activity data for syncing
  async getTodayData() {
    const today = new Date().toISOString().split('T')[0];
    const activityData = await offlineStorage.retrieve('activity_data') || {};
    const todayData = activityData[today];
    
    if (!todayData) {
      return null;
    }

    // Convert the data format to match what syncToServer expects
    return {
      date: today,
      sessions: todayData.sessions || [],
      apps: todayData.apps || []
    };
  }

  // Get tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      currentSessions: Array.from(this.currentSessions.values()),
      completedSessionsCount: this.completedSessions.length,
      isElectron: this.isElectron
    };
  }

  // Get current active window (for testing)
  async getCurrentActiveWindow() {
    if (!this.isElectron) {
      return null;
    }

    try {
      return await window.electronAPI.activityTracker.getActiveWindow();
    } catch (error) {
      console.error('Failed to get active window:', error);
      return null;
    }
  }

  // Clear all activity data
  async clearAllData() {
    try {
      await offlineStorage.store('activity_data', {});
      this.completedSessions = [];
      this.currentSessions.clear();
      console.log('All activity data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear activity data:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const activityTracker = new ActivityTracker();
export default activityTracker;
