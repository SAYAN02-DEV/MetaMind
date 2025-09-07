
class ActivityTracker {
  constructor() {
    this.isTracking = false;
    this.currentSessions = new Map(); // Track ongoing sessions by app name
    this.completedSessions = [];
    this.syncInterval = null;
    this.autoSyncIntervalMs = 10000; // 10 seconds for direct server sync
    this.authToken = null;
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
      console.log('🚀 STARTING: Online-only activity tracking...');
      
      // Get auth token from localStorage
      await this.loadAuthToken();
      
      if (!this.authToken) {
        console.error('❌ FAILED: No auth token found. Please login first.');
        return false;
      }
      
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
        
        console.log('✅ TRACKING ACTIVE: Direct server sync every', this.autoSyncIntervalMs/1000, 'seconds');
        
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
        
        // Send any remaining sessions before stopping
        if (this.completedSessions.length > 0) {
          await this.syncToServer();
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
    if (this.completedSessions.length >= 5) {
      this.syncToServer();
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
      this.syncToServer();
    }, this.autoSyncIntervalMs);
  }

  // Stop auto-sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Load auth token from localStorage
  async loadAuthToken() {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      this.authToken = authData.token || null;
      console.log('Auth token loaded:', !!this.authToken);
    } catch (error) {
      console.error('Failed to load auth token:', error);
      this.authToken = null;
    }
  }


  // Sync directly to server (online-only)
  async syncToServer() {
    if (this.completedSessions.length === 0) {
      console.log('No completed sessions to sync');
      return;
    }

    if (!this.authToken) {
      console.error('❌ NO AUTH: Missing token, cannot sync to server');
      return;
    }

    try {
      // Group sessions by app
      const appsData = {};
      
      for (const session of this.completedSessions) {
        const appName = session.app;
        
        if (!appsData[appName]) {
          appsData[appName] = {
            app: appName,
            category: session.category,
            duration: 0,
            sessions: []
          };
        }

        appsData[appName].sessions.push({
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.duration,
          title: session.title || '',
          url: session.url || ''
        });

        appsData[appName].duration += session.duration;
      }

      // Prepare data for server
      const today = new Date().toISOString().split('T')[0];
      const serverData = {
        date: today,
        apps: Object.values(appsData)
      };

      console.log(`📤 UPLOADING: ${this.completedSessions.length} sessions across ${Object.keys(appsData).length} apps to backend...`);

      // Send to server using the /activities endpoint
      const response = await fetch('http://localhost:3000/api/users/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': this.authToken
        },
        body: JSON.stringify(serverData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`🚀 SUCCESS: Uploaded ${this.completedSessions.length} sessions to backend! ✅`, result.message);
        
        // Clear completed sessions after successful sync
        this.completedSessions = [];
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ FAILED: Could not upload to backend!`, response.statusText, errorData);
        
        // If auth error, try to reload token
        if (response.status === 401 || response.status === 403) {
          await this.loadAuthToken();
        }
      }

    } catch (error) {
      console.error('🔥 ERROR: Server sync failed!', error);
    }
  }


  // Get current activity data (online-only - returns current session stats)
  async getActivityData(date = null) {
    // Return current session data since we don't store locally anymore
    const appsData = {};
    
    // Add current active sessions
    this.currentSessions.forEach(session => {
      const appName = session.app;
      if (!appsData[appName]) {
        appsData[appName] = {
          app: appName,
          category: session.category,
          duration: 0,
          sessions: []
        };
      }
      
      // Calculate current session duration
      const now = new Date();
      const startTime = new Date(session.startTime);
      const currentDuration = Math.round((now - startTime) / 1000);
      
      appsData[appName].sessions.push({
        startTime: session.startTime,
        endTime: null, // Still active
        duration: currentDuration,
        title: session.title || '',
        url: session.url || ''
      });
      
      appsData[appName].duration += currentDuration;
    });
    
    return appsData;
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
