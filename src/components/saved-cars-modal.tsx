
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Frown, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import type { Car } from '@/lib/types';
import { CarCard } from '@/components/car-card';
import Link from 'next/link';

interface SavedCarsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SavedCarsModal({ isOpen, onClose }: SavedCarsModalProps) {
  const [savedCarIds, setSavedCarIds] = useState<string[]>([]);
  const [savedCars, setSavedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && isMounted) {
      try {
        const storedIds = JSON.parse(localStorage.getItem('savedCars') || '[]') as string[];
        setSavedCarIds(storedIds);
      } catch (e) {
        console.error("Failed to parse saved cars from localStorage", e);
        setSavedCarIds([]);
      }
    }
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    if (savedCarIds.length === 0) {
      setSavedCars([]);
      setLoading(false);
      return;
    }

    const fetchSavedCars = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .in('id', savedCarIds);
      
      if (error) {
        console.error("Error fetching saved cars", error);
        setSavedCars([]);
      } else {
        const carMap = new Map(data.map(car => [car.id, car]));
        const orderedCars = savedCarIds.map(id => carMap.get(id)).filter(Boolean) as Car[];
        setSavedCars(orderedCars);
      }
      setLoading(false);
    };

    fetchSavedCars();
  }, [savedCarIds, isOpen, isMounted, supabase]);
  
  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Bookmark /> My Saved Cars
          </DialogTitle>
          <DialogDescription>
            You have {savedCars.length} car(s) saved.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto -mx-6 px-6 py-2">
            {loading ? (
                <div className="w-full h-full flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin" />
                </div>
            ) : savedCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCars.map(car => (
                    <CarCard key={car.id} car={car} />
                ))}
                </div>
            ) : (
                 <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8">
                    <div className="mx-auto bg-muted p-4 rounded-full">
                       <Frown className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">You have no saved cars</h3>
                    <p className="text-sm mt-2">
                        Click the bookmark icon on any listing to save it here.
                    </p>
                    <Button asChild className="mt-6" onClick={onClose}>
                        <Link href="/">Browse Cars</Link>
                    </Button>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    