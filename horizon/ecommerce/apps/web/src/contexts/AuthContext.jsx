
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to PocketBase auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      const isAdmin = model?.role === 'admin';
      console.log('Auth state updated:', { currentUser: model, isAdmin });
      setCurrentUser(model);
    });
    
    // Initial check
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    } else {
      setCurrentUser(null);
    }
    
    setLoading(false);
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      console.log(`Attempting login for: ${email}`);
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
      console.log('Login successful:', authData.record.id);
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      console.log(`Attempting signup for: ${data.email}`);
      // Create user with default 'client' role
      const record = await pb.collection('users').create({ ...data, role: 'client' }, { $autoCancel: false });
      console.log('Signup successful, logging in...', record.id);
      // Automatically log in after signup
      await login(data.email, data.password);
      return record;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
