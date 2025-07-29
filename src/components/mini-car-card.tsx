
'use client';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

interface MiniCarCardProps {
  car: Partial<Car>;
}

export function MiniCarCard({ car }: MiniCarCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (car.id) {
        router.push(`/car/${car.id}`);
    }
  };

  return (
    <Card 
        key={car.id}
        className="w-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50 flex flex-col h-full"
    >
        <div onClick={handleCardClick} className="cursor-pointer">
            <div className="relative h-28 w-full">
            <Image
                src={car.images?.[0] || 'https://placehold.co/600x400.png'}
                alt={`${car.brand || 'Car'} ${car.model || ''}`}
                fill
                className="object-cover"
                data-ai-hint="car exterior"
            />
            </div>
            <CardContent className="p-2 flex-grow">
                <h4 className="text-sm font-bold truncate">{car.brand} {car.model}</h4>
                <p className="text-xs text-muted-foreground">{car.year} &bull; {car.kmRun ? `${car.kmRun.toLocaleString('en-IN')} km` : ''}</p>
                <p className="text-sm font-semibold text-primary mt-1">
                    {car.price ? `₹${car.price.toLocaleString('en-IN')}` : 'Price on request'}
                </p>
            </CardContent>
        </div>
        <CardFooter className="p-2 mt-auto">
             <Button className="w-full" size="sm" variant="outline" onClick={handleCardClick}>
                Visit Page <ArrowRight className="ml-2" size={16} />
            </Button>
        </CardFooter>
    </Card>
  );
}
