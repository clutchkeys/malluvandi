'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const roleRedirects: Record<Role, string> = {
  admin: '/admin',
  manager: '/admin',
  'employee-a': '/employee-a',
  'employee-b': '/employee-b',
  customer: '/',
};

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        toast({ title: 'Login Successful', description: `Welcome back, ${user.name}!` });
        router.push(roleRedirects[user.role] || '/');
        router.refresh(); // Force a refresh to update header state
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Please check your email and password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </CardFooter>
    </form>
  );
}
