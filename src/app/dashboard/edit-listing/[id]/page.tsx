
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarForm } from '@/components/car-form';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';


async function getData(id: string) {
  const supabase = createClient();
  
  const carPromise = supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();
    
  const filtersPromise = supabase
    .from('filters')
    .select('*')
    .single();

  const [
    { data: car, error: carError },
    { data: filters }
  ] = await Promise.all([carPromise, filtersPromise]);

  if (carError) {
    notFound();
  }

  return {
    car: car as Car,
    brands: filters?.brands || [],
    models: filters?.models || {},
  };
}


export default async function EditListingPage({ params }: { params: { id: string } }) {
  const { car, brands, models } = await getData(params.id);

  if (!car) {
    notFound();
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
         <CarForm brands={brands} models={models} initialData={car} />
      </main>
      <Footer />
    </div>
  );
}
