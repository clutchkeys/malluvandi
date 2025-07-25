
import React from 'react';
import { notFound } from 'next/navigation';
import type { Car, User } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { MOCK_CARS, MOCK_USERS } from '@/lib/mock-data';
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

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

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  const car = await getCar(id)
 
  if (!car) {
    return {
      title: 'Car Not Found',
    }
  }
 
  return {
    title: `Used ${car.year} ${car.brand} ${car.model} for Sale | Mallu Vandi`,
    description: `Check out this ${car.color} ${car.brand} ${car.model} with ${car.kmRun} km run. Inquire for the best price at Mallu Vandi, Kerala's trusted used car dealer.`,
  }
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
