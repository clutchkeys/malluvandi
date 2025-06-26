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
import { SlidersHorizontal, Search } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'brand' && !value) {
        newFilters.model = '';
      }
      return newFilters;
    });
  };
  
  const uniqueYears = [...new Set(approvedCars.map(car => car.year))].sort((a,b) => b-a);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Find Your Perfect Used Car</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Quality, trust, and the best deals on pre-owned cars in Kerala. Your next ride is just a click away.</p>
        </div>

        <Card className="mb-8 p-4 md:p-6 shadow-lg bg-card sticky top-20 z-30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {isClient ? (
              <>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Brand</label>
                    <Select onValueChange={value => handleFilterChange('brand', value === 'all-brands' ? '' : value)} value={filters.brand}>
                      <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-brands">All Brands</SelectItem>
                        {carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Model</label>
                    <Select onValueChange={value => handleFilterChange('model', value === 'all-models' ? '' : value)} value={filters.model} disabled={!filters.brand}>
                      <SelectTrigger><SelectValue placeholder="All Models" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-models">All Models</SelectItem>
                        {(filters.brand ? carModels[filters.brand] || [] : []).map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Year</label>
                    <Select onValueChange={value => handleFilterChange('year', value === 'all-years' ? '' : value)} value={filters.year}>
                      <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-years">Any Year</SelectItem>
                        {uniqueYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Color</label>
                    <Input
                      placeholder="e.g. Red"
                      value={filters.color}
                      onChange={e => handleFilterChange('color', e.target.value)}
                    />
                </div>
                 <Button size="lg" className="w-full"><Search className="mr-2"/> Search</Button>
              </>
            ) : (
                Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
                 <div className="mb-8">
                    <AdPlaceholder className="h-40" />
                 </div>
                 <h2 className="text-2xl font-bold mb-4">Featured Listings ({filteredCars.length})</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCars.map(car => (
                      <CarCard key={car.id} car={car} />
                    ))}
                 </div>
                 {filteredCars.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-card rounded-lg">
                        <p className="text-muted-foreground text-lg">No cars match the current filters.</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
