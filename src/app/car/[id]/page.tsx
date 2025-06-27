import React from 'react';
import { notFound } from 'next/navigation';
import { cars, approvedCars } from '@/lib/data';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';

export async function generateStaticParams() {
  return approvedCars.map((car) => ({
    id: car.id,
  }));
}

const getCarById = (id: string): Car | undefined => {
  return cars.find(c => c.id === id);
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const car = getCarById(params.id);

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
