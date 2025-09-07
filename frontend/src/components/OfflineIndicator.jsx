import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import offlineStorage from '../utils/offlineStorage';

const OfflineIndicator = ({ onSyncRequest }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check connection status
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await offlineStorage.checkServerConnection();
      setIsOnline(connected);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle manual sync
  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await checkConnection();
      if (isOnline && onSyncRequest) {
        await onSyncRequest();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Check connection on mount and set up interval
  useEffect(() => {
    checkConnection();
    
    // Check connection every 5 seconds
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen to browser online/offline events (fallback for web)
  useEffect(() => {
    if (!offlineStorage.isElectronApp()) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const getStatusColor = () => {
    if (isSyncing) return 'text-yellow-500';
    if (isOnline) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const getIcon = () => {
    if (isSyncing || isChecking) {
      return <RefreshCw className={`w-4 h-4 animate-spin ${getStatusColor()}`} />;
    }
    if (isOnline) {
      return <Wifi className={`w-4 h-4 ${getStatusColor()}`} />;
    }
    return <WifiOff className={`w-4 h-4 ${getStatusColor()}`} />;
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
      {getIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {!isOnline && !isSyncing && (
        <button
          onClick={handleSync}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isSyncing}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator;
