'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, getUserData, clearAuthSession, StoredUserData } from '@/src/utils/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredUserData | null;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: () => {},
  refreshAuth: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<StoredUserData | null>(null);

  // Initialize auth state on mount
useEffect(() => {
  const checkAuth = () => {
    const authenticated = isAuthenticated();
    const userData = getUserData();

    setIsAuth(authenticated);
    setUser(userData);
    setIsLoading(false);
  };

  checkAuth();

  const handleStorageChange = () => checkAuth();

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);

  const handleLogout = () => {
    clearAuthSession();
    setIsAuth(false);
    setUser(null);
  };

  const refreshAuth = () => {
    const authenticated = isAuthenticated();
    const userData = getUserData();
    
    setIsAuth(authenticated);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuth,
        isLoading,
        user,
        logout: handleLogout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
