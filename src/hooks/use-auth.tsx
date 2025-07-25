
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDatabase, ref, set, onValue, off } from "firebase/database";
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string, subscribe: boolean) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If a user is logged in on page load, log them out for security.
        await signOut(auth);
        setUser(null);
        toast({
            title: "Session Expired",
            description: "For your security, you have been logged out. Please log in again.",
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      // Use session persistence to log user out on session end
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
        if (userData.banned) {
          await signOut(auth);
          throw new Error("This account has been banned.");
        }
        
        const rtdb = getDatabase();
        const statusRef = ref(rtdb, `users/${firebaseUser.uid}/status`);
        if(userData.role !== 'customer') {
            await set(statusRef, 'Online');
             onValue(ref(rtdb, '.info/connected'), (snap) => {
                if (snap.val() === true) {
                    set(statusRef, 'Online');
                }
            });
        }
        setUser(userData);
        return userData;
      } else {
         throw new Error("User data not found in Firestore.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    } finally {
        setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, pass: string, phone: string, subscribe: boolean): Promise<User | null> => {
     setLoading(true);
     try {
       await setPersistence(auth, browserSessionPersistence);
       const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
       const firebaseUser = userCredential.user;
       
       const newUser: Omit<User, 'id'> = {
          name,
          email,
          phone,
          role: 'customer',
          newsletterSubscribed: subscribe,
          banned: false,
       };

       await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
       
       const userWithId = { id: firebaseUser.uid, ...newUser } as User;
       setUser(userWithId);
       return userWithId;
     } catch (error: any) {
        console.error("Registration Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("An account with this email already exists.");
        }
        throw new Error("Registration failed. Please try again.");
     } finally {
        setLoading(false);
     }
  }

  const logout = async () => {
    if (user && user.role !== 'customer') {
        const rtdb = getDatabase();
        const statusRef = ref(rtdb, `users/${user.id}/status`);
        await set(statusRef, 'Offline');
    }
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
