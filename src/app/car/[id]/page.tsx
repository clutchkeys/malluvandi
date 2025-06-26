'use client';
import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { cars, users } from '@/lib/data';
import type { Car, CarBadge } from '@/lib/types';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InquiryModal } from '@/components/inquiry-modal';
import { summarizeCarDetails } from '@/ai/flows/summarize-car-details';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calendar, Gauge, PaintBucket, Users, ShieldCheck, FileWarning, Info, Sparkles, Phone, TrendingDown, Star } from 'lucide-react';
import { FullScreenAd } from '@/components/full-screen-ad';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { useAuth } from '@/hooks/use-auth';

const badgeIcons: Record<CarBadge, React.ReactNode> = {
  price_drop: <TrendingDown size={14} className="mr-1"/>,
  new: <Sparkles size={14} className="mr-1"/>,
  featured: <Star size={14} className="mr-1"/>,
}


export default function CarDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [car, setCar] = useState<Car | null | undefined>(undefined);
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const foundCar = cars.find(c => c.id === id);
    setCar(foundCar);

    if (foundCar) {
      setIsSummaryLoading(true);
      summarizeCarDetails(foundCar)
        .then(result => setSummary(result.summary))
        .catch(err => {
          console.error(err);
          setSummary("Could not generate summary for this vehicle.");
        })
        .finally(() => setIsSummaryLoading(false));
    }
  }, [id]);
  
  const handleInquireClick = () => {
    const isGuestOrCustomer = !user || user.role === 'customer';
    if (isGuestOrCustomer) {
      setIsAdOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
    setIsModalOpen(true);
  };


  if (car === undefined) {
    return <LoadingSkeleton />;
  }

  if (car === null) {
    notFound();
  }
  
  const seller = users.find(u => u.id === car.submittedBy);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
                <CardContent className="p-4">
                     <Carousel className="w-full">
                        <CarouselContent>
                            {car.images.map((img, index) => (
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
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="ml-16" />
                        <CarouselNext className="mr-16" />
                    </Carousel>
                </CardContent>
            </Card>
           
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-start gap-3"><Calendar className="text-muted-foreground" size={20}/><p><span className="font-medium">Year</span><br/>{car.year}</p></div>
                    <div className="flex items-start gap-3"><Gauge className="text-muted-foreground" size={20}/><p><span className="font-medium">Kilometers</span><br/>{car.kmRun.toLocaleString('en-IN')} km</p></div>
                    <div className="flex items-start gap-3"><PaintBucket className="text-muted-foreground" size={20}/><p><span className="font-medium">Color</span><br/>{car.color}</p></div>
                    <div className="flex items-start gap-3"><Users className="text-muted-foreground" size={20}/><p><span className="font-medium">Ownership</span><br/>{car.ownership} {car.ownership > 1 ? 'Owners' : 'Owner'}</p></div>
                    <div className="flex items-start gap-3"><ShieldCheck className="text-muted-foreground" size={20}/><p><span className="font-medium">Insurance</span><br/>{car.insurance}</p></div>
                    <div className="flex items-start gap-3"><FileWarning className="text-muted-foreground" size={20}/><p><span className="font-medium">Challans</span><br/>{car.challans}</p></div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info /> Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{car.additionalDetails}</p>
                </CardContent>
            </Card>

          </div>
          <div className="md:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex gap-2 mb-2">
                 {car.badges && car.badges.map(badge => (
                    <Badge key={badge} variant="secondary" className="capitalize text-xs flex items-center">
                      {badgeIcons[badge]}
                      {badge.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                <h1 className="font-headline text-2xl">{car.brand} {car.model}</h1>
                <p className="text-3xl font-bold text-primary pt-1">₹{car.price.toLocaleString('en-IN')}</p>
              </CardHeader>
              <CardContent>
                 <Button className="w-full" size="lg" onClick={handleInquireClick}>
                    <Phone className="mr-2"/> Inquire Now
                 </Button>
                 {seller && <p className="text-xs text-center text-muted-foreground mt-2">Seller: {seller.name}</p>}
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
      </main>
      <Footer />
      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={car}
      />
      <FullScreenAd isOpen={isAdOpen} onClose={handleAdClose} />
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
             <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <Skeleton className="w-full h-48 rounded-lg" />
                    <Skeleton className="w-full h-24 rounded-lg" />
                </div>
                <div className="md:col-span-1 space-y-6">
                    <Skeleton className="w-full h-64 rounded-lg" />
                </div>
             </div>
          </main>
          <Footer />
        </div>
    )
}
