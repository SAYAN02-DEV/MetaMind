class OfflineStorage {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  // Check if we're running in Electron
  isElectronApp() {
    return this.isElectron;
  }

  // Store data locally
  async store(key, data) {
    if (this.isElectron) {
      try {
        console.log(`Storing data for key: ${key}`, data);
        const result = await window.electronAPI.storage.write(`${key}.json`, data);
        console.log(`Storage result for ${key}:`, result);
        return result;
      } catch (error) {
        console.error(`Failed to store data for key ${key}:`, error);
        return false;
      }
    } else {
      // Fallback to localStorage for web
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Failed to store data locally:', error);
        return false;
      }
    }
  }

  // Retrieve data locally
  async retrieve(key) {
    if (this.isElectron) {
      try {
        console.log(`Retrieving data for key: ${key}`);
        const result = await window.electronAPI.storage.read(`${key}.json`);
        console.log(`Retrieved data for ${key}:`, result);
        return result;
      } catch (error) {
        console.error(`Failed to retrieve data for key ${key}:`, error);
        return null;
      }
    } else {
      // Fallback to localStorage for web
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Failed to retrieve data locally:', error);
        return null;
      }
    }
  }

  // Check server connectivity
  async checkServerConnection() {
    if (this.isElectron) {
      return await window.electronAPI.checkServer();
    } else {
      // Fallback for web - try to fetch from server
      try {
        const response = await fetch('http://localhost:3000/api/health', {
          method: 'GET',
          timeout: 3000
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    }
  }

  // Get storage directory (Electron only)
  async getStorageDirectory() {
    if (this.isElectron) {
      return await window.electronAPI.getStorageDir();
    }
    return null;
  }

  // Store user authentication data
  async storeAuth(authData) {
    return await this.store('auth', authData);
  }

  // Retrieve user authentication data
  async retrieveAuth() {
    return await this.retrieve('auth');
  }

  // Store usage/dashboard data
  async storeUsageData(usageData) {
    return await this.store('usage', usageData);
  }

  // Retrieve usage/dashboard data
  async retrieveUsageData() {
    return await this.retrieve('usage');
  }

  // Store chat history
  async storeChatHistory(chatData) {
    return await this.store('chat_history', chatData);
  }

  // Retrieve chat history
  async retrieveChatHistory() {
    return await this.retrieve('chat_history');
  }

  // Store app settings
  async storeSettings(settings) {
    return await this.store('settings', settings);
  }

  // Retrieve app settings
  async retrieveSettings() {
    return await this.retrieve('settings');
  }

  // Clear all stored data
  async clearAll() {
    if (this.isElectron) {
      const keys = ['auth', 'usage', 'chat_history', 'settings'];
      const promises = keys.map(key => this.store(key, null));
      return Promise.all(promises);
    } else {
      localStorage.clear();
      return true;
    }
  }

  // Get platform information
  getPlatformInfo() {
    if (this.isElectron) {
      return {
        platform: window.electronAPI.platform,
        versions: window.electronAPI.versions,
        isElectron: true
      };
    } else {
      return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        isElectron: false
      };
    }
  }
}

// Create and export a singleton instance
const offlineStorage = new OfflineStorage();
export default offlineStorage;
