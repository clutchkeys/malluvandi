
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
              <FileQuestion className="h-12 w-12" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold">404 - Page Not Found</CardTitle>
            <CardDescription>
              The page you are looking for does not exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
