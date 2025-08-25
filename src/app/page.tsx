
import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import type { Car, Brand } from '@/lib/types';
import { BrandMarquee } from '@/components/brand-marquee';
import { PageContent } from '@/components/page-content';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Revalidate this page every 60 seconds to keep data fresh
export const revalidate = 60; 
export const dynamic = 'force-dynamic';

async function getPageData() {
  const supabase = createClient();

  // Fetch all data in parallel
  const [carData, filtersData, brandData] = await Promise.all([
    supabase.from('cars').select('*').eq('status', 'approved'),
    supabase.from('filters').select('*').limit(1), // Use limit(1) instead of single()
    supabase.from('brands').select('*').limit(12),
  ]);

  const allCars: Car[] = carData.data || [];
  const filters = filtersData.data?.[0] || { brands: [], models: {}, years: [] };
  const brandLogos: Brand[] = brandData.data || [];

  return {
    allCars,
    filters,
    brandLogos,
  };
}


export default async function Home() {
    const { allCars, filters, brandLogos } = await getPageData();
    const { brands, models } = filters;
    const years = (filters.years || []).sort((a: number, b: number) => b - a);
    const popularBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota'];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-card h-[50vh] flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <Image
            src="https://ik.imagekit.io/qctc8ch4l/malluvandi_P301G3N4U?updatedAt=1753468925203"
            alt="Mallu Vandi dealership storefront"
            fill
            className="z-0 object-cover"
            data-ai-hint="dealership exterior"
            priority
          />
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find Your Next Ride</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mt-4 max-w-3xl mx-auto">
              Kerala's most trusted marketplace for buying and selling quality pre-owned cars.
            </p>
             <div className="mt-8 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                <span className="text-sm font-semibold mr-2">Popular:</span>
                {popularBrands.map(brand => (
                    <Button asChild key={brand} variant="secondary" size="sm" className="rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white">
                        <Link href={`/#listings-section?brand=${encodeURIComponent(brand)}`}>{brand}</Link>
                    </Button>
                ))}
            </div>
          </div>
        </section>
        
        <div id="listings-section" className="container mx-auto px-4 py-12">
            <PageContent 
                initialCars={allCars} 
                brands={brands || []} 
                models={models || {}} 
                years={years} 
            />
        </div>
      
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Browse by Brands</h2>
              <BrandMarquee initialBrands={brandLogos} />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
