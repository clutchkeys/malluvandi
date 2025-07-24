
'use client';
import Image from 'next/image';
import type { Bike } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, Calendar, ArrowRight } from 'lucide-react';

interface BikeCardProps {
  bike: Bike;
}

export function BikeCard({ bike }: BikeCardProps) {
  
  const handleCardClick = () => {
    // In a real app, this would navigate to a bike detail page
    // e.g., router.push(`/bike/${bike.id}`);
    console.log(`Clicked on bike ${bike.id}`);
  };

  return (
    <div onClick={handleCardClick} className="block cursor-pointer">
      <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
        <div className="relative h-40 w-full">
          <Image
              src={bike.images[0]}
              alt={`${bike.brand} ${bike.model}`}
              fill
              className="object-cover"
              data-ai-hint="motorcycle side"
          />
        </div>
        <CardContent className="flex-grow p-3 grid gap-1">
            <h3 className="text-sm font-bold truncate">{bike.brand} {bike.model}</h3>
            <p className="text-base font-semibold text-primary">
                ₹{bike.price.toLocaleString('en-IN')}
            </p>
            <div className="pt-1 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate"><Calendar size={12} /> <span>{bike.year}</span></div>
                <div className="flex items-center gap-1.5 truncate"><Gauge size={12} /> <span>{bike.kmRun.toLocaleString('en-IN')} km</span></div>
            </div>
        </CardContent>
        <CardFooter className="p-2 bg-secondary/30">
            <Button className="w-full" size="sm" variant="ghost">
                View Details <ArrowRight className="ml-2" size={16} />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
