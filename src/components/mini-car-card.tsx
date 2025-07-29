
'use client';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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
        onClick={handleCardClick}
        className="w-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50 cursor-pointer"
    >
        <CardHeader className="p-0">
            <div className="relative h-28 w-full">
            <Image
                src={car.images?.[0] || 'https://placehold.co/600x400.png'}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                data-ai-hint="car exterior"
            />
            </div>
        </CardHeader>
        <CardContent className="p-2">
            <h4 className="text-sm font-bold truncate">{car.brand} {car.model}</h4>
            <p className="text-xs text-muted-foreground">{car.year} &bull; {car.kmRun?.toLocaleString('en-IN')} km</p>
            <p className="text-sm font-semibold text-primary mt-1">
                {car.price ? `₹${car.price.toLocaleString('en-IN')}` : 'Price on request'}
            </p>
        </CardContent>
    </Card>
  );
}
