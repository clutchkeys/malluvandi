
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<{
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async (sessionUser: any) => {
        if (!sessionUser) {
            setUser(null);
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (profile) {
            setUser(profile as AppUser);
        } else {
             // This might happen if the trigger fails or there's a delay.
             // We can create a basic user object and try fetching again later.
             setUser({
                 id: sessionUser.id,
                 email: sessionUser.email!,
                 name: sessionUser.user_metadata?.full_name || 'User',
                 phone: sessionUser.user_metadata?.phone,
                 role: 'customer' // default role
             });
        }
        setLoading(false);
    };
    
    // Check for an initial session on load
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        fetchUser(session?.user);
    };
    
    getInitialSession();


    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        fetchUser(session?.user);
    });


    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
