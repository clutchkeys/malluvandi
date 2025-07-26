

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InquiryModal } from '@/components/inquiry-modal';
import { summarizeCarDetails } from '@/ai/flows/summarize-car-details';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, Gauge, PaintBucket, Users, ShieldCheck, FileWarning, Info, Sparkles, Phone, TrendingDown, Star, Cog, Wrench, Instagram } from 'lucide-react';
import { AdPlaceholder } from '@/components/ad-placeholder';
import Link from 'next/link';

const badgeIcons: Record<string, React.ReactNode> = {
  'price drop': <TrendingDown size={14} className="mr-1"/>,
  'new': <Sparkles size={14} className="mr-1"/>,
  'featured': <Star size={14} className="mr-1"/>,
}

const DetailItem = ({ icon, label, value }: {icon: React.ElementType, label: string, value: string | number | undefined | null }) => {
    if (!value && value !== 0) return null;
    const Icon = icon;
    return (
        <div className="flex items-start gap-3">
            <Icon className="text-muted-foreground mt-0.5" size={18}/>
            <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-muted-foreground text-sm">{value}{label === 'Kilometers' ? ' km' : ''}</p>
            </div>
        </div>
    );
}

export function CarDetailView({ car, sellerName }: { car: Car, sellerName: string }) {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Track viewed car in localStorage
    try {
      const viewedCars = JSON.parse(localStorage.getItem('viewedCars') || '[]') as string[];
      const updatedViewedCars = [car.id, ...viewedCars.filter(id => id !== car.id)].slice(0, 10);
      localStorage.setItem('viewedCars', JSON.stringify(updatedViewedCars));
    } catch (error) {
      console.error("Could not update viewed cars in localStorage", error);
    }
  }, [car.id]);

  useEffect(() => {
    if (car) {
      setIsSummaryLoading(true);
      summarizeCarDetails(car)
        .then(result => setSummary(result.summary))
        .catch(err => {
          console.error(err);
          setSummary("Could not generate summary for this vehicle.");
        })
        .finally(() => setIsSummaryLoading(false));
    }
  }, [car]);
  
  const handleInquireClick = () => {
    setIsModalOpen(true);
  };
  
  return (
    <>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
              <CardContent className="p-4">
                   <Carousel className="w-full">
                      <CarouselContent>
                          {car.images && car.images.length > 0 ? car.images.map((img, index) => (
                          <CarouselItem key={index}>
                              <div className="relative aspect-video">
                              <Image
                                  src={img}
                                  alt={`${car.brand} ${car.model} image ${index + 1}`}
                                  fill
                                  className="rounded-lg object-cover"
                                  data-ai-hint="car detail"
                              />
                              </div>
                          </CarouselItem>
                          )) : (
                            <CarouselItem>
                                 <div className="relative aspect-video">
                                    <Image
                                        src={'https://placehold.co/800x450.png'}
                                        alt={`${car.brand} ${car.model}`}
                                        fill
                                        className="rounded-lg object-cover"
                                        data-ai-hint="car detail placeholder"
                                    />
                                </div>
                            </CarouselItem>
                          )
                        }
                      </CarouselContent>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                  </Carousel>
              </CardContent>
          </Card>
         
          <Card className="mt-8">
              <CardHeader>
                  <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  <DetailItem icon={Calendar} label="Year" value={car.year} />
                  <DetailItem icon={Gauge} label="Kilometers" value={car.kmRun?.toLocaleString('en-IN')} />
                  <DetailItem icon={PaintBucket} label="Color" value={car.color} />
                  <DetailItem icon={Users} label="Ownership" value={car.ownership ? `${car.ownership} ${car.ownership > 1 ? 'Owners' : 'Owner'}`: null} />
                  <DetailItem icon={Cog} label="Engine" value={car.engineCC ? `${car.engineCC} CC` : null} />
                  <DetailItem icon={Wrench} label="Transmission" value={car.transmission} />
                  <DetailItem icon={Info} label="Fuel" value={car.fuel} />
              </CardContent>
          </Card>

          {car.additionalDetails && (
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info /> Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{car.additionalDetails}</p>
                </CardContent>
            </Card>
          )}

        </div>
        <div className="md:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex gap-2 mb-2">
               {car.badges && car.badges.map(badge => (
                  <Badge key={badge} variant="secondary" className="capitalize text-xs flex items-center">
                    {badgeIcons[badge.toLowerCase()] || <Star size={14} className="mr-1"/>}
                    {badge}
                  </Badge>
                ))}
              </div>
              <h1 className="font-headline text-2xl">{car.brand} {car.model}</h1>
              {car.price && <p className="text-3xl font-bold text-primary pt-1">₹{car.price.toLocaleString('en-IN')}</p>}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
               <Button className="w-full" size="lg" onClick={handleInquireClick}>
                  <Phone className="mr-2"/> Inquire Now
               </Button>
                {car.instagramReelUrl && (
                  <Button asChild className="w-full" size="lg" variant="outline">
                    <Link href={car.instagramReelUrl} target="_blank" rel="noopener noreferrer">
                      <Instagram className="mr-2" /> Watch Reel
                    </Link>
                  </Button>
               )}
               {sellerName && <p className="text-xs text-center text-muted-foreground mt-2">Seller: {sellerName}</p>}
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="text-primary"/> AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                  {isSummaryLoading ? (
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-3/4" />
                      </div>
                  ) : (
                     <p className="text-sm text-muted-foreground">{summary}</p> 
                  )}
              </CardContent>
          </Card>
          <AdPlaceholder shape="square" />
        </div>
      </div>
      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={car}
      />
    </>
  );
}
