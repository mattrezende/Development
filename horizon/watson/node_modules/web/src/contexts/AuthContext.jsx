
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      return { success: true, user: authData.record };
    } catch (error) {
      throw new Error(error.message || 'Falha ao entrar. Verifique suas credenciais.');
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      const record = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
      });
      
      await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(pb.authStore.model);
      return { success: true, user: record };
    } catch (error) {
      throw new Error(error.message || 'Falha ao criar conta. Tente novamente.');
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    navigate('/');
  };

  const updateProfile = async (data) => {
    try {
      const updated = await pb.collection('users').update(currentUser.id, data, { $autoCancel: false });
      setCurrentUser(updated);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Falha ao atualizar perfil.');
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
