'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        const carDocRef = doc(db, 'cars', params.id);
        const carDocSnap = await getDoc(carDocRef);

        if (carDocSnap.exists()) {
          setCar({ id: carDocSnap.id, ...carDocSnap.data() } as Car);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching car:", error);
        notFound();
      }
      setLoading(false);
    };

    fetchCar();
  }, [params.id]);

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <Skeleton className="w-full h-48 rounded-lg" />
                </div>
                <div className="md:col-span-1">
                    <Skeleton className="w-full h-96 rounded-lg" />
                </div>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CarDetailView car={car} />
      </main>
      <Footer />
    </div>
  );
}
