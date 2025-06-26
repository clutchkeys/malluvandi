import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
      <Card className="w-full max-w-sm mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Sign up to start browsing and inquiring about cars.</CardDescription>
        </CardHeader>
        <RegisterForm />
        <CardFooter className="flex justify-center text-sm">
            <p>Already have an account?&nbsp;</p><Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </CardFooter>
      </Card>
  );
}
