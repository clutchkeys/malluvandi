
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Bookmark, Frown } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Car } from '@/lib/types';
import { CarCard } from '@/components/car-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SavedCarsPage() {
  const [savedCarIds, setSavedCarIds] = useState<string[]>([]);
  const [savedCars, setSavedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    try {
      const storedIds = JSON.parse(localStorage.getItem('savedCars') || '[]') as string[];
      setSavedCarIds(storedIds);
    } catch (e) {
      console.error("Failed to parse saved cars from localStorage", e);
      setSavedCarIds([]);
    }
  }, []);

  useEffect(() => {
    if (savedCarIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchSavedCars = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .in('id', savedCarIds);
      
      if (error) {
        console.error("Error fetching saved cars", error);
        setSavedCars([]);
      } else {
        // Preserve the order from localStorage
        const carMap = new Map(data.map(car => [car.id, car]));
        const orderedCars = savedCarIds.map(id => carMap.get(id)).filter(Boolean) as Car[];
        setSavedCars(orderedCars);
      }
      setLoading(false);
    };

    fetchSavedCars();
  }, [savedCarIds, supabase]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
        <h1 className="text-3xl font-semibold">My Saved Cars</h1>
        <p className="text-muted-foreground text-sm">You have {savedCars.length} car(s) saved.</p>
      </div>

      {savedCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center py-20">
            <CardHeader>
                <div className="mx-auto bg-muted p-4 rounded-full">
                   <Frown className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">You have no saved cars</CardTitle>
                <CardDescription>
                    Click the bookmark icon on any listing to save it here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Browse Cars</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
