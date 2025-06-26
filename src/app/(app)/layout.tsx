'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Car,
  PlusCircle,
  List,
  Mail,
  BotMessageSquare,
  LogOut,
  CarIcon,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
        if(!user) {
            router.push('/login');
        } else if (user.role === 'customer') {
            router.push('/');
        }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === 'customer') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  const navItems = {
    admin: [
      { href: '/admin', icon: LayoutDashboard, label: 'Approvals' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
    'employee-a': [
      { href: '/employee-a', icon: PlusCircle, label: 'Add Car' },
      { href: '/employee-a/listings', icon: List, label: 'My Listings' },
    ],
    'employee-b': [
      { href: '/employee-b', icon: Mail, label: 'Inquiries' },
      { href: '/employee-b/ai-assistant', icon: BotMessageSquare, label: 'AI Assistant' },
    ],
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <CarIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
              Mallu Vandi
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <Link href="/">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            {(navItems[user.role as Exclude<typeof user.role, 'customer'>] || []).map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3">
             <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role.replace('-', ' ')}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="ml-auto group-data-[collapsible=icon]:w-full">
                <LogOut />
            </Button>
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
                {/* Header content can go here if needed */}
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
