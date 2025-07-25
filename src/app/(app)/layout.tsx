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
  User,
  Bell
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeView, setActiveView] = useState('');

  const roleRedirects = {
      'admin': '/admin',
      'manager': '/admin',
      'employee-a': '/employee-a',
      'employee-b': '/employee-b',
  }

  useEffect(() => {
    if (!loading) {
        if(!user) {
            router.push('/login');
        } else if (user.role !== 'customer' && pathname === '/my-account') {
             router.push(roleRedirects[user.role as keyof typeof roleRedirects]);
        } else if (user.role === 'customer' && (pathname.startsWith('/employee-a') || pathname.startsWith('/employee-b') || pathname.startsWith('/admin'))) {
            router.push('/my-account');
        }
    }
  }, [user, loading, router, pathname]);
  
   useEffect(() => {
    const currentPath = pathname.split('/').pop();
    setActiveView(currentPath || '');
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
    if (pathname.startsWith('/admin')) {
        return <>{children}</>;
    }
  }

  const navItems = {
    'employee-a': [
      { id: 'dashboard', href: '/employee-a/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'listings', href: '/employee-a/listings', icon: List, label: 'My Listings' },
      { id: 'notifications', href: '/employee-a/notifications', icon: Bell, label: 'Notifications' },
    ],
    'employee-b': [
      { id: 'dashboard', href: '/employee-b/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'inquiries', href: '/employee-b/inquiries', icon: Mail, label: 'Inquiries' },
      { id: 'notifications', href: '/employee-b/notifications', icon: Bell, label: 'Notifications' },
    ],
     customer: [], // No sidebar for customers
  };

  const currentNavItems = navItems[user.role] || [];

  // If user is a customer, render a simpler layout without the sidebar
  if (user.role === 'customer') {
      return (
        <>
            <header className="flex h-16 items-center border-b px-4">
                 <Link href="/" className="flex items-center gap-4">
                    <Image
                    src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
                    alt="Mallu Vandi Logo"
                    width={140}
                    height={35}
                    />
                </Link>
                <div className="ml-auto flex items-center gap-4">
                     <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://i.pravatar.cc/40?u=${user?.id}`} />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
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
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/">Public Website</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/my-account"><User className="mr-2 h-4 w-4" />My Account</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
                {children}
            </main>
        </>
      )
  }
  
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
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 -mx-6">
                     <Link href="/" className="flex items-center gap-4">
                        <Image
                        src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
                        alt="Mallu Vandi Logo"
                        width={140}
                        height={35}
                        />
                    </Link>
                </div>
                <SideNav />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold capitalize">{activeView.replace('-', ' ')}</h1>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                 <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://i.pravatar.cc/40?u=${user?.id}`} />
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
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
              <DropdownMenuItem asChild><Link href="/my-account"><User className="mr-2 h-4 w-4" />My Account</Link></DropdownMenuItem>
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
