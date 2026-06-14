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
        // Background refresh to keep user state (e.g. room allocation) in sync with DB
        axios.get('/auth/me')
          .then(response => {
            if (response.data.success) {
              setUser(response.data.data);
              localStorage.setItem('user', JSON.stringify(response.data.data));
            }
          })
          .catch(err => {
            console.warn('Background user sync failed:', err);
          });
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
      console.warn('Login error:', err.response?.data?.error || err.message || err);
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (err) {
      console.warn('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, showToast, refreshUser }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-xs font-bold text-white bg-slate-900/95 border border-slate-800/80 backdrop-blur-md transition-all duration-300">
          {toast.type === 'error' ? (
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
          ) : toast.type === 'info' ? (
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0"></div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
          )}
          <span>{toast.message}</span>
        </div>
      )}
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
