'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import { approvedCars } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Car as CarIcon, Truck, Building, Sparkles, HandCoins } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const BodyTypeCard = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-2 text-center cursor-pointer group">
    <div className="flex items-center justify-center h-20 w-20 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors duration-300">
      {icon}
    </div>
    <p className="text-sm font-medium">{label}</p>
  </div>
);

const BrandCard = ({ logo, name }: { logo: React.ReactNode; name: string }) => (
  <Card className="flex flex-col items-center justify-center p-4 aspect-[4/3] hover:shadow-md transition-shadow cursor-pointer">
    {logo}
    <p className="mt-4 text-sm font-medium text-muted-foreground">{name}</p>
  </Card>
);

const TataLogo = () => <svg width="80" height="40" viewBox="0 0 200 100"><path d="M50 20 H150 V30 H120 V80 H80 V30 H50z" fill="hsl(var(--primary))" /></svg>;
const MarutiLogo = () => <svg width="80" height="40" viewBox="0 0 200 100"><path d="M20 80 l30-60 h20 l-30 60z M80 20 l30 60 h20 l-30-60z M140 20 l-10 20 h20z" fill="hsl(var(--primary))" /></svg>;
const HyundaiLogo = () => <svg width="80" height="40" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="hsl(var(--primary))" strokeWidth="10" fill="none" /><path d="M30 40 Q50 50 70 40 M30 60 Q50 50 70 60" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" /></svg>;
const ToyotaLogo = () => <svg width="80" height="40" viewBox="0 0 120 80"><ellipse cx="60" cy="40" rx="55" ry="35" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" /><ellipse cx="60" cy="40" rx="25" ry="15" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" /></svg>;
const HondaLogo = () => <svg width="80" height="40" viewBox="0 0 100 60"><rect x="20" y="10" width="60" height="40" rx="5" stroke="hsl(var(--primary))" strokeWidth="6" fill="none" /><path d="M30 20 H70 M30 30 H70 M30 40 H70" stroke="hsl(var(--primary))" strokeWidth="4" /></svg>;


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCars = useMemo(() => {
    return approvedCars.filter(car => {
      return searchQuery
        ? `${car.brand} ${car.model} ${car.year} ${car.color}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
    });
  }, [searchQuery]);


  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-card h-80 flex items-center justify-center">
          <Image
            src="https://placehold.co/1600x400.png"
            alt="Hero Banner"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            data-ai-hint="dealership showroom"
          />
          <div className="relative text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Find Your Perfect Used Car</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Quality, trust, and the best deals on pre-owned cars in Kerala.</p>
          </div>
        </div>

        {/* Find Your Car Section */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <Card className="shadow-2xl">
            <CardContent className="p-4 md:p-6">
              <Tabs defaultValue="used">
                <TabsList className="grid w-full grid-cols-2 md:w-1/3">
                  <TabsTrigger value="used">Used Cars</TabsTrigger>
                  <TabsTrigger value="new" disabled>New Cars</TabsTrigger>
                </TabsList>
                <TabsContent value="used" className="mt-6">
                  <div className="relative w-full mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by car name, model..."
                      className="pl-10 w-full text-base"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
                    <BodyTypeCard icon={<CarIcon size={32} className="text-primary"/>} label="Sedan" />
                    <BodyTypeCard icon={<Truck size={32} className="text-primary"/>} label="SUV" />
                    <BodyTypeCard icon={<CarIcon size={32} className="text-primary"/>} label="Hatchback" />
                    <BodyTypeCard icon={<Sparkles size={32} className="text-primary"/>} label="Luxury" />
                    <BodyTypeCard icon={<HandCoins size={32} className="text-primary"/>} label="Budget" />
                    <BodyTypeCard icon={<Building size={32} className="text-primary"/>} label="By City" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Featured Listings */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Featured Listings</h2>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {filteredCars.map(car => (
                  <CarouselItem key={car.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <CarCard car={car} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-16" />
              <CarouselNext className="mr-16" />
            </Carousel>
          </section>

          {/* Browse by Brand */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Browse by Brand</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <BrandCard logo={<MarutiLogo />} name="Maruti Suzuki" />
              <BrandCard logo={<HyundaiLogo />} name="Hyundai" />
              <BrandCard logo={<ToyotaLogo />} name="Toyota" />
              <BrandCard logo={<HondaLogo />} name="Honda" />
              <BrandCard logo={<TataLogo />} name="Tata" />
            </div>
            <div className="text-center mt-6">
              <Button variant="outline">View All Brands</Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
