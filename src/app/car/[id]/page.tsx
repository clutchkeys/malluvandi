
import React from 'react';
import { notFound } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Metadata, ResolvingMetadata } from 'next'

export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getCar(id: string): Promise<Car | null> {
    const carDocRef = doc(db, 'cars', id);
    const carDoc = await getDoc(carDocRef);
    if (!carDoc.exists()) {
        return null;
    }
    const carData = carDoc.data();
    if (carData.status !== 'approved') {
      return null; // Don't show non-approved cars on public pages
    }
    return { id: carDoc.id, ...carData } as Car;
}

export async function generateMetadata(
  { params }: Props,
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

  const sellerName = "Mallu Vandi";

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
