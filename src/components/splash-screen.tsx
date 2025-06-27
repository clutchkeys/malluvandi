'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
      <div className="animate-pulse">
        <Image
          src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
          alt="Mallu Vandi Logo"
          width={240}
          height={60}
          priority
        />
      </div>
      <p className="mt-4 text-muted-foreground">Loading your next ride...</p>
    </div>
  );
}
