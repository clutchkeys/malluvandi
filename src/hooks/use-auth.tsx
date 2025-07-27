

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User, Role } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDatabase, ref, set, onValue, off } from "firebase/database";
import { useToast } from './use-toast';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string, subscribe: boolean, role?: Role) => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthInitializer({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Any logic that uses router or searchParams can go here if needed.
  // For now, just rendering children is enough to ensure the hook is used within Suspense.
  return <>{children}</>;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
                setUser(userData);
                
                // Only run presence system on the client side
                if (typeof window !== 'undefined' && userData.role !== 'customer') {
                    const rtdb = getDatabase();
                    const statusRef = ref(rtdb, `users/${firebaseUser.uid}/status`);
                    onValue(ref(rtdb, '.info/connected'), (snap) => {
                        if (snap.val() === true) {
                            set(statusRef, 'Online');
                        }
                    });
                }
            } else {
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
    setLoading(true);
    try {
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
  
  const register = async (name: string, email: string, pass: string, phone: string, subscribe: boolean, role: Role = 'customer'): Promise<User | null> => {
     setLoading(true);
     try {
       const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
       const firebaseUser = userCredential.user;
       
       const newUser: Omit<User, 'id'> = {
          name,
          email,
          phone,
          role,
          newsletterSubscribed: subscribe,
          banned: false,
          status: 'Offline',
          ...(role.startsWith('employee') && { performanceScore: 0, attendance: [] })
       };

       await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
       
       const userWithId = { id: firebaseUser.uid, ...newUser } as User;
       
       if (role === 'customer') {
           setUser(userWithId);
       } else if (auth.currentUser?.email !== email) {
            const currentAdmin = auth.currentUser;
            if (currentAdmin) {
                // This part is tricky. Re-authenticating admin is not straightforward without their password.
                // The intended behavior for admin creating users is that the admin *remains* logged in.
                // `createUserWithEmailAndPassword` automatically signs in the new user, so we sign them out.
                await signOut(auth);
                // And then we must restore the admin's session.
                // For simplicity, we assume the initial onAuthStateChanged will handle this.
                // In a production app, a more robust session management (e.g., re-authentication flow) would be needed.
            }
       }
       
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

  const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Password Reset Error:", error);
        throw new Error("Could not send password reset email. Make sure the email is correct.");
    }
  }

  const logout = async () => {
    const router = (await import('next/navigation')).useRouter();
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
    <AuthContext.Provider value={{ user, loading, login, logout, register, sendPasswordReset }}>
      <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
         <AuthInitializer>{children}</AuthInitializer>
      </Suspense>
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
