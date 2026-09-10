import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('teachers').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (formData) => {
    try {
      console.log('AuthContext: Starting user registration process...');
      
      // 1. Create the user record
      console.log('AuthContext: Creating record in teachers collection...');
      const record = await pb.collection('teachers').create(formData, { $autoCancel: false });
      console.log('AuthContext: Record created successfully with ID:', record.id);
      
      // 2. Authenticate the newly created user
      console.log('AuthContext: Authenticating new user...');
      const authData = await pb.collection('teachers').authWithPassword(formData.email, formData.password, { $autoCancel: false });
      console.log('AuthContext: Authentication successful');
      
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email) => {
    await pb.collection('teachers').requestPasswordReset(email, { $autoCancel: false });
  };

  const updateProfile = async (id, data) => {
    const updated = await pb.collection('teachers').update(id, data, { $autoCancel: false });
    setCurrentUser(updated);
    return updated;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    requestPasswordReset,
    updateProfile,
    isAuthenticated: !!currentUser
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};