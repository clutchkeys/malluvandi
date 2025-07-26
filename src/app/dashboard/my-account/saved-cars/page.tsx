
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2, Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarCard } from '@/components/car-card';
import type { Car } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SavedCarsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [savedCars, setSavedCars] = useState<Car[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCarsLoading, setIsCarsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login?redirect=/my-account/saved-cars');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchSavedCars = async () => {
        if (isClient) {
            setIsCarsLoading(true);
            try {
                const savedCarIds = JSON.parse(localStorage.getItem('savedCars') || '[]') as string[];
                const carPromises = savedCarIds.map(id => getDoc(doc(db, 'cars', id)));
                const carDocs = await Promise.all(carPromises);
                const cars = carDocs
                    .filter(doc => doc.exists())
                    .map(doc => ({ id: doc.id, ...doc.data() } as Car));
                setSavedCars(cars);
            } catch (error) {
                console.error("Error fetching saved cars from localStorage or Firestore", error);
            } finally {
                setIsCarsLoading(false);
            }
        }
    };
    fetchSavedCars();
  }, [isClient]);

  if (loading || !user || !isClient || isCarsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">My Saved Cars</h1>
      {savedCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center py-20">
            <CardHeader>
                <div className="mx-auto bg-muted p-4 rounded-full">
                   <Bookmark className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">You have no saved cars</CardTitle>
                <CardDescription>
                    Click the bookmark icon on any listing to save it for later.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
