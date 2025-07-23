
import React from 'react';
import { notFound } from 'next/navigation';
import type { Car, User } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { MOCK_CARS, MOCK_USERS } from '@/lib/mock-data';

async function getCar(id: string): Promise<Car | null> {
    const car = MOCK_CARS.find(c => c.id === id) || null;
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return car;
}

async function getSeller(userId: string): Promise<User | null> {
    const user = MOCK_USERS.find(u => u.id === userId) || null;
    await new Promise(resolve => setTimeout(resolve, 50));
    return user;
}


export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const car = await getCar(params.id);

  if (!car) {
    notFound();
  }

  const seller = car.submittedBy ? await getSeller(car.submittedBy) : null;
  const sellerName = seller && seller.role !== 'customer' ? seller.name : "Mallu Vandi";

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CarDetailView car={car} sellerName={sellerName} />
      </main>
      <Footer />
    </div>
  );
}
