'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2, Search, MapPin, Edit2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { Car } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


export default function Home() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [nearbyCars, setNearbyCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Kochi, Kerala");

  // Filter options state
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<{[key: string]: string[]}>({});
  const [years, setYears] = useState<number[]>([]);
  const carBodyTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV']; // This can be moved to Firestore as well

  // Filters values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [kmRange, setKmRange] = useState([0, 200000]);

   useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // Fetch cars
            const carsQuery = query(collection(db, 'cars'), where('status', '==', 'approved'));
            const carsSnapshot = await getDocs(carsQuery);
            const carsList = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
            setAllCars(carsList);

            // Separate featured and nearby cars from the main list for display
            // This logic can be more sophisticated, e.g., fetching specifically featured cars
            setFeaturedCars(carsList.filter(c => c.badges?.includes('featured')).slice(0, 8));
            setNearbyCars(carsList.slice(0, 4)); // Placeholder for actual location-based filtering

        } catch (error) {
            console.error("Failed to fetch cars:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchInitialData();
  }, []);

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

      // Note: Body type is not in car data, so this filter won't work without updating Car type and data
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
                                    {brands.map(brand => (
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
                    {isLoading ? (
                         Array.from({length: 4}).map((_, i) => (
                            <Card key={i}>
                                <Skeleton className="h-48 w-full"/>
                                <CardContent className="p-3 space-y-2">
                                    <Skeleton className="h-5 w-3/4"/>
                                    <Skeleton className="h-6 w-1/2"/>
                                    <Skeleton className="h-4 w-full"/>
                                </CardContent>
                                <CardFooter className="p-3">
                                    <Skeleton className="h-9 w-full"/>
                                </CardFooter>
                            </Card>
                        ))
                    ) : nearbyCars.map(car => (
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
