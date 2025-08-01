
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2, Search, MapPin, Edit2, X, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { Car } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { BrandMarquee } from '@/components/brand-marquee';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';

const keralaDistricts = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

export default function Home() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Kochi, Kerala");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(userLocation);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [popularBrands, setPopularBrands] = useState<string[]>([]);

  // Filter options state
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<{[key: string]: string[]}>({});
  const [years, setYears] = useState<number[]>([]);
  const carBodyTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV'];

  // Filters values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [kmRange, setKmRange] = useState([0, 200000]);

   useEffect(() => {
    setIsLoading(true);
    setUserLocation('Ernakulam');
    setTempLocation('Ernakulam');

    // Fetch filter configs
    const fetchFilters = async () => {
        const configRef = doc(db, "config", "filters");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
            const configData = configSnap.data();
            setBrands(configData.brands || []);
            setModels(configData.models || {});
            setYears(configData.years || []);
        }
    }
    fetchFilters();

    // Set up real-time listener for cars
    const carsRef = collection(db, 'cars');
    const q = query(carsRef, where('status', '==', 'approved'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const carsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
        setAllCars(carsData);

        // Recalculate everything that depends on car data
        const brandCounts: { [key: string]: number } = {};
        for (const car of carsData) {
            brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
        }
        const sortedBrands = Object.entries(brandCounts)
            .sort(([,a],[,b]) => b - a)
            .map(([brand]) => brand);
        const popularBrandsData = sortedBrands.slice(0, 4);
        setPopularBrands(popularBrandsData);
        
        // Recommendation logic
        try {
            const viewedCarIds = JSON.parse(localStorage.getItem('viewedCars') || '[]') as string[];
            if (viewedCarIds.length > 0) {
                const lastViewedId = viewedCarIds[0];
                const lastViewedCar = carsData.find(c => c.id === lastViewedId);

                if (lastViewedCar) {
                    const recommendationsData = carsData
                        .filter(c => c.brand === lastViewedCar.brand && c.id !== lastViewedId && !viewedCarIds.includes(c.id))
                        .slice(0, 4);
                    setRecommendedCars(recommendationsData);
                }
            }
        } catch (error) {
            console.error("Could not get recommendations:", error);
        }
        
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching cars in real-time:", error);
        setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };
  
  const handleBrandClickFromMarquee = (brand: string) => {
    if (brands.includes(brand)) {
      setSelectedBrands([brand]);
      document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handlePopularTagClick = (brand: string) => {
    setSelectedBrands([brand]);
    document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
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
  
  const handleLocationSave = () => {
    setUserLocation(tempLocation);
    setIsLocationModalOpen(false);
  }

  const filteredCars = useMemo(() => {
    const isInstagramSearch = searchQuery.trim().startsWith('https://www.instagram.com/');
    
    const getInstagramIdFromUrl = (url: string | undefined): string | null => {
        if (!url) return null;
        try {
            const path = new URL(url).pathname;
            const segments = path.split('/').filter(Boolean); // e.g., ['p', 'Cz...'] or ['reel', 'Cz...']
            if ((segments[0] === 'p' || segments[0] === 'reel') && segments[1]) {
                return segments[1];
            }
            return null;
        } catch (e) {
            return null; // Invalid URL
        }
    };

    if (isInstagramSearch) {
        const searchId = getInstagramIdFromUrl(searchQuery);
        if (!searchId) return allCars; // Fallback to showing all if URL is invalid
        return allCars.filter(car => getInstagramIdFromUrl(car.instagramReelUrl) === searchId);
    }
    
    const isKmRangeDefault = kmRange[0] === 0 && kmRange[1] === 200000;

    return allCars.filter(car => {
      const searchMatch = searchQuery
        ? `${car.brand} ${car.model} ${car.year} ${car.color}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(car.brand) : true;
      const yearMatch = selectedYear ? car.year?.toString() === selectedYear : true;
      const priceMatch = car.price ? car.price >= priceRange[0] && car.price <= priceRange[1] : true;
      
      const kmMatch = isKmRangeDefault
          ? true // Don't filter by km if slider is at default
          : car.kmRun !== undefined && car.kmRun >= kmRange[0] && car.kmRun <= kmRange[1];

      const bodyTypeMatch = true; 

      return searchMatch && brandMatch && bodyTypeMatch && yearMatch && priceMatch && kmMatch;
    });
  }, [searchQuery, selectedBrands, selectedBodyTypes, selectedYear, priceRange, kmRange, allCars]);

  const FilterContent = () => (
    <div className="space-y-6">
        <div>
            <h3 className="font-semibold mb-4 text-lg">Brands</h3>
            <div className="space-y-3">
                {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                        <Checkbox id={`filter-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)}/>
                        <label htmlFor={`filter-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{brand}</label>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h3 className="font-semibold mb-4 text-lg">Body Type</h3>
            <div className="space-y-3">
                {carBodyTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={`filter-${type}`} checked={selectedBodyTypes.includes(type)} onCheckedChange={() => handleBodyTypeChange(type)}/>
                        <label htmlFor={`filter-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{type}</label>
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
    </div>
  );


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
            <div className="mt-8 max-w-2xl mx-auto">
                <div className="relative">
                    <Input
                        placeholder="Search by make, model, or paste an IG Reel link..."
                        className="w-full text-base h-14 pl-12 pr-4 bg-background text-foreground"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"/>
                </div>
                 <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
                    <span className="text-sm font-medium mr-2">Popular:</span>
                    {popularBrands.map(tag => (
                        <Button key={tag} size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full text-xs h-7 px-3" onClick={() => handlePopularTagClick(tag)}>
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {recommendedCars.length > 0 && (
            <section className="py-12 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Star className="text-yellow-400" /> Recommended For You
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {recommendedCars.map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                </div>
            </section>
        )}

        <div id="listings-section" className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <h2 className="text-2xl font-bold">All Listings</h2>
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
                        <CardContent className="p-6">
                            <FilterContent />
                        </CardContent>
                    </Card>
                </aside>
                
                <section className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {isLoading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        ) : filteredCars.length > 0 ? (
                            <>
                                {filteredCars.slice(0, 3).map(car => <CarCard key={car.id} car={car} />)}
                                <div className="hidden sm:block xl:block col-span-1"><AdPlaceholder shape="post" /></div>
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
        </div>
      
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Browse by Brands</h2>
              <BrandMarquee onBrandClick={handleBrandClickFromMarquee}/>
          </div>
        </section>
      </main>

      <Footer />

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
    </div>
  );
}
