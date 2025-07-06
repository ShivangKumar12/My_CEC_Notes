
"use client";

import React, { createContext, useState, useMemo, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const profile = userSnap.data() as UserProfile;
          setUserProfile(profile);
          setIsAdmin(profile.isAdmin ?? false);
        } else {
          // Create new user profile in Firestore
          const newUserProfile: UserProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || '/default-avatar.png',
            isAdmin: false,
          };
          await setDoc(userRef, { ...newUserProfile, createdAt: serverTimestamp() });
          setUserProfile(newUserProfile);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Login Successful", description: "Welcome to MyCECNotes!" });
    } catch (error) {
      console.error("Google login error:", error);
      toast({ title: "Login Failed", description: "Could not log in with Google.", variant: "destructive" });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminUser = userCredential.user;
      
      const userRef = doc(db, 'users', adminUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().isAdmin) {
        return true;
      } else {
        // If user is not an admin, sign them out immediately.
        await signOut(auth);
        return false;
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };
  
  const adminLogout = async () => {
    await logout();
  };

  const contextValue = useMemo(() => ({
    user,
    userProfile,
    isAdmin,
    isLoading,
    login,
    logout,
    adminLogin,
    adminLogout,
  }), [user, userProfile, isAdmin, isLoading]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
