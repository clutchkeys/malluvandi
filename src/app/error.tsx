
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
  appearance
}: {
  error: Error & { digest?: string };
  reset: () => void;
  appearance?: { logoUrl?: string };
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header appearance={appearance} />
        <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 text-destructive p-4 rounded-full">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Oops! Something went wrong.</CardTitle>
                    <CardDescription>
                        We encountered an unexpected issue. Please try again or return to the homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    <Button onClick={() => reset()}>Try Again</Button>
                    <Button variant="outline" asChild>
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
        <Footer appearance={appearance} />
    </div>
  );
}
