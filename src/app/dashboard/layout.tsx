
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bell, Bookmark, Car, Home, LineChart, LogOut, Package, Settings, ShoppingCart, Truck, Users, Warehouse, Filter, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';

const getNavLinks = (role: string) => {
  switch (role) {
    case 'admin':
    case 'manager':
      return [
        { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/admin/listings', icon: Car, label: 'Car Listings' },
        { href: '/dashboard/admin/inquiries', icon: ShoppingCart, label: 'Inquiries' },
        { href: '/dashboard/admin/users', icon: Users, label: 'User Management' },
        { href: '/dashboard/admin/notifications', icon: Bell, label: 'Notifications' },
        { href: '/dashboard/admin/settings', icon: Filter, label: 'Filter Settings' },
        { href: '/dashboard/admin/marquee-brands', icon: Star, label: 'Marquee Brands' },
      ];
    case 'employee-a':
      return [
        { href: '/dashboard/employee-a/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/employee-a/listings', icon: Car, label: 'My Listings' },
        { href: '/dashboard/employee-a/notifications', icon: Bell, label: 'Notifications' },
      ];
    case 'employee-b':
      return [
        { href: '/dashboard/employee-b/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/dashboard/employee-b/inquiries', icon: ShoppingCart, label: 'Inquiries' },
        { href: '/dashboard/employee-b/notifications', icon: Bell, 'label': 'Notifications' },
      ];
    default: // customer
      return [
        { href: '/dashboard/my-account/saved-cars', icon: Bookmark, label: 'Saved Cars' },
        { href: '/dashboard/settings', icon: Settings, label: 'Account Settings' },
      ];
  }
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const navLinks = getNavLinks(user?.role || 'customer');

  // A different layout for customer vs staff
  if (user?.role === 'customer') {
      return (
          <div className="flex min-h-screen w-full flex-col">
              <Header />
              <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                  <div className="mx-auto grid w-full max-w-6xl gap-2">
                      <h1 className="text-3xl font-semibold">My Account</h1>
                  </div>
                  <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                      <nav className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0">
                          {navLinks.map(link => (
                               <Link key={link.href} href={link.href} className={pathname === link.href ? 'font-semibold text-primary' : ''}>
                                {link.label}
                               </Link>
                          ))}
                      </nav>
                      <div className="grid gap-6">
                         {children}
                      </div>
                  </div>
              </main>
          </div>
      )
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Truck className="h-6 w-6" />
              <span className="">Mallu Vandi</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname.startsWith(href) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
           <div className="mt-auto p-4">
            <Button size="sm" className="w-full" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">{navLinks.find(l => pathname.startsWith(l.href))?.label || 'Dashboard'}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
