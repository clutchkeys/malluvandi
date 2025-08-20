

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, ShieldCheck, Upload } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import type { Car as CarType } from '@/lib/types';


export default function SellCarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/sell');
    }
  }, [user, loading, router]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;
    
    try {
      const carData: Partial<Omit<CarType, 'id'>> = {
          brand: formValues.brand,
          model: formValues.model,
          year: formValues.year ? parseInt(formValues.year) : undefined,
          price: formValues.price ? parseInt(formValues.price) : undefined,
          engineCC: formValues.engineCC ? parseInt(formValues.engineCC) : undefined,
          fuel: formValues.fuel || undefined,
          transmission: formValues.transmission || undefined,
          kmRun: formValues.kmRun ? parseInt(formValues.kmRun) : undefined,
          color: formValues.color || undefined,
          ownership: formValues.ownership ? parseInt(formValues.ownership) : undefined,
          additionalDetails: formValues.details || undefined,
          instagramReelUrl: formValues.instagramReelUrl || undefined,
          images: [], // No images from customer
          status: 'pending' as const,
          submittedBy: user.id,
          createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'cars'), carData);
      
      toast({ title: 'Listing Submitted!', description: 'Your car listing has been sent for admin approval.' });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting car:", error);
      toast({ title: 'Submission Failed', description: 'There was an error submitting your listing.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading || !user) {
      return (
           <div className="flex h-screen w-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
           </div>
      )
  }
  
  if (isSuccess) {
      return (
        <>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="max-w-lg text-center p-8">
                    <CardHeader>
                        <ShieldCheck className="h-16 w-16 mx-auto text-green-500"/>
                        <CardTitle className="text-2xl mt-4">Submission Successful!</CardTitle>
                        <CardDescription>Our team will review your car details and get back to you shortly. You can track the status of your submission in your account page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </>
      )
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-lg">
           <CardHeader>
                <CardTitle className="text-3xl">Sell Your Car</CardTitle>
                <CardDescription>
                  Fill in the details of the car. It will be sent for admin approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="brand">Brand</Label>
                          <Input id="brand" name="brand" placeholder="e.g., Maruti Suzuki" required />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="model">Model</Label>
                           <Input id="model" name="model" placeholder="e.g., Swift" required />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="year">Manufactured Year</Label>
                          <Input id="year" name="year" type="number" placeholder="e.g., 2022" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Expected Price (₹)</Label>
                          <Input id="price" name="price" type="number" placeholder="e.g., 750000" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="engineCC">Engine CC</Label>
                          <Input id="engineCC" name="engineCC" type="number" placeholder="e.g., 1197" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fuel">Fuel</Label>
                           <Select name="fuel">
                              <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                              </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transmission">Transmission</Label>
                           <Select name="transmission">
                              <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                              </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kmRun">KM Driven</Label>
                          <Input id="kmRun" name="kmRun" type="number" placeholder="e.g., 15000" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Colour</Label>
                          <Input id="color" name="color" placeholder="e.g., Red" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownership">No. of Owners</Label>
                          <Input id="ownership" name="ownership" type="number" placeholder="e.g., 1" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="instagramReelUrl">Instagram Reel URL (Optional)</Label>
                          <Input id="instagramReelUrl" name="instagramReelUrl" placeholder="https://www.instagram.com/reel/..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="details">Additional Details</Label>
                      <Textarea id="details" name="details" placeholder="Include insurance details, any pending challans, car's condition, features, or any other relevant information."/>
                    </div>
                  </div>
                  <CardFooter className="mt-6 px-0">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit for Approval
                    </Button>
                  </CardFooter>
                </form>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
