'use client';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gauge, PaintBucket, Users, ArrowRight, TrendingDown, Sparkles, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { FullScreenAd } from './full-screen-ad';

interface CarCardProps {
  car: Car;
}

const badgeIcons = {
  price_drop: <TrendingDown size={14} className="mr-1"/>,
  new: <Sparkles size={14} className="mr-1"/>,
  featured: <Star size={14} className="mr-1"/>,
}

export function CarCard({ car }: CarCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdOpen, setIsAdOpen] = useState(false);

  const handleCardClick = () => {
    const isGuestOrCustomer = !user || user.role === 'customer';
    if (isGuestOrCustomer) {
      setIsAdOpen(true);
    } else {
      router.push(`/car/${car.id}`);
    }
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
    router.push(`/car/${car.id}`);
  };

  return (
    <>
      <div onClick={handleCardClick} className="block cursor-pointer">
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
              {car.badges && car.badges.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  {car.badges.map(badge => (
                    <Badge key={badge} variant="default" className="capitalize text-xs flex items-center bg-black/70 backdrop-blur-sm border-white/20">
                      {badgeIcons[badge]}
                      {badge.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              )}
              </div>
          </CardHeader>
          <CardContent className="flex-grow p-4 grid gap-1">
              <h3 className="text-lg font-bold font-headline">{car.brand} {car.model}</h3>
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
              <Button asChild className="w-full" variant="secondary">
                  <div>View Details <ArrowRight className="ml-2" size={16} /></div>
              </Button>
          </CardFooter>
          </Card>
      </div>
      <FullScreenAd isOpen={isAdOpen} onClose={handleAdClose} />
    </>
  );
}
