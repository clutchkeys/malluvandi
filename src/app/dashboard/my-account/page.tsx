
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function MyAccountPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user?.role === 'customer') {
                router.replace('/dashboard/my-account/saved-cars');
            } else if (!user) {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // For non-customer roles, this will be briefly visible during redirect
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Redirecting to your dashboard...</p>
        </div>
    );
}
