
import React from 'react';
import { notFound } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { MOCK_CARS } from '@/lib/mock-data';

async function getCar(id: string): Promise<Car | null> {
    const car = MOCK_CARS.find(c => c.id === id) || null;
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return car;
}


export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const car = await getCar(params.id);

  if (!car) {
    notFound();
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
