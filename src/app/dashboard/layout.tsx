
'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';


export default function AppLayout({ children }: { children: React.ReactNode }) {
 
  return (
    <div className="grid min-h-screen w-full">
        <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4">Backend disconnected. Please connect to a new backend.</p>
                </div>
            </main>
      </div>
    </div>
  );
}
