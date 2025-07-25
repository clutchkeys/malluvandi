
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their details from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
          setUser(userData);
        } else {
          // This case might happen if a user is in Auth but not Firestore.
          // For now, we log them out.
          await signOut(auth);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
        setUser(userData);
        setLoading(false);
        return userData;
      } else {
         throw new Error("User data not found in Firestore.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login Error:", error);
      return null;
    }
  };
  
  const register = async (name: string, email: string, pass: string): Promise<User | null> => {
     setLoading(true);
     try {
       const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
       const firebaseUser = userCredential.user;
       
       const newUser: Omit<User, 'id'> = {
          name,
          email,
          role: 'customer'
       };

       // Create a document in Firestore for the new user
       await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
       
       const userWithId = { id: firebaseUser.uid, ...newUser } as User;
       setUser(userWithId);
       setLoading(false);
       return userWithId;
     } catch (error: any) {
        setLoading(false);
        console.error("Registration Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("An account with this email already exists.");
        }
        throw new Error("Registration failed. Please try again.");
     }
  }

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
