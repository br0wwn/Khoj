import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use ref to store broadcast channel
  const authChannelRef = useRef(null);

  // Initialize broadcast channel
  useEffect(() => {
    // Check if BroadcastChannel is supported (not supported in older browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        // Create broadcast channel for cross-tab communication
        authChannelRef.current = new BroadcastChannel('auth-channel');
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to create BroadcastChannel:', error);
        }
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('BroadcastChannel not supported in this browser');
    }
    
    return () => {
      if (authChannelRef.current) {
        authChannelRef.current.close();
      }
    };
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();

    // Listen for auth changes from other tabs
    const handleAuthMessage = (event) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Received auth message:', event.data);
      }
      if (event.data.type === 'LOGIN') {
        setUser(event.data.user);
        setUserType(event.data.userType);
      } else if (event.data.type === 'LOGOUT') {
        setUser(null);
        setUserType(null);
      } else if (event.data.type === 'AUTH_CHECK') {
        checkAuth();
      }
    };

    if (authChannelRef.current) {
      authChannelRef.current.addEventListener('message', handleAuthMessage);
    }

    // Cleanup
    return () => {
      if (authChannelRef.current) {
        authChannelRef.current.removeEventListener('message', handleAuthMessage);
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Try citizen first
      let response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.user);
        setUserType('citizen');
        setLoading(false);
        return;
      }
    } catch (error) {
      // If citizen check fails, try police
      try {
        const policeResponse = await authService.getCurrentPolice();
        if (policeResponse.success) {
          setUser(policeResponse.police);
          setUserType('police');
          setLoading(false);
          return;
        }
      } catch (policeError) {
        // Both failed
        setUser(null);
        setUserType(null);
      }
    }
    setLoading(false);
  };

  const login = async (credentials, type = 'citizen') => {
    try {
      const response = await authService.login(credentials, type);
      if (response.success) {
        const userData = type === 'police' ? response.police : response.user;
        setUser(userData);
        setUserType(type);
        
        // Notify other tabs about login
        if (authChannelRef.current) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Broadcasting LOGIN to other tabs');
          }
          authChannelRef.current.postMessage({
            type: 'LOGIN',
            user: userData,
            userType: type
          });
        }
        
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (userData, type = 'citizen') => {
    try {
      const response = await authService.signup(userData, type);
      if (response.success) {
        const newUser = type === 'police' ? response.police : response.user;
        setUser(newUser);
        setUserType(type);
        
        // Notify other tabs about signup/login
        if (authChannelRef.current) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Broadcasting SIGNUP/LOGIN to other tabs');
          }
          authChannelRef.current.postMessage({
            type: 'LOGIN',
            user: newUser,
            userType: type
          });
        }
        
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout(userType);
      setUser(null);
      setUserType(null);
      
      // Notify other tabs about logout
      if (authChannelRef.current) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Broadcasting LOGOUT to other tabs');
        }
        authChannelRef.current.postMessage({
          type: 'LOGOUT'
        });
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed'
      };
    }
  };

  const value = {
    user,
    userType,
    setUser,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
