import React, { createContext, useContext, useState, useEffect } from 'react';
import offlineStorage from '../utils/offlineStorage.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // Try to load from offline storage first (for Electron)
        const authData = await offlineStorage.retrieveAuth();
        if (authData && authData.token) {
          setIsLoggedIn(true);
          setUser(authData.user || {
            name: 'Alex Johnson',
            email: 'alex@example.com',
            occupation: 'Software Developer'
          });
        } else {
          // Fallback to localStorage (for web)
          const token = localStorage.getItem('token');
          if (token) {
            setIsLoggedIn(true);
            setUser({
              name: 'Alex Johnson',
              email: 'alex@example.com',
              occupation: 'Software Developer'
            });
          }
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
        // Fallback to localStorage
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
          setUser({
            name: 'Alex Johnson',
            email: 'alex@example.com',
            occupation: 'Software Developer'
          });
        }
      }
      setLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (token, userData) => {
    // Store in localStorage for web compatibility
    localStorage.setItem('token', token);
    
    // Store in offline storage for Electron
    try {
      await offlineStorage.storeAuth({
        token,
        user: userData,
        loginTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to store auth data offline:', error);
    }
    
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async () => {
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Clear offline storage
    try {
      await offlineStorage.storeAuth(null);
    } catch (error) {
      console.error('Failed to clear auth data offline:', error);
    }
    
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
