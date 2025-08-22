

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AlertTriangle } from 'lucide-react';


export default function SellCarPage() {
  
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-lg text-center p-8">
            <CardHeader>
                <AlertTriangle className="h-16 w-16 mx-auto text-destructive"/>
                <CardTitle className="text-2xl mt-4">Feature Unavailable</CardTitle>
                <CardDescription>The ability to submit car listings is temporarily disabled because the backend is disconnected. Please connect a backend to re-enable this feature.</CardDescription>
            </CardHeader>
        </Card>
      </main>
      <Footer />
    </>
  );
}
