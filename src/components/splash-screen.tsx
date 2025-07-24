'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const splashRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (splashRef.current && logoRef.current) {
      gsap.set(logoRef.current, { x: '-100vw' }); // Start off-screen to the left

      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false);
        },
      });

      tl.to(logoRef.current, {
        x: '0', // Move to center
        duration: 0.8,
        ease: 'power2.out',
      })
      .to(logoRef.current, {
        delay: 0.5, // Pause in the middle
        x: '100vw', // Move off-screen to the right
        duration: 0.8,
        ease: 'power2.in',
      })
      .to(splashRef.current, {
        opacity: 0,
        duration: 0.4,
      }, '-=0.4');
    }
  }, []);

  return (
    <div
      ref={splashRef}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden',
        !isVisible && 'pointer-events-none'
      )}
    >
      <div ref={logoRef}>
        <Image
          src="https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078"
          alt="Mallu Vandi Logo"
          width={240}
          height={60}
          priority
        />
      </div>
    </div>
  );
}
