'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<User | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mallu-vandi-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('mallu-vandi-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User | null> => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      const { password, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem('mallu-vandi-user', JSON.stringify(userToStore));
      return userToStore;
    }
    return null;
  };
  
  const register = async (name: string, email: string, pass: string): Promise<User | null> => {
    if (users.find(u => u.email === email)) {
      throw new Error("User with this email already exists.");
    }
    const newUser: User = {
        id: `user-cust-${Date.now()}`,
        name,
        email,
        role: 'customer',
        password: pass
    };
    users.push(newUser);
    const { password, ...userToStore } = newUser;
    setUser(userToStore);
    localStorage.setItem('mallu-vandi-user', JSON.stringify(userToStore));
    return userToStore;
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mallu-vandi-user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
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
