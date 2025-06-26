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
import { SlidersHorizontal, Search, XIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredCars = useMemo(() => {
    return approvedCars.filter(car => {
      const searchTermMatch = searchQuery
        ? `${car.brand} ${car.model} ${car.year} ${car.color}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return (
        searchTermMatch &&
        (filters.brand ? car.brand === filters.brand : true) &&
        (filters.model ? car.model === filters.model : true) &&
        (filters.year ? car.year.toString() === filters.year : true) &&
        (filters.color ? car.color.toLowerCase().includes(filters.color.toLowerCase()) : true)
      );
    });
  }, [filters, searchQuery]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'brand') { // Reset model if brand changes
        newFilters.model = '';
      }
      return newFilters;
    });
  };
  
  const clearFilters = () => {
    setFilters({ brand: '', model: '', year: '', color: '' });
    setSearchQuery('');
  }

  const uniqueYears = [...new Set(approvedCars.map(car => car.year))].sort((a,b) => b-a);
  const uniqueColors = [...new Set(approvedCars.map(car => car.color))];


  const FilterControls = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div className="space-y-1.5 lg:col-span-1">
          <label className="text-sm font-medium text-muted-foreground">Brand</label>
          <Select onValueChange={value => handleFilterChange('brand', value)} value={filters.brand}>
            <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
            </SelectContent>
          </Select>
      </div>
      <div className="space-y-1.5 lg:col-span-1">
          <label className="text-sm font-medium text-muted-foreground">Model</label>
          <Select onValueChange={value => handleFilterChange('model', value)} value={filters.model} disabled={!filters.brand}>
            <SelectTrigger><SelectValue placeholder="All Models" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Models</SelectItem>
              {(filters.brand ? carModels[filters.brand] || [] : []).map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>
      <div className="space-y-1.5 lg:col-span-1">
          <label className="text-sm font-medium text-muted-foreground">Year</label>
          <Select onValueChange={value => handleFilterChange('year', value)} value={filters.year}>
            <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Year</SelectItem>
              {uniqueYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
      </div>
      <div className="space-y-1.5 lg:col-span-1">
          <label className="text-sm font-medium text-muted-foreground">Color</label>
           <Select onValueChange={value => handleFilterChange('color', value)} value={filters.color}>
            <SelectTrigger><SelectValue placeholder="Any Color" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Color</SelectItem>
              {uniqueColors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
            </SelectContent>
          </Select>
      </div>
      <div className="flex items-end lg:col-span-1">
        <Button variant="ghost" onClick={clearFilters} className="w-full">Clear Filters</Button>
      </div>
    </div>
  );


  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Find Your Perfect Used Car</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Quality, trust, and the best deals on pre-owned cars in Kerala. Your next ride is just a click away.</p>
        </div>

        <Card className="mb-8 p-4 md:p-6 shadow-lg bg-card sticky top-[65px] z-30">
            <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by car name, model, year, or color..."
                    className="pl-10 w-full text-base"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:block">
              <FilterControls />
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden">
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> 
                    {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <FilterControls />
                </CollapsibleContent>
              </Collapsible>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-4">
                 <div className="mb-8">
                    <AdPlaceholder shape="banner" />
                 </div>
                 <h2 className="text-2xl font-bold mb-6">Featured Listings ({filteredCars.length})</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredCars.slice(0, 3).map(car => (
                      <CarCard key={car.id} car={car} />
                    ))}
                    <AdPlaceholder shape="post" className="xl:col-span-1 md:col-span-2" />
                    {filteredCars.slice(3, 8).map(car => (
                      <CarCard key={car.id} car={car} />
                    ))}
                 </div>

                 {filteredCars.length > 8 && (
                    <>
                        <AdPlaceholder shape="banner" className="my-8"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {filteredCars.slice(8, 12).map(car => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    </>
                 )}

                 {filteredCars.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-card rounded-lg">
                        <p className="text-muted-foreground text-lg">No cars match the current filters.</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                  <AdPlaceholder shape="square"/>
                  <AdPlaceholder shape="square"/>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
