'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted session
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    } else {
      // Default mock user to ensure dashboards are immediately accessible without logging in
      const defaultUser = {
        id: 1,
        name: 'Sarah Miller',
        email: 'warden@campusstay.com',
        role: 'warden'
      };
      setUser(defaultUser);
      localStorage.setItem('user', JSON.stringify(defaultUser));
      localStorage.setItem('token', 'mock-jwt-token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password, expectedRole = 'student') => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password, role: expectedRole });
      if (response.data.success) {
        const loggedUser = {
          ...response.data.user,
          role: email.includes('admin') ? 'admin' : email.includes('warden') ? 'warden' : 'student'
        };
        setUser(loggedUser);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
