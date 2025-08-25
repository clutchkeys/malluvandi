
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AppUser, Notification } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

const AuthContext = createContext<{
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
}>({
  user: null,
  loading: true,
  signOut: async () => {},
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getSeenNotifications = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    } catch (e) {
      return [];
    }
  };

  const markAllAsRead = () => {
    const allNotificationIds = notifications.map(n => n.id);
    localStorage.setItem('seenNotifications', JSON.stringify(allNotificationIds));
    setUnreadCount(0);
  };
  
  const fetchNotifications = useCallback(async (userRole: string) => {
    if (!userRole) return;

    const recipientGroups = ['all-customers', 'all-staff'];
    if (userRole === 'employee-a') recipientGroups.push('employee-a');
    if (userRole === 'employee-b') recipientGroups.push('employee-b');
    if (userRole === 'admin' || userRole === 'manager') {
       recipientGroups.push('employee-a', 'employee-b');
    }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('recipientGroup', recipientGroups)
        .order('createdAt', { ascending: false });

     if (error) {
        console.error("Error fetching notifications for header:", error);
     } else {
        const seenIds = getSeenNotifications();
        const newUnreadCount = data.filter(n => !seenIds.includes(n.id)).length;
        setNotifications(data as Notification[]);
        setUnreadCount(newUnreadCount);
     }

  }, [supabase]);

  useEffect(() => {
    const fetchUser = async (sessionUser: any) => {
        if (!sessionUser) {
            setUser(null);
            setLoading(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        if (profile) {
            setUser(profile as AppUser);
            fetchNotifications(profile.role);
        } else {
             setUser({
                 id: sessionUser.id,
                 email: sessionUser.email!,
                 name: sessionUser.user_metadata?.full_name || 'User',
                 phone: sessionUser.user_metadata?.phone,
                 role: 'customer' 
             });
             fetchNotifications('customer');
        }
        setLoading(false);
    };
    
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        fetchUser(session?.user);
    };
    
    getInitialSession();


    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        fetchUser(session?.user);
    });

    const notificationChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
            const newNotification = payload.new as Notification;
            const userRole = user?.role;
            if(userRole) {
                const isRelevant = 
                    newNotification.recipientGroup === 'all-customers' ||
                    newNotification.recipientGroup === 'all-staff' ||
                    newNotification.recipientGroup === userRole ||
                    (userRole === 'admin' || userRole === 'manager');
                
                if (isRelevant) {
                    toast({
                        title: "New Announcement",
                        description: newNotification.message,
                    });
                    fetchNotifications(userRole);
                }
            }
        }
      ).subscribe();


    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(notificationChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, notifications, unreadCount, markAllAsRead }}>
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
