
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BikeCard } from '@/components/bike-card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { Bike } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { MOCK_BIKES } from '@/lib/mock-data';

const bikeBrands = ['Royal Enfield', 'Bajaj', 'TVS', 'Yamaha', 'KTM', 'Hero', 'Honda'];
const bikeYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018];

export default function BikesPage() {
  const [allBikes, setAllBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [kmRange, setKmRange] = useState([0, 100000]);

  useEffect(() => {
    setIsLoading(true);
    setAllBikes(MOCK_BIKES);
    setIsLoading(false);
  }, []);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedYear('');
    setPriceRange([0, 500000]);
    setKmRange([0, 100000]);
  };

  const filteredBikes = useMemo(() => {
    return allBikes.filter(bike => {
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(bike.brand) : true;
      const yearMatch = selectedYear ? bike.year.toString() === selectedYear : true;
      const priceMatch = bike.price >= priceRange[0] && bike.price <= priceRange[1];
      const kmMatch = bike.kmRun >= kmRange[0] && bike.kmRun <= kmRange[1];
      return brandMatch && yearMatch && priceMatch && kmMatch;
    });
  }, [selectedBrands, selectedYear, priceRange, kmRange, allBikes]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 text-lg">Brands</h3>
        <div className="space-y-3">
          {bikeBrands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox id={`filter-bike-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)} />
              <label htmlFor={`filter-bike-${brand}`} className="text-sm font-medium">{brand}</label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-4 text-lg">Year</h3>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
          <SelectContent>
            {bikeYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label>Price Range</Label>
        <Slider value={priceRange} max={500000} step={10000} onValueChange={setPriceRange} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Kilometers</Label>
        <Slider value={kmRange} max={100000} step={2500} onValueChange={setKmRange} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{kmRange[0].toLocaleString()} km</span>
          <span>{kmRange[1].toLocaleString()} km</span>
        </div>
      </div>
      <div className="pt-4 border-t">
        <Button onClick={handleResetFilters} variant="ghost" className="w-full">Reset All Filters</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold">Find Your Next Bike</h2>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="py-4"><FilterContent /></div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          <section className="lg:col-span-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredBikes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredBikes.map(bike => <BikeCard key={bike.id} bike={bike} />)}
              </div>
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg">
                <p className="text-lg font-semibold">No bikes match your current filters.</p>
                <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                <Button onClick={handleResetFilters} variant="outline" className="mt-4">Reset Filters</Button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    