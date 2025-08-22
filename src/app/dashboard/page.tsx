
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const roleRedirects = {
      'admin': '/dashboard/admin',
      'manager': '/dashboard/admin',
      'employee-a': '/dashboard/employee-a',
      'employee-b': '/dashboard/employee-b',
      'customer': '/dashboard/my-account',
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
            } else {
                const userRole = user.app_metadata?.role || 'customer';
                router.replace(roleRedirects[userRole as keyof typeof roleRedirects] || '/');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex h-screen w-screen items