import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UpdatePasswordForm } from '@/components/update-password-form';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Update Your Password</CardTitle>
        <CardDescription>Enter a new password for your account below.</CardDescription>
      </CardHeader>
      <UpdatePasswordForm />
       <CardFooter className="flex justify-center text-sm">
            <Link href="/login" className="font-semibold text-primary hover:underline">Back to Login</Link>
        </CardFooter>
    </Card>
  );
}
