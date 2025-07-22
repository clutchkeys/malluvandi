
import React from 'react';
import { notFound } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getCar(id: string): Promise<Car | null> {
    try {
        const carDocRef = doc(db, 'cars', id);
        const carDocSnap = await getDoc(carDocRef);

        if (carDocSnap.exists()) {
            // Only return approved cars to the public
            const carData = carDocSnap.data();
            if (carData.status === 'approved') {
                 return { id: carDocSnap.id, ...carData } as Car;
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching car:", error);
        return null;
    }
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

// This function can be used by Next.js to generate static pages at build time
// for better performance, but it's not strictly necessary for dynamic pages.
// export async function generateStaticParams() {
//   // For now, we won't pre-render any car pages. They will be server-rendered on-demand.
//   return [];
// }
