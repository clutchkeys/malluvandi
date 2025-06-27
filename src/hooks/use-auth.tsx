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
  updateProfile,
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
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({ 
            id: firebaseUser.uid, 
            name: firebaseUser.displayName || userData.name,
            email: firebaseUser.email || userData.email,
            role: userData.role
          });
        } else {
            await signOut(auth);
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if(userDocSnap.exists()){
        const userData = userDocSnap.data();
        const appUser: User = { 
          id: firebaseUser.uid, 
          name: firebaseUser.displayName || userData.name,
          email: firebaseUser.email || userData.email,
          role: userData.role
        };
        setUser(appUser);
        return appUser;
    }
    // This case should ideally not happen if registration is done correctly
    await signOut(auth);
    return null;
  };
  
  const register = async (name: string, email: string, pass: string): Promise<User | null> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });
    
    const newUserFirestoreData = {
        name,
        email,
        role: 'customer',
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), newUserFirestoreData);
    
    const appUser: User = { ...newUserFirestoreData, id: firebaseUser.uid };
    setUser(appUser);
    return appUser;
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
