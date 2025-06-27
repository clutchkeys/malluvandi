'use client';

import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Splash screen visible for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-center gap-4 animate-pulse">
        <Car className="h-16 w-16 text-primary" />
        <span className="text-5xl font-bold text-primary font-headline">Mallu Vandi</span>
      </div>
      <p className="mt-4 text-muted-foreground">Loading your next ride...</p>
    </div>
  );
}
