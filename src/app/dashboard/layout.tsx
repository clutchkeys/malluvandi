
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  List,
  Mail,
  LogOut,
  Menu,
  User as UserIcon,
  Bell,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeView, setActiveView] = useState('');

  const roleRedirects = {
      'admin': '/dashboard/admin',
      'manager': '/dashboard/admin',
      'employee-a': '/dashboard/employee-a/dashboard',
      'employee-b': '/dashboard/employee-b/dashboard',
      'customer': '/dashboard/my-account/saved-cars'
  };

  useEffect(() => {
    if (!loading) {
        if(!user) {
            router.push('/login');
        } else if (pathname === '/dashboard' || pathname === '/dashboard/') {
             const redirectPath = roleRedirects[user.role as keyof typeof roleRedirects] || '/';
             router.push(redirectPath);
        } else if (user.role === 'customer' && (pathname.startsWith('/dashboard/employee-a') || pathname.startsWith('/dashboard/employee-b') || pathname.startsWith('/dashboard/admin'))) {
            router.push('/');
        }
    }
  }, [user, loading, router, pathname]);
  
   useEffect(() => {
    const pathSegments = pathname.split('/');
    setActiveView(pathSegments[pathSegments.length - 1] || '');
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  // Admins and Managers have a custom layout within their page.
  if (user.role === 'admin' || user.role === 'manager') {
    if (pathname.startsWith('/dashboard/admin')) {
        return <>{children}</>;
    }
  }
  
  const employeeNavItems = {
    'employee-a': [
      { id: 'dashboard', href: '/dashboard/employee-a/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'listings', href: '/dashboard/employee-a/listings', icon: List, label: 'My Listings' },
      { id: 'notifications', href: '/dashboard/employee-a/notifications', icon: Bell, label: 'Notifications' },
    ],
    'employee-b': [
      { id: 'dashboard', href: '/dashboard/employee-b/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'inquiries', href: '/dashboard/employee-b/inquiries', icon: Mail, label: 'Inquiries' },
      { id: 'notifications', href: '/dashboard/employee-b/notifications', icon: Bell, label: 'Notifications' },
    ],
  };
  
  const customerNavItems = [
    { id: 'saved-cars', href: '/dashboard/my-account/saved-cars', icon: Bookmark, label: 'Saved Cars' },
  ]

  const currentNavItems = user.role === 'customer' 
    ? customerNavItems 
    : employeeNavItems[user.role as keyof typeof employeeNavItems] || [];


  const SideNav = () => (
     <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {currentNavItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                activeView === item.id && 'bg-muted text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        )}
      </nav>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
           <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-4">
                <Image
                src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
                alt="Mallu Vandi Logo"
                width={140}
                height={35}
                />
            </Link>
          </div>
          <div className="flex-1">
            <SideNav />
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription asChild><span className="sr-only">Main Navigation</span></SheetDescription>
                </SheetHeader>
                <div className="flex-1 py-4">
                    <SideNav />
                </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold capitalize">{activeView.replace('-', ' ')}</h1>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                    {user.status && (
                        <div className="flex items-center pt-2">
                             <Badge variant={user.status === 'Online' ? 'default' : 'outline'} className="gap-1 border-green-500/40">
                                <span className={cn("h-2 w-2 rounded-full", user.status === 'Online' ? 'bg-green-500' : 'bg-gray-400')}></span>
                                {user.status}
                            </Badge>
                        </div>
                    )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/">Public Website</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
