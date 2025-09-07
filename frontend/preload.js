const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Storage operations for offline functionality
  storage: {
    read: (filename) => ipcRenderer.invoke('storage-read', filename),
    write: (filename, data) => ipcRenderer.invoke('storage-write', filename, data)
  },
  
  // Network and server checks
  checkServer: () => ipcRenderer.invoke('check-server'),
  
  // System information
  getStorageDir: () => ipcRenderer.invoke('get-storage-dir'),
  
  // Activity tracking with active-win
  activityTracker: {
    getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
    startTracking: (intervalMs) => ipcRenderer.invoke('start-activity-tracking', intervalMs),
    stopTracking: () => ipcRenderer.invoke('stop-activity-tracking'),
    onSessionStarted: (callback) => ipcRenderer.on('app-session-started', callback),
    onSessionEnded: (callback) => ipcRenderer.on('app-session-ended', callback),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('app-session-started');
      ipcRenderer.removeAllListeners('app-session-ended');
    }
  },
  
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Optional: Add event listeners for window events
window.addEventListener('DOMContentLoaded', () => {
  // You can add any initialization code here
  console.log('MetaMind Electron App Loaded');
});
