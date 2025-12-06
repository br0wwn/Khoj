import React, { createContext, useState, useContext, useEffect } from 'react';
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

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
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
        setUser(type === 'police' ? response.police : response.user);
        setUserType(type);
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
        setUser(type === 'police' ? response.police : response.user);
        setUserType(type);
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
