'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import { approvedCars, carBrands, carModels } from '@/lib/data';
import type { Car } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { FullScreenAd } from '@/components/full-screen-ad';
import { InquiryModal } from '@/components/inquiry-modal';
import { SlidersHorizontal } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
  });
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleContactClick = (car: Car) => {
    setSelectedCar(car);
    setIsAdOpen(true);
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
    setIsModalOpen(true);
  };

  const filteredCars = useMemo(() => {
    return approvedCars.filter(car => {
      return (
        (filters.brand ? car.brand === filters.brand : true) &&
        (filters.model ? car.model === filters.model : true) &&
        (filters.year ? car.year.toString() === filters.year : true) &&
        (filters.color ? car.color.toLowerCase().includes(filters.color.toLowerCase()) : true)
      );
    });
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const uniqueYears = [...new Set(approvedCars.map(car => car.year))].sort((a,b) => b-a);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Find Your Next Ride</h1>
          <p className="text-lg text-muted-foreground mt-2">The best place for quality used cars in Kerala.</p>
        </div>

        <Card className="mb-8 p-4 md:p-6 shadow-lg bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            <h3 className="text-lg font-semibold lg:col-span-1 hidden lg:flex items-center gap-2"><SlidersHorizontal size={20} /> Filters</h3>
            {isClient ? (
              <>
                <Select onValueChange={value => handleFilterChange('brand', value)} value={filters.brand}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    {carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select onValueChange={value => handleFilterChange('model', value)} value={filters.model}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Models</SelectItem>
                    {(filters.brand ? carModels[filters.brand] || [] : Object.values(carModels).flat()).map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={value => handleFilterChange('year', value)} value={filters.year}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Year</SelectItem>
                    {uniqueYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Color"
                  value={filters.color}
                  onChange={e => handleFilterChange('color', e.target.value)}
                />
              </>
            ) : (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-1 space-y-8">
                 <AdPlaceholder className="h-64" />
                 <AdPlaceholder className="h-64" />
                 <AdPlaceholder className="h-64" />
            </div>

            <div className="md:col-span-4">
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCars.map(car => (
                      <CarCard key={car.id} car={car} onContact={handleContactClick} />
                    ))}
                    {filteredCars.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">No cars match the current filters.</p>
                    )}
                 </div>
            </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdPlaceholder className="h-32" />
            <AdPlaceholder className="h-32" />
            <AdPlaceholder className="h-32" />
            <AdPlaceholder className="h-32" />
        </div>
      </main>
      <Footer />
      {selectedCar && (
        <>
          <FullScreenAd isOpen={isAdOpen} onClose={handleAdClose} />
          <InquiryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            car={selectedCar}
          />
        </>
      )}
    </div>
  );
}
