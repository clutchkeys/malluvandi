
import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import type { Car, Brand } from '@/lib/types';
import { BrandMarquee } from '@/components/brand-marquee';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, limit, orderBy } from 'firebase/firestore';
import { PageContent } from '@/components/page-content';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CarCard } from '@/components/car-card';
import { HomeFilter } from '@/components/home-filter';

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

    const allCars = carSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure createdAt is a string for client-side date parsing
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date(0).toISOString(),
        } as Car;
    });

    // Sort cars by creation date descending
    allCars.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    // Filter for newly added cars (last 2 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const newCars = allCars.filter(car => car.createdAt && new Date(car.createdAt) > twoDaysAgo);

    const filters = filtersSnap.exists() ? filtersSnap.data() : { brands: [], models: {}, years: [] };
    const brandLogos = brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));

    return {
        allCars,
        newCars,
        filters,
        brandLogos,
    };
}


export default async function Home() {
    const { allCars, newCars, filters, brandLogos } = await getPageData();
    const { brands, models, years } = filters;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-card h-[40vh] flex items-center justify-center text-center text-white overflow-hidden">
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
          </div>
        </section>

        <HomeFilter brands={brands} models={models} years={years} />
        
        {newCars.length > 0 && (
            <section className="py-12 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6">Newly Added Cars</h2>
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {newCars.map((car) => (
                                <CarouselItem key={car.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                    <div className="p-1 h-full">
                                        <CarCard car={car} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="ml-12" />
                        <CarouselNext className="mr-12" />
                    </Carousel>
                </div>
            </section>
        )}

        <div id="listings-section" className="container mx-auto px-4 py-12">
            <PageContent 
                initialCars={allCars} 
                brands={brands || []} 
                models={models || {}} 
                years={(years || []).sort((a: number, b: number) => b - a)} 
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
