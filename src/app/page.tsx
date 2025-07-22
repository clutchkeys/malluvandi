'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarCard } from '@/components/car-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Loader2, Search } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Car } from '@/lib/types';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BrandCard = ({ logo, name }: { logo: React.ReactNode; name: string }) => (
  <Card className="flex flex-col items-center justify-center p-4 aspect-[4/3] hover:shadow-lg transition-shadow cursor-pointer bg-card/50 backdrop-blur-sm">
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
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [kmRange, setKmRange] = useState([0, 200000]);
  const [selectedOwnership, setSelectedOwnership] = useState('');

  // Filter options state
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<{[key: string]: string[]}>({});
  const [carYears, setCarYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch approved cars
        const carsCollectionRef = collection(db, 'cars');
        const q = query(carsCollectionRef, where('status', '==', 'approved'));
        const carsSnapshot = await getDocs(q);
        const carsList = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
        setAllCars(carsList);

        // Fetch filter config
        const filtersDocRef = doc(db, 'config', 'filters');
        const filtersDocSnap = await getDoc(filtersDocRef);
        if (filtersDocSnap.exists()) {
            const filtersData = filtersDocSnap.data();
            setCarBrands(filtersData.brands || []);
            setCarModels(filtersData.models || {});
            setCarYears(filtersData.years || []);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);


  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel(''); // Reset model when brand changes
  };
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setPriceRange([0, 5000000]);
    setKmRange([0, 200000]);
    setSelectedOwnership('');
  };

  const filteredCars = useMemo(() => {
    return allCars.filter(car => {
      const searchMatch = searchQuery
        ? `${car.brand} ${car.model} ${car.year} ${car.color}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const brandMatch = selectedBrand ? car.brand === selectedBrand : true;
      const modelMatch = selectedModel ? car.model === selectedModel : true;
      const yearMatch = selectedYear ? car.year.toString() === selectedYear : true;
      const priceMatch = car.price >= priceRange[0] && car.price <= priceRange[1];
      const kmMatch = car.kmRun >= kmRange[0] && car.kmRun <= kmRange[1];
      const ownershipMatch = selectedOwnership
        ? (
            selectedOwnership === '3'
                ? car.ownership >= 3
                : car.ownership.toString() === selectedOwnership
        ) : true;

      return searchMatch && brandMatch && modelMatch && yearMatch && priceMatch && kmMatch && ownershipMatch;
    });
  }, [searchQuery, selectedBrand, selectedModel, selectedYear, priceRange, kmRange, selectedOwnership, allCars]);


  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-card h-96 flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10" />
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
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Find Your Next Ride</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mt-4 max-w-3xl mx-auto">
              Kerala's most trusted marketplace for buying and selling quality pre-owned cars.
            </p>
            <div className="mt-8 max-w-2xl mx-auto">
                <div className="relative">
                    <Input
                        placeholder="Search by make, model, or keyword..."
                        className="w-full text-base h-14 pl-12 pr-32 bg-white/90 text-foreground"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"/>
                    <Button size="lg" className="absolute right-2 top-1/2 -translate-y-1/2">
                        Search
                    </Button>
                </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <div className="container mx-auto px-4 -mt-12 relative z-10">
          <Card className="shadow-2xl">
            <CardContent className="p-4 md:p-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div className="flex flex-col gap-2">
                    <Label>Brand</Label>
                    <Select value={selectedBrand} onValueChange={handleBrandChange}>
                        <SelectTrigger><SelectValue placeholder="Any Brand" /></SelectTrigger>
                        <SelectContent>
                            {carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="flex flex-col gap-2">
                    <Label>Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                        <SelectTrigger><SelectValue placeholder="Any Model" /></SelectTrigger>
                        <SelectContent>
                            {(carModels[selectedBrand] || []).map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="flex flex-col gap-2">
                    <Label>Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger><SelectValue placeholder="Any Year" /></SelectTrigger>
                        <SelectContent>
                            {carYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                        </SelectContent>
                    </Select>
                   </div>
                      
                  <Collapsible>
                      <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full">
                              <SlidersHorizontal className="mr-2 h-4 w-4" />
                              More Filters
                          </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="absolute mt-2 -ml-[300px] md:-ml-[450px] lg:-ml-[680px]">
                        <Card className="p-6 shadow-2xl w-[400px] md:w-[600px] lg:w-[900px]">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-4 border-t">
                              <div className="space-y-3">
                                  <Label htmlFor="price-range">Price Range</Label>
                                  <Slider
                                      id="price-range"
                                      value={priceRange}
                                      max={5000000}
                                      step={50000}
                                      onValueChange={setPriceRange}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>₹{priceRange[0].toLocaleString()}</span>
                                      <span>₹{priceRange[1].toLocaleString()}</span>
                                  </div>
                              </div>
                              <div className="space-y-3">
                                  <Label htmlFor="km-range">Kilometers</Label>
                                  <Slider
                                      id="km-range"
                                      value={kmRange}
                                      max={200000}
                                      step={5000}
                                      onValueChange={setKmRange}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{kmRange[0].toLocaleString()} km</span>
                                      <span>{kmRange[1].toLocaleString()} km</span>
                                  </div>
                              </div>
                              <div className="space-y-3">
                                  <Label>Ownership</Label>
                                  <Select value={selectedOwnership} onValueChange={setSelectedOwnership}>
                                      <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="1">First Owner</SelectItem>
                                          <SelectItem value="2">Second Owner</SelectItem>
                                          <SelectItem value="3">Third or more</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                          </div>
                           <div className="flex justify-end pt-4 mt-4 border-t">
                              <Button onClick={handleResetFilters} variant="ghost">Reset Filters</Button>
                          </div>
                        </Card>
                      </CollapsibleContent>
                  </Collapsible>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Featured Listings */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Featured Listings</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : filteredCars.length > 0 ? (
                    <>
                        {filteredCars.slice(0, 3).map(car => <CarCard key={car.id} car={car} />)}
                        <AdPlaceholder shape="post" />
                        {filteredCars.slice(3, 7).map(car => <CarCard key={car.id} car={car} />)}
                        <AdPlaceholder shape="post" />
                        {filteredCars.slice(7).map(car => <CarCard key={car.id} car={car} />)}
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
