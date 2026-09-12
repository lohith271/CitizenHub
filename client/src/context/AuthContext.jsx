import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('citizenhub_user');
    const token = localStorage.getItem('citizenhub_access_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem('citizenhub_access_token', accessToken);
      localStorage.setItem('citizenhub_refresh_token', refreshToken);
      localStorage.setItem('citizenhub_user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      // If campaigner is pending approval
      if (res.data.isPending) {
        return { success: true, isPending: true, message: res.data.message };
      }
      // If active citizen
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem('citizenhub_access_token', accessToken);
      localStorage.setItem('citizenhub_refresh_token', refreshToken);
      localStorage.setItem('citizenhub_user', JSON.stringify(user));
      setUser(user);
      return { success: true, isPending: false, user };
    }
    return { success: false, message: res.data.message };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Silent error on logout
    }
    localStorage.removeItem('citizenhub_access_token');
    localStorage.removeItem('citizenhub_refresh_token');
    localStorage.removeItem('citizenhub_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('citizenhub_user', JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data.message };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCampaigner: user?.role === 'campaigner',
    isCitizen: user?.role === 'citizen',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
