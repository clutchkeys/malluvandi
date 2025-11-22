import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
      <Card className="w-full max-w-sm mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email below to receive a password reset link.</CardDescription>
        </CardHeader>
        <ForgotPasswordForm />
        <CardFooter className="flex justify-center text-sm">
            <Link href="/login" className="font-semibold text-primary hover:underline">Back to Login</Link>
        </CardFooter>
      </Card>
  );
}
