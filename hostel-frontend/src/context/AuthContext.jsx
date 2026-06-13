'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage (set after a real login)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Corrupted storage — clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, expectedRole = 'student') => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password, role: expectedRole });

      if (response.data.success) {
        const serverData = response.data.data || response.data;
        const loggedUser = {
          ...(serverData.user || {}),
          // Ensure role is always derived from the actual user record, not just the email
          role: serverData.user?.role || expectedRole,
        };

        setUser(loggedUser);
        localStorage.setItem('token', serverData.token || '');
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: errorMsg };
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
