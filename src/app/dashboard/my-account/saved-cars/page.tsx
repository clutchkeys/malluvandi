
'use client';

import React from 'react';
import { Loader2, Bookmark } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SavedCarsPage() {
  
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">My Saved Cars</h1>
        <Card className="flex flex-col items-center justify-center text-center py-20">
            <CardHeader>
                <div className="mx-auto bg-muted p-4 rounded-full">
                   <Bookmark className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">You have no saved cars</CardTitle>
                <CardDescription>
                    Your saved cars will appear here when you are logged in.
                </CardDescription>
            </CardHeader>
        </Card>
    </div>
  );
}
