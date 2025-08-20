
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CarCard } from '@/components/car-card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, MapPin, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { Car } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { ScrollArea } from '@/components/ui/scroll-area';

const keralaDistricts = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

interface PageContentProps {
  initialCars: Car[];
  brands: string[];
  models: { [key: string]: string[] };
  years: number[];
}

const CARS_PER_PAGE = 18;

export function PageContent({ initialCars, brands, models, years }: PageContentProps) {
  const searchParams = useSearchParams();
  const [userLocation, setUserLocation] = useState("Kochi, Kerala");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(userLocation);
  const [visibleCount, setVisibleCount] = useState(CARS_PER_PAGE);

  // Filters values
  const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.get('brand')?.split(',') || []);
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [selectedRegYear, setSelectedRegYear] = useState(searchParams.get('regyear') || '');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [kmRange, setKmRange] = useState([0, 200000]);

  const resetVisibleCount = () => setVisibleCount(CARS_PER_PAGE);
  
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + CARS_PER_PAGE);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands(prev => 
      checked
        ? [...prev, brand] 
        : prev.filter(b => b !== brand)
    );
    setSelectedModel(''); // Reset model when brand changes
  };
  
  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedModel('');
    setSelectedYear('');
    setSelectedRegYear('');
    setPriceRange([0, 5000000]);
    setKmRange([0, 200000]);
  };
  
  const handleLocationSave = () => {
    setUserLocation(tempLocation);
    setIsLocationModalOpen(false);
  }

  const availableModels = useMemo(() => {
    if (selectedBrands.length === 1) {
        return models[selectedBrands[0]] || [];
    }
    return [];
  }, [selectedBrands, models]);

  const filteredCars = useMemo(() => {
    const isKmRangeDefault = kmRange[0] === 0 && kmRange[1] === 200000;

    return initialCars.filter(car => {
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(car.brand) : true;
      const modelMatch = selectedModel ? car.model === selectedModel : true;
      const yearMatch = selectedYear ? car.year?.toString() === selectedYear : true;
      const regYearMatch = selectedRegYear ? car.year?.toString() === selectedRegYear : true;
      const priceMatch = car.price ? car.price >= priceRange[0] && car.price <= priceRange[1] : true;
      
      const kmMatch = isKmRangeDefault
          ? true
          : car.kmRun !== undefined && car.kmRun >= kmRange[0] && car.kmRun <= kmRange[1];

      return brandMatch && modelMatch && yearMatch && regYearMatch && priceMatch && kmMatch;
    });
  }, [selectedBrands, selectedModel, selectedYear, selectedRegYear, priceRange, kmRange, initialCars]);

  const carsToShow = useMemo(() => filteredCars.slice(0, visibleCount), [filteredCars, visibleCount]);

  useEffect(() => {
    resetVisibleCount();
  }, [selectedBrands, selectedModel, selectedYear, selectedRegYear, priceRange, kmRange]);


  const FilterContent = () => (
    <div className="space-y-6">
        <div>
            <h3 className="font-semibold mb-4 text-lg">Brands</h3>
            <div className="space-y-3">
                {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                        <Checkbox id={`filter-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}/>
                        <label htmlFor={`filter-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{brand}</label>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h3 className="font-semibold mb-4 text-lg">Model</h3>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={selectedBrands.length !== 1}>
                <SelectTrigger><SelectValue placeholder="Select a brand first" /></SelectTrigger>
                <SelectContent>
                    {availableModels.map(model => <SelectItem key={model} value={String(model)}>{model}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div>
            <h3 className="font-semibold mb-4 text-lg">Model Year</h3>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
                <SelectContent>
                    {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div>
            <h3 className="font-semibold mb-4 text-lg">Registration Year</h3>
            <Select value={selectedRegYear} onValueChange={setSelectedRegYear}>
                <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
                <SelectContent>
                    {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-3">
            <Label htmlFor="price-range">Price Range</Label>
            <Slider id="price-range" value={priceRange} max={5000000} step={50000} onValueChange={setPriceRange}/>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
        </div>
        <div className="space-y-3">
            <Label htmlFor="km-range">Kilometers</Label>
            <Slider id="km-range" value={kmRange} max={200000} step={5000} onValueChange={setKmRange}/>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{kmRange[0].toLocaleString()} km</span>
                <span>{kmRange[1].toLocaleString()} km</span>
            </div>
        </div>
          <div className="pt-4 border-t">
            <Button onClick={handleResetFilters} variant="outline" className="w-full">Reset Filters</Button>
        </div>
    </div>
  );


  return (
    <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-6 gap-4">
            <h2 className="text-2xl font-bold">All Listings ({filteredCars.length})</h2>
            <div className="w-full md:w-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer" onClick={() => { setTempLocation(userLocation); setIsLocationModalOpen(true); }}>
                <MapPin size={16} className="text-primary"/>
                <span>Location: <b>{userLocation}</b></span>
                <Edit2 size={14}/>
            </div>
                <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4"/> Filters</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100%-4rem)]">
                            <div className="py-4 pr-6">
                                <FilterContent />
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24">
                <Card className="shadow-lg">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Filters</h3>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <FilterContent />
                    </CardContent>
                </Card>
            </aside>
            
            <section className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {carsToShow.length > 0 ? (
                        carsToShow.map((car, index) => (
                           <React.Fragment key={car.id}>
                                <CarCard car={car} />
                                {(index + 1) % 6 === 3 && <div className="hidden sm:block xl:block col-span-1 row-span-1"><AdPlaceholder shape="post" /></div>}
                           </React.Fragment>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg">
                            <p className="text-lg font-semibold">No cars match your current filters.</p>
                            <p className="text-sm mt-1">Try adjusting your search criteria or resetting filters.</p>
                            <Button onClick={handleResetFilters} variant="outline" className="mt-4">Reset All Filters</Button>
                        </div>
                    )}
                </div>

                {filteredCars.length > visibleCount && (
                    <div className="text-center mt-8">
                        <Button onClick={handleLoadMore} size="lg">
                            Load More ({filteredCars.length - visibleCount} remaining)
                        </Button>
                    </div>
                )}
            </section>
        </div>

        <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Location</DialogTitle>
                    <DialogDescription>Select your district to find cars near you.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="location-select">District</Label>
                    <Select value={tempLocation} onValueChange={setTempLocation}>
                        <SelectTrigger id="location-select">
                            <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                            {keralaDistricts.map(district => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsLocationModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleLocationSave}>Save Location</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
