
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User as UserIcon, LogIn, ChevronRight, LayoutDashboard, Bookmark, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Role, Notification } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, where, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';

function NotificationsDropdown() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const recipientGroups = ['all', user.role === 'customer' ? 'all-customers' : 'all-staff'];
        if (user.role.startsWith('employee')) {
            recipientGroups.push(user.role);
        }

        const q = query(
            collection(db, 'notifications'),
            where('recipientGroup', 'in', recipientGroups),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(fetchedNotifications);
            // Simple unread logic: any notification created in the last 24 hours is "unread"
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const newUnreadCount = snapshot.docs.filter(doc => doc.data().createdAt > twentyFourHoursAgo).length;
            setUnreadCount(newUnreadCount);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="p-2">
                    <h4 className="font-medium text-sm">Notifications</h4>
                </div>
                <div className="space-y-2 p-1 max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif.id} className="text-sm p-2 rounded-md hover:bg-muted/50">
                                <p>{notif.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-4">No notifications yet.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function Header() {
  const { user, logout, loading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const roleRedirects: Record<Exclude<Role, 'customer'>, string> = {
    admin: '/dashboard/admin',
    manager: '/dashboard/admin',
    'employee-a': '/dashboard/employee-a',
    'employee-b': '/dashboard/employee-b',
  };
  
  const navLinks = [
    { href: '/', label: 'Buy Cars'},
    { href: '/sell', label: 'Sell Your Car'},
    { href: '/about', label: 'About Us'},
    { href: '/contact', label: 'Contact'},
  ]

  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <Image
            src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
            alt="Mallu Vandi Logo"
            width={160}
            height={40}
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : (
            <>
              {user ? (
                <>
                <NotificationsDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                       <UserIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href="/dashboard/my-account/saved-cars"><Bookmark className="mr-2 h-4 w-4" />Saved Cars</Link>
                    </DropdownMenuItem>
                     {user.role !== 'customer' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={roleRedirects[user.role as Exclude<Role, 'customer'>]}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                          </DropdownMenuItem>
                        </>
                     )}
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                   <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                  </Button>
                   <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
               <ThemeToggle />
               <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0">
                    <SheetHeader className="p-6 pb-4">
                        <SheetTitle>
                           <Link href="/" onClick={() => setIsSheetOpen(false)}>
                            <Image
                                src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
                                alt="Mallu Vandi Logo"
                                width={140}
                                height={35}
                            />
                           </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <Separator />
                    <nav className="grid gap-2 p-6 text-lg font-medium">
                       {navLinks.map(link => (
                          <Link 
                            key={link.href} 
                            href={link.href}
                            onClick={() => setIsSheetOpen(false)}
                            className="flex items-center justify-between rounded-md p-3 text-base text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <span>{link.label}</span>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        ))}
                    </nav>
                     <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
                        {!user ? (
                          <div className="flex flex-col gap-2">
                            <Button asChild size="lg" className="w-full" onClick={() => setIsSheetOpen(false)}>
                                <Link href="/login" className="flex items-center justify-center gap-2">
                                  <LogIn /> Login
                                </Link>
                            </Button>
                             <Button asChild variant="secondary" size="lg" className="w-full" onClick={() => setIsSheetOpen(false)}>
                                <Link href="/register" className="flex items-center justify-center gap-2">
                                  <UserIcon /> Sign Up
                                </Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                              <Button asChild size="lg" className="w-full" onClick={() => setIsSheetOpen(false)}>
                                <Link href="/dashboard/my-account/saved-cars" className="flex items-center justify-center gap-2"><Bookmark />Saved Cars</Link>
                              </Button>
                            {user.role !== 'customer' && (
                                <Button asChild size="lg" className="w-full" onClick={() => setIsSheetOpen(false)}>
                                    <Link href={roleRedirects[user.role as Exclude<Role, 'customer'>]} className="flex items-center justify-center gap-2"><LayoutDashboard />Dashboard</Link>
                                </Button>
                            )}
                             <Button asChild variant="secondary" size="lg" className="w-full" onClick={() => {logout(); setIsSheetOpen(false);}}>
                                <span className="flex items-center justify-center gap-2"><LogOut /> Logout</span>
                            </Button>
                          </div>
                        )}
                    </div>
                  </SheetContent>
                </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
