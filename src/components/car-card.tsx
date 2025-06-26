'use client';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gauge, PaintBucket, Users } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onContact: (car: Car) => void;
}

export function CarCard({ car, onContact }: CarCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="car exterior"
          />
        </div>
        <div className="p-4">
          <CardTitle className="text-xl font-bold font-headline">{car.brand} {car.model}</CardTitle>
          <p className="text-lg font-semibold text-primary mt-1">
            ₹{car.price.toLocaleString('en-IN')}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><Calendar size={16} /> <span>{car.year}</span></div>
        <div className="flex items-center gap-2"><Gauge size={16} /> <span>{car.kmRun.toLocaleString('en-IN')} km</span></div>
        <div className="flex items-center gap-2"><PaintBucket size={16} /> <span>{car.color}</span></div>
        <div className="flex items-center gap-2"><Users size={16} /> <span>{car.ownership} {car.ownership > 1 ? 'Owners' : 'Owner'}</span></div>
      </CardContent>
      <CardFooter className="p-4">
        <Button className="w-full" onClick={() => onContact(car)}>
          Contact Me
        </Button>
      </CardFooter>
    </Card>
  );
}
