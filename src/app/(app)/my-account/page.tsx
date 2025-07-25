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
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';


export default function MyAccountPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>Please log in to see your account details.</div>
    }
  
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Account</h1>
        <Card>
            <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label>Name</Label>
                    <Input value={user.name} disabled />
                </div>
                <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                </div>
                 <div>
                    <Label>Role</Label>
                    <Input value={user.role} disabled className="capitalize"/>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline">Edit Profile</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
