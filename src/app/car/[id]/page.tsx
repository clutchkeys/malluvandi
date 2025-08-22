
'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import type { Car } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarDetailView } from '@/components/car-detail-view';
import { CarDetailSkeleton } from '@/components/car-detail-skeleton';
import { createClient } from '@/lib/supabase/client';

export default function CarDetailPage() {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError(true);
        return;
    };

    const fetchCar = async () => {
      try {
        setLoading(true);
        const { data: carData, error: carError } = await supabase
            .from('cars')
            .select('*')
            .eq('id', id)
            .eq('status', 'approved')
            .single();

        if (carError || !carData) {
          setError(true);
        } else {
          setCar(carData as Car);
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
            <Car