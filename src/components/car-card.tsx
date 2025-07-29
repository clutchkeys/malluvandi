
'use client';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gauge, PaintBucket, Users, ArrowRight, TrendingDown, Sparkles, Star, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface CarCardProps {
  car: Car;
}

const badgeIcons: Record<string, React.ReactNode> = {
  'price drop': <TrendingDown size={14} className="mr-1"/>,
  'new': <Sparkles size={14} className="mr-1"/>,
  'featured': <Star size={14} className="mr-1"/>,
}

export function CarCard({ car }: CarCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
        const savedCars = JSON.parse(localStorage.getItem('savedCars') || '[]') as string[];
        setIsSaved(savedCars.includes(car.id));
    } catch (e) {
        setIsSaved(false);
    }
  }, [car.id]);

  const handleCardClick = () => {
    router.push(`/car/${car.id}`);
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to car details page
    try {
        const savedCars = JSON.parse(localStorage.getItem('savedCars') || '[]') as string[];
        if (isSaved) {
            const newSavedCars = savedCars.filter(id => id !== car.id);
            localStorage.setItem('savedCars', JSON.stringify(newSavedCars));
            setIsSaved(false);
            toast({ title: 'Car Unsaved', description: `${car.brand} ${car.model} has been removed from your saved list.` });
        } else {
            const newSavedCars = [...savedCars, car.id];
            localStorage.setItem('savedCars', JSON.stringify(newSavedCars));
            setIsSaved(true);
            toast({ title: 'Car Saved!', description: `${car.brand} ${car.model} has been added to your saved list.` });
        }
    } catch (error) {
        console.error("Could not update saved cars", error);
        toast({ title: 'Error', description: 'Could not update your saved cars.', variant: 'destructive' });
    }
  };


  return (
    <>
      <div onClick={handleCardClick} className="block cursor-pointer">
          <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardHeader className="p-0">
              <div className="relative h-48 w-full">
              <Image
                  src={car.images?.[0] || 'https://placehold.co/600x400.png'}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover"
                  data-ai-hint="car exterior"
              />
               <Button 
                    size="icon" 
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/75 text-white"
                    onClick={handleSaveToggle}
                >
                    <Bookmark className={cn("h-5 w-5 transition-all", isSaved && "fill-white")}/>
                </Button>

              {car.badges && car.badges.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  {(car.badges || []).map(badge => (
                    <Badge key={badge} variant="default" className="capitalize text-xs flex items-center bg-black/70 backdrop-blur-sm border-white/20">
                      {badgeIcons[badge.toLowerCase()] || <Star size={14} className="mr-1"/>}
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
              </div>
          </CardHeader>
          <CardContent className="flex-grow p-3 grid gap-1">
              <h3 className="text-md font-bold">{car.brand} {car.model}</h3>
              <p className="text-lg font-semibold text-primary">
                  {car.price ? `₹${car.price.toLocaleString('en-IN')}` : 'Price on request'}
              </p>
               <div className="pt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate"><Calendar size={12} /> <span>{car.year}</span></div>
                  <div className="flex items-center gap-1.5 truncate"><Gauge size={12} /> <span>{car.kmRun?.toLocaleString('en-IN')} km</span></div>
                  <div className="flex items-center gap-1.5 truncate"><PaintBucket size={12} /> <span>{car.color}</span></div>
                  <div className="flex items-center gap-1.5 truncate"><Users size={12} /> <span>{car.ownership} {car.ownership && car.ownership > 1 ? 'Owners' : 'Owner'}</span></div>
              </div>
          </CardContent>
          <CardFooter className="p-3 bg-secondary/30">
              <Button className="w-full" size="sm">
                  View Details <ArrowRight className="ml-2" size={16} />
              </Button>
          </CardFooter>
          </Card>
      </div>
    </>
  );
}
