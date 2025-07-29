
import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import type { Car, Brand } from '@/lib/types';
import { BrandMarquee } from '@/components/brand-marquee';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, getDoc, limit } from 'firebase/firestore';
import { PageContent, SearchBar, RecommendedSection } from '@/components/page-content';

// Revalidate this page every 60 seconds to keep data fresh
export const revalidate = 60; 
export const dynamic = 'force-dynamic';

async function getPageData() {
    const carsRef = collection(db, 'cars');
    const filtersRef = doc(db, 'config', 'filters');
    const brandsRef = collection(db, 'brands');
    
    // Fetch all data in parallel
    const [carSnapshot, filtersSnap, brandsSnap] = await Promise.all([
        getDocs(query(carsRef, where('status', '==', 'approved'))),
        getDoc(filtersRef),
        getDocs(query(brandsRef, limit(12)))
    ]);

    const allCars = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
    const filters = filtersSnap.exists() ? filtersSnap.data() : { brands: [], models: {}, years: [] };
    const brandLogos = brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));

    // Calculate popular brands
    const brandCounts: { [key: string]: number } = {};
    for (const car of allCars) {
        brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
    }
    const popularBrands = Object.entries(brandCounts)
        .sort(([,a],[,b]) => b - a)
        .map(([brand]) => brand)
        .slice(0, 4);

    return {
        allCars,
        filters,
        brandLogos,
        popularBrands,
    };
}


export default async function Home() {
    const { allCars, filters, brandLogos, popularBrands } = await getPageData();
    const { brands, models, years } = filters;

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
             <SearchBar allCars={allCars} popularBrands={popularBrands} />
          </div>
        </section>

        <RecommendedSection />

        <div id="listings-section" className="container mx-auto px-4 py-12">
            <PageContent 
                initialCars={allCars} 
                brands={brands} 
                models={models} 
                years={years} 
            />
        </div>
      
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Browse by Brands</h2>
              <BrandMarquee initialBrands={brandLogos}/>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
