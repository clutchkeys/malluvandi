'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Role } from '@/lib/types';


export function Header() {
  const { user, logout, loading } = useAuth();

  const roleRedirects: Record<Exclude<Role, 'customer'>, string> = {
    admin: '/admin',
    manager: '/admin',
    'employee-a': '/employee-a',
    'employee-b': '/employee-b',
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Car className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary font-headline">Mallu Vandi</span>
        </Link>
        <nav>
          {!loading && (
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
                     <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="space-x-2">
                   <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                  </Button>
                   <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
