
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';

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
    // Simulate checking for a logged-in user in session storage
    const storedUser = sessionStorage.getItem('mallu-vandi-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    // This is a mock login. In a real app, you'd call Firebase here.
    // The password is not checked in this mock implementation.
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (foundUser) {
        const userWithStatus = {...foundUser, status: 'Online' as const};
        setUser(userWithStatus);
        sessionStorage.setItem('mallu-vandi-user', JSON.stringify(userWithStatus));
        setLoading(false);
        return userWithStatus;
    }
    
    setLoading(false);
    return null;
  };
  
  const register = async (name: string, email: string, pass: string): Promise<User | null> => {
     setLoading(true);
     await new Promise(resolve => setTimeout(resolve, 500));
     
     if (MOCK_USERS.some(u => u.email === email)) {
        setLoading(false);
        throw new Error("An account with this email already exists.");
     }

     const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'customer'
     };
     
     // In a real app, you would add this user to your DB.
     // For this mock, we won't permanently add them to the MOCK_USERS array.
     setUser(newUser);
     sessionStorage.setItem('mallu-vandi-user', JSON.stringify(newUser));
     setLoading(false);
     return newUser;
  }

  const logout = async () => {
    // In a real app, you'd make a call to your backend to set status to 'Offline'.
    // Here we just clear the session.
    setUser(null);
    sessionStorage.removeItem('mallu-vandi-user');
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
