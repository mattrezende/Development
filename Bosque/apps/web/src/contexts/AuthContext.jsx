import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!apiClient.getToken()) {
        setInitialLoading(false);
        return;
      }

      try {
        const { user } = await apiClient.me();
        setCurrentUser(user);
      } catch {
        apiClient.setToken(null);
      } finally {
        setInitialLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await apiClient.login(email, password);
    apiClient.setToken(token);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    apiClient.setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
