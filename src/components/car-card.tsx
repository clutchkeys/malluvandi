'use client';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Gauge, PaintBucket, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Link href={`/car/${car.id}`} className="block">
        <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
        <CardHeader className="p-0">
            <div className="relative h-48 w-full">
            <Image
                src={car.images[0]}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                data-ai-hint="car exterior"
            />
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 grid gap-1">
            <CardTitle className="text-lg font-bold font-headline">{car.brand} {car.model}</CardTitle>
            <p className="text-xl font-semibold text-primary">
                ₹{car.price.toLocaleString('en-IN')}
            </p>
             <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 truncate"><Calendar size={14} /> <span>{car.year}</span></div>
                <div className="flex items-center gap-2 truncate"><Gauge size={14} /> <span>{car.kmRun.toLocaleString('en-IN')} km</span></div>
                <div className="flex items-center gap-2 truncate"><PaintBucket size={14} /> <span>{car.color}</span></div>
                <div className="flex items-center gap-2 truncate"><Users size={14} /> <span>{car.ownership} {car.ownership > 1 ? 'Owners' : 'Owner'}</span></div>
            </div>
        </CardContent>
        <CardFooter className="p-4 bg-secondary/30">
            <Button className="w-full" variant="secondary">
                View Details <ArrowRight className="ml-2" size={16} />
            </Button>
        </CardFooter>
        </Card>
    </Link>
  );
}
