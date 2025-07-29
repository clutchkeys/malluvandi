
'use client';
import Image from 'next/image';
import { Button } from './ui/button';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import type { Brand } from '@/lib/types';
import React, { useState, useEffect } from 'react';

interface BrandMarqueeProps {
  initialBrands?: Brand[];
  onBrandClick?: (brand: string) => void;
}

export function BrandMarquee({ initialBrands = [], onBrandClick = () => {} }: BrandMarqueeProps) {
    const [brands, setBrands] = useState<Brand[]>(initialBrands);

    useEffect(() => {
        if (initialBrands.length > 0) return; // Don't fetch if we have initial data

        const q = query(collection(db, 'brands'), limit(12));
        const unsub = onSnapshot(q, (snapshot) => {
            setBrands(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand)));
        });
        return () => unsub();
    }, [initialBrands]);

  const marqueeContent = brands.map((brand) => (
    <Button
      key={brand.id}
      variant="ghost"
      className="flex-shrink-0 w-48 h-24 mx-4 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
      onClick={() => onBrandClick(brand.name)}
    >
      <div className="relative w-32 h-16">
        <Image
          src={brand.logoUrl || `https://placehold.co/128x64.png?text=${brand.name}`}
          alt={`${brand.name} logo`}
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
    </Button>
  ));

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-10"
           style={{
             background: 'linear-gradient(to right, hsl(var(--secondary)) 0%, transparent 10%, transparent 90%, hsl(var(--secondary)) 100%)'
           }}
      />
      <div className="marquee-group flex">
        <div className="marquee flex min-w-full flex-shrink-0 items-center justify-around">
          {marqueeContent}
        </div>
        <div aria-hidden="true" className="marquee flex min-w-full flex-shrink-0 items-center justify-around">
          {marqueeContent}
        </div>
      </div>
    </div>
  );
}
