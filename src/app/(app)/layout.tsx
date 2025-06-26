'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  List,
  Mail,
  LogOut,
  CarIcon,
  Menu,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
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
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ],
    'employee-a': [
      { href: '/employee-a', icon: List, label: 'My Listings' },
    ],
    'employee-b': [
      { href: '/employee-b', icon: Mail, label: 'Inquiries' },
    ],
  };

  const currentNavItems = navItems[user.role as Exclude<typeof user.role, 'customer'>] || [];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary font-headline">
            <CarIcon className="h-7 w-7" />
            <span>Mallu Vandi</span>
          </Link>
          {currentNavItems.map(item => (
            <Link key={item.href} href={item.href} className="text-foreground transition-colors hover:text-foreground/80">
              {item.label}
            </Link>
          ))}
        </nav>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary font-headline">
                <CarIcon className="h-6 w-6" />
                <span>Mallu Vandi</span>
              </Link>
              {currentNavItems.map(item => (
                <Link key={item.href} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Public Website</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {children}
      </main>
    </div>
  );
}
