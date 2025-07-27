import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
      <Card className="w-full max-w-sm mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <LoginForm />
        <CardFooter className="flex-col items-center justify-center text-sm space-y-2">
            <p>Don't have an account?&nbsp;<Link href="/register" className="font-semibold text-primary hover:underline">Sign up</Link></p>
        </CardFooter>
      </Card>
  );
}
