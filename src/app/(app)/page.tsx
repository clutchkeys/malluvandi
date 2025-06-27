'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const roleRedirects: Record<Exclude<Role, 'customer'>, string> = {
  admin: '/admin',
  manager: '/admin',
  'employee-a': '/employee-a',
  'employee-b': '/employee-b',
};

export default function AppIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Customers should be redirected away from the app section
        if (user.role === 'customer') {
            router.replace('/');
        } else {
            router.replace(roleRedirects[user.role] || '/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
    </div>
  );
}
