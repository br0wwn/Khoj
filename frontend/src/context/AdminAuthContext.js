import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if admin is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        try {
          const baseUrl = API_BASE_URL || 'http://localhost:5001';
          const response = await axios.get(`${baseUrl}/api/admin/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setAdmin(response.data.admin);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('adminToken');
          setToken(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const baseUrl = API_BASE_URL || 'http://localhost:5001';
      const response = await axios.post(`${baseUrl}/api/admin/auth/login`, {
        email,
        password
      });
      
      const { admin, token } = response.data;
      localStorage.setItem('adminToken', token);
      setToken(token);
      setAdmin(admin);
      return { success: true, admin };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      const baseUrl = API_BASE_URL || 'http://localhost:5001';
      await axios.post(`${baseUrl}/api/admin/auth/logout`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Logout error:', error);
      }
    } finally {
      localStorage.removeItem('adminToken');
      setToken(null);
      setAdmin(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const signup = async (data) => {
    try {
      const baseUrl = API_BASE_URL || 'http://localhost:5001';
      const response = await axios.post(`${baseUrl}/api/admin/auth/signup`, data);
      
      const { admin, token } = response.data;
      localStorage.setItem('adminToken', token);
      setToken(token);
      setAdmin(admin);
      return { success: true, admin };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const value = {
    admin,
    loading,
    token,
    login,
    logout,
    signup,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
