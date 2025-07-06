"use client";

import React, { createContext, useState, useMemo, useEffect } from 'react';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AppContextType {
  user: User | null;
  isAdmin: boolean | null; // null means loading/unknown, boolean means checked
  login: () => void;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'mycecnotes-admin';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Check session storage on initial load
    try {
      const storedAdminStatus = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedAdminStatus === 'true') {
        setIsAdmin(true);
        setUser({ id: 'admin-user', name: 'Admin', avatarUrl: '/admin-avatar.png' });
      } else {
        setIsAdmin(false);
      }
    } catch (e) {
      // If sessionStorage is not available
      setIsAdmin(false);
    }
  }, []);

  const login = () => {
    // In a real app, this would involve an API call to Firebase Auth
    if (!isAdmin) {
      setUser(mockUsers[0]);
    }
  };

  const logout = () => {
    if (!isAdmin) {
      setUser(null);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be a secure API call.
    // This is for demonstration purposes only.
    if (email === 'admin@mycecnotes.com' && password === 'admin123') {
      setIsAdmin(true);
      setUser({ id: 'admin-user', name: 'Admin', avatarUrl: '/admin-avatar.png' });
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch (e) { /* ignore */ }
      return true;
    }
    return false;
  };
  
  const adminLogout = () => {
    setIsAdmin(false);
    setUser(null);
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) { /* ignore */ }
  };


  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    login,
    logout,
    adminLogin,
    adminLogout,
  }), [user, isAdmin]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
