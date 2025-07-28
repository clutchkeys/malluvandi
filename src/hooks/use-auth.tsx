

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
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  signInWithGoogle: () => Promise<User | null>;
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
                 // This can happen if a user signs in with Google for the first time
                 // The signInWithGoogle function will handle creating the user doc
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
            // This case handles an admin creating another user.
            // After creating the new user, Firebase automatically signs them in.
            // We immediately sign them out to keep the admin's session active.
            // The onAuthStateChanged listener will then re-verify the admin's auth state.
            await signOut(auth);
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

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

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
            // New user, create a document for them
            const newUser: Omit<User, 'id'> = {
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email!,
                phone: firebaseUser.phoneNumber || '',
                role: 'customer',
                newsletterSubscribed: false,
                banned: false,
                status: 'Offline'
            };
            await setDoc(userDocRef, newUser);
            const userWithId = { id: firebaseUser.uid, ...newUser } as User;
            setUser(userWithId);
            return userWithId;
        }
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        if (error.code === 'auth/account-exists-with-different-credential') {
            throw new Error("An account already exists with the same email address but different sign-in credentials.");
        }
        throw new Error("Google Sign-In failed. Please try again.");
    } finally {
        setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, login, logout, register, sendPasswordReset, signInWithGoogle }}>
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
