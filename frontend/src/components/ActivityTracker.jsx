import React, { useState, useEffect } from 'react';
import activityTracker from '../utils/activityTracker.js';
import { testOfflineStorage } from '../utils/testOfflineStorage.js';
import { testRealTimeTracking } from '../utils/testRealTimeTracking.js';

const ActivityTracker = () => {
  const [trackingStatus, setTrackingStatus] = useState({
    isTracking: false,
    currentSessions: [],
    completedSessionsCount: 0,
    isElectron: false
  });
  const [currentApp, setCurrentApp] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    totalApps: 0,
    totalSessions: 0,
    totalDuration: 0
  });

  // Update tracking status
  const updateStatus = () => {
    const status = activityTracker.getTrackingStatus();
    console.log('ActivityTracker updateStatus:', status);
    setTrackingStatus(status);
    
    // Update current app from active sessions
    if (status.currentSessions.length > 0) {
      setCurrentApp(status.currentSessions[status.currentSessions.length - 1]);
    } else {
      setCurrentApp(null);
    }
  };

  // Load session stats
  const loadSessionStats = async () => {
    try {
      const todayData = await activityTracker.getActivityData();
      const apps = Object.values(todayData);
      
      const stats = {
        totalApps: apps.length,
        totalSessions: apps.reduce((sum, app) => sum + app.sessions.length, 0),
        totalDuration: apps.reduce((sum, app) => sum + app.duration, 0)
      };
      
      setSessionStats(stats);
    } catch (error) {
      console.error('Failed to load session stats:', error);
    }
  };

  useEffect(() => {
    updateStatus();
    loadSessionStats();

    // Update status every 5 seconds
    const statusInterval = setInterval(() => {
      updateStatus();
      loadSessionStats();
    }, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const handleStartTracking = async () => {
    const success = await activityTracker.startTracking();
    if (success) {
      updateStatus();
    }
  };

  const handleStopTracking = async () => {
    const success = await activityTracker.stopTracking();
    if (success) {
      updateStatus();
      setCurrentApp(null);
    }
  };

  const handleTestStorage = async () => {
    console.log('Running offline storage test...');
    try {
      const result = await testOfflineStorage();
      console.log('Storage test completed:', result);
    } catch (error) {
      console.error('Storage test failed:', error);
    }
  };

  const handleTestRealTime = async () => {
    console.log('Running real-time tracking test...');
    try {
      const result = await testRealTimeTracking();
      console.log('Real-time test completed:', result);
    } catch (error) {
      console.error('Real-time test failed:', error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      development: 'bg-blue-500',
      productivity: 'bg-green-500',
      browsing: 'bg-purple-500',
      communication: 'bg-yellow-500',
      entertainment: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[category] || colors.other;
  };

  // Debug: Always show component for testing, but indicate if not in Electron
  console.log('ActivityTracker render - isElectron:', trackingStatus.isElectron);
  console.log('ActivityTracker render - window.electronAPI:', !!window.electronAPI);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 min-w-80 max-w-96">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Activity Tracker</h3>
          <div className={`w-3 h-3 rounded-full ${trackingStatus.isTracking ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>

        {/* Current App */}
        {currentApp && (
          <div className="mb-3 p-2 bg-gray-700 rounded">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${getCategoryColor(currentApp.category)}`}></div>
              <span className="text-white text-xs font-medium truncate">{currentApp.app}</span>
            </div>
            <div className="text-gray-400 text-xs">
              Started: {new Date(currentApp.startTime).toLocaleTimeString()}
            </div>
            {currentApp.title && (
              <div className="text-gray-400 text-xs truncate mt-1">
                {currentApp.title}
              </div>
            )}
          </div>
        )}

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gray-700 rounded p-2">
            <div className="text-white text-sm font-semibold">{sessionStats.totalApps}</div>
            <div className="text-gray-400 text-xs">Apps</div>
          </div>
          <div className="bg-gray-700 rounded p-2">
            <div className="text-white text-sm font-semibold">{sessionStats.totalSessions}</div>
            <div className="text-gray-400 text-xs">Sessions</div>
          </div>
          <div className="bg-gray-700 rounded p-2">
            <div className="text-white text-sm font-semibold">
              {Math.round(sessionStats.totalDuration / 60)}m
            </div>
            <div className="text-gray-400 text-xs">Total</div>
          </div>
        </div>

        {/* Pending Sessions */}
        {trackingStatus.completedSessionsCount > 0 && (
          <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded">
            <div className="text-yellow-400 text-xs">
              {trackingStatus.completedSessionsCount} sessions pending sync
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!trackingStatus.isTracking ? (
            <button
              onClick={handleStartTracking}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Start Tracking
            </button>
          ) : (
            <button
              onClick={handleStopTracking}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
            >
              Stop Tracking
            </button>
          )}
          
          <button
            onClick={loadSessionStats}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded transition-colors"
            title="Refresh Stats"
          >
            ↻
          </button>
          
          <button
            onClick={handleTestStorage}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-2 rounded transition-colors"
            title="Test Storage"
          >
            Storage
          </button>
          
          <button
            onClick={handleTestRealTime}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-2 rounded transition-colors"
            title="Test Real-Time Tracking"
          >
            Track
          </button>
        </div>

        {/* Status Info */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          {!trackingStatus.isElectron ? (
            <span className="text-red-400">Not in Electron - tracking unavailable</span>
          ) : trackingStatus.isTracking ? (
            'Tracking active apps...'
          ) : (
            'Click Start to begin tracking'
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
