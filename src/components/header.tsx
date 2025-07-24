'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User as UserIcon, LogIn, ChevronRight, LayoutDashboard } from 'lucide-react';
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
import type { Role } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';


export function Header() {
  const { user, logout, loading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const roleRedirects: Record<Exclude<Role, 'customer'>, string> = {
    admin: '/admin',
    manager: '/admin',
    'employee-a': '/employee-a',
    'employee-b': '/employee-b',
  };
  
  const navLinks = [
    { href: '/', label: 'Buy Cars'},
    { href: '/bikes', label: 'Buy Bikes'},
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
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
                     {user.role !== 'customer' && (
                        <DropdownMenuItem asChild>
                           <Link href={roleRedirects[user.role as Exclude<Role, 'customer'>]}>Dashboard</Link>
                        </DropdownMenuItem>
                     )}
                      <DropdownMenuItem asChild>
                           <Link href="/my-account">My Account</Link>
                        </DropdownMenuItem>
                     <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
