"use client";

import React, { createContext, useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AppContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    // In a real app, this would involve an API call to Firebase Auth
    setUser(mockUsers[0]);
  };

  const logout = () => {
    setUser(null);
  };

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
  }), [user]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
