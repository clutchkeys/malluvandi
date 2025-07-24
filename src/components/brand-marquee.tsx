
'use client';
import Image from 'next/image';
import { Button } from './ui/button';

interface BrandMarqueeProps {
  brands: string[];
  onBrandClick: (brand: string) => void;
}

export function BrandMarquee({ brands, onBrandClick }: BrandMarqueeProps) {
  const brandLogos: { [key: string]: string } = {
    Toyota: 'https://cdn.worldvectorlogo.com/logos/toyota-1.svg',
    BMW: 'https://cdn.worldvectorlogo.com/logos/bmw-logo.svg',
    Mercedes: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-6.svg',
    Maruti: 'https://cdn.worldvectorlogo.com/logos/maruti-suzuki-7.svg',
    Kia: 'https://cdn.worldvectorlogo.com/logos/kia-2021.svg',
    Hyundai: 'https://cdn.worldvectorlogo.com/logos/hyundai-motor-company-1.svg',
    Honda: 'https://cdn.worldvectorlogo.com/logos/honda-9.svg',
    MG: 'https://cdn.worldvectorlogo.com/logos/mg-motor-01.svg',
    Skoda: 'https://cdn.worldvectorlogo.com/logos/skoda-4.svg',
    Volkswagen: 'https://cdn.worldvectorlogo.com/logos/volkswagen-3.svg',
    Nissan: 'https://cdn.worldvectorlogo.com/logos/nissan-5.svg',
    Audi: 'https://cdn.worldvectorlogo.com/logos/audi-1.svg',
  };

  const marqueeContent = brands.map((brand) => (
    <Button
      key={brand}
      variant="ghost"
      className="flex-shrink-0 w-48 h-24 mx-4 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
      onClick={() => onBrandClick(brand)}
    >
      <div className="relative w-32 h-16">
        <Image
          src={brandLogos[brand] || `https://placehold.co/128x64.png?text=${brand}`}
          alt={`${brand} logo`}
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
