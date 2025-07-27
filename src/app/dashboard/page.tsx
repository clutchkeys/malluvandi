
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
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
            } else if (user.role !== 'customer') {
                router.replace(roleRedirects[user.role as keyof typeof roleRedirects]);
            } else {
                 router.replace('/dashboard/my-account');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
}
