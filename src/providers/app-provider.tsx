
"use client";

import React, { createContext, useState, useMemo, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type AdminLoginResult = {
  success: boolean;
  reason?: 'unauthorized' | 'invalid-credentials' | 'too-many-requests' | 'unknown';
  message?: string;
};

interface AppContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<AdminLoginResult>;
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
    // If firebase is not configured, do not run auth logic.
    if (!auth) {
      setIsLoading(false);
      return;
    }

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
    if (!auth) {
      console.error("Firebase not initialized. Cannot log in.");
      toast({ title: "Configuration Error", description: "Firebase is not configured. Please check your .env.local file.", variant: "destructive" });
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Login Successful", description: "Welcome to MyCECNotes!" });
    } catch (error: any) {
      // Don't show an error toast if the user intentionally closes the popup.
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup closed by user.");
        return;
      }
      console.error("Google login error:", error);
      toast({ title: "Login Failed", description: "Could not log in with Google.", variant: "destructive" });
    }
  };

  const logout = async () => {
    if (!auth) {
      console.error("Firebase not initialized. Cannot log out.");
      return;
    }
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<AdminLoginResult> => {
    if (!auth) {
      console.error("Firebase not initialized. Cannot log in.");
      toast({ title: "Configuration Error", description: "Firebase is not configured. Please check your .env.local file.", variant: "destructive" });
      return { success: false, reason: 'unknown', message: 'Firebase is not properly configured.' };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminUser = userCredential.user;
      
      const userRef = doc(db, 'users', adminUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().isAdmin) {
        return { success: true };
      } else {
        // If user is not an admin, sign them out immediately.
        await signOut(auth);
        return { success: false, reason: 'unauthorized', message: 'You do not have permission to access the admin panel.' };
      }
    } catch (error: any) {
      console.error("Admin login error:", error.code);
      switch(error.code) {
        case 'auth/invalid-credential':
          return { success: false, reason: 'invalid-credentials', message: 'The email or password you entered is incorrect.' };
        case 'auth/too-many-requests':
          return { success: false, reason: 'too-many-requests', message: 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.' };
        default:
          return { success: false, reason: 'unknown', message: 'An unknown error occurred during login.' };
      }
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
