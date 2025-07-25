'use client'

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { Loader2 } from "lucide-react";

const roleRedirects: Record<Exclude<Role, 'customer'>, string> = {
  admin: '/admin',
  manager: '/admin',
  'employee-a': '/employee-a',
  'employee-b': '/employee-b',
};

export default function AppRedirectPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if(user.role === 'customer') {
                router.replace('/my-account');
            } else {
                router.replace(roleRedirects[user.role]);
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
}
