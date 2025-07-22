'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2, Search, MapPin, Edit2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { Car } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { AdPlaceholder } from '@/components/ad-placeholder';

const mockCars: Car[] = [
  {
    id: '1',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    year: 2021,
    price: 650000,
    kmRun: 25000,
    color: 'Red',
    ownership: 1,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: 'Excellent condition, single owner.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user1',
    badges: ['price_drop', 'featured']
  },
  {
    id: '2',
    brand: 'Hyundai',
    model: 'i20',
    year: 2020,
    price: 720000,
    kmRun: 35000,
    color: 'White',
    ownership: 1,
    insurance: 'Third Party',
    challans: 'None',
    additionalDetails: 'Well maintained, no scratches.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user2',
    badges: ['new']
  },
  {
    id: '3',
    brand: 'Tata',
    model: 'Nexon',
    year: 2022,
    price: 850000,
    kmRun: 15000,
    color: 'Blue',
    ownership: 1,
    insurance: 'Comprehensive',
    challans: '1 Pending',
    additionalDetails: 'Top model with sunroof.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user3',
    badges: ['featured']
  },
   {
    id: '4',
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2019,
    price: 2800000,
    kmRun: 55000,
    color: 'Black',
    ownership: 2,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: '4x4 variant, immaculate condition.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user4',
  },
    {
    id: '5',
    brand: 'Honda',
    model: 'City',
    year: 2023,
    price: 1200000,
    kmRun: 8000,
    color: 'Silver',
    ownership: 1,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: 'Almost new, very sparingly used.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user5',
    badges: ['new']
  },
];


const carBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Toyota', 'Honda'];
const carBodyTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV'];
const carYears = [2023, 2022, 2021, 2020, 2019];

export default function Home() {
  const [allCars] = useState<Car[]>(mockCars);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("Kochi, Kerala");

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [kmRange, setKmRange] = useState([0, 200000]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleBodyTypeChange = (type: string) => {
    setSelectedBodyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedBodyTypes([]);
    setSelectedYear('');
    setPriceRange([0, 5000000]);
    setKmRange([0, 200000]);
  };

  const filteredCars = useMemo(() => {
    return allCars.filter(car => {
      const searchMatch = searchQuery
        ? `${car.brand} ${car.model} ${car.year} ${car.color}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(car.brand) : true;
      const yearMatch = selectedYear ? car.year.toString() === selectedYear : true;
      const priceMatch = car.price >= priceRange[0] && car.price <= priceRange[1];
      const kmMatch = car.kmRun >= kmRange[0] && car.kmRun <= kmRange[1];

      // Note: Body type is not in mock data, so this filter won't work without updating Car type and mock data
      const bodyTypeMatch = true; 

      return searchMatch && brandMatch && bodyTypeMatch && yearMatch && priceMatch && kmMatch;
    });
  }, [searchQuery, selectedBrands, selectedBodyTypes, selectedYear, priceRange, kmRange, allCars]);


  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-card h-[50vh] flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Hero Banner of a modern car"
            layout="fill"
            objectFit="cover"
            className="z-0"
            data-ai-hint="car driving sunset"
            priority
          />
          <div className="relative z-20 container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Find Your Next Ride</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mt-4 max-w-3xl mx-auto">
              Kerala's most trusted marketplace for buying and selling quality pre-owned cars.
            </p>
            <div className="mt-8 max-w-2xl mx-auto">
                <div className="relative">
                    <Input
                        placeholder="Search by make, model, or keyword..."
                        className="w-full text-base h-14 pl-12 pr-4 bg-white/90 text-foreground"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"/>
                </div>
                 <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
                    <span className="text-sm font-medium mr-2">Popular:</span>
                    {['Maruti Suzuki', 'Hyundai', 'SUV', 'Sedan'].map(tag => (
                        <Button key={tag} size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full text-xs h-7 px-3">
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Featured Listings</h2>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} className="text-primary"/>
                    <span>Your Location: <b>{userLocation}</b></span>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 size={14}/></Button>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1 lg:sticky lg:top-24">
                    <Card className="shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold mb-4 text-lg">Brands</h3>
                                <div className="space-y-3">
                                    {carBrands.map(brand => (
                                        <div key={brand} className="flex items-center space-x-2">
                                            <Checkbox id={brand} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)}/>
                                            <label htmlFor={brand} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{brand}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-lg">Body Type</h3>
                                <div className="space-y-3">
                                    {carBodyTypes.map(type => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox id={type} checked={selectedBodyTypes.includes(type)} onCheckedChange={() => handleBodyTypeChange(type)}/>
                                            <label htmlFor={type} className="text-sm font-medium leading-none">{type}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold mb-4 text-lg">Year</h3>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
                                    <SelectContent>
                                        {carYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
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
                                <Button onClick={handleResetFilters} variant="ghost" className="w-full">Reset All Filters</Button>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
                
                {/* Listings */}
                <section className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {isLoading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        ) : filteredCars.length > 0 ? (
                            <>
                                {filteredCars.slice(0, 3).map(car => <CarCard key={car.id} car={car} />)}
                                <div className="hidden xl:block"><AdPlaceholder shape="post" /></div>
                                {filteredCars.slice(3).map(car => <CarCard key={car.id} car={car} />)}
                            </>
                        ) : (
                            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg">
                                <p className="text-lg font-semibold">No cars match your current filters.</p>
                                <p className="text-sm mt-1">Try adjusting your search criteria or resetting filters.</p>
                                <Button onClick={handleResetFilters} variant="outline" className="mt-4">Reset All Filters</Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
             {/* Nearby Cars Section */}
            <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Cars Near You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allCars.slice(0, 4).map(car => (
                         <CarCard key={car.id} car={car} />
                    ))}
                </div>
            </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
