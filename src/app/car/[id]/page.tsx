
'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CarDetailSkeleton } from '@/components/car-detail-skeleton';

export default function CarDetailPage() {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError(true);
        return;
    };

    const fetchCar = async () => {
      try {
        setLoading(true);
        const carDocRef = doc(db, 'cars', id);
        const carDoc = await getDoc(carDocRef);

        if (!carDoc.exists() || carDoc.data().status !== 'approved') {
          setError(true);
        } else {
          setCar({ id: carDoc.id, ...carDoc.data() } as Car);
        }
      } catch (err) {
        console.error("Error fetching car:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (error) {
    notFound();
  }

  const sellerName = "Mallu Vandi";

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
            <CarDetailSkeleton />
        ) : car ? (
            <CarDetailView car={car} sellerName={sellerName} />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
