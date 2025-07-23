
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Car, ShieldCheck } from 'lucide-react';
import type { Car as CarType } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { MOCK_BRANDS, MOCK_MODELS } from '@/lib/mock-data';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export default function SellCarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Form state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [imagesToUpload, setImagesToUpload] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter options from mock
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/sell');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setCarBrands(MOCK_BRANDS);
    setCarModels(MOCK_MODELS);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;

    const carData = {
        brand: selectedBrand,
        model: formValues.model,
        year: parseInt(formValues.year),
        price: parseInt(formValues.price),
        kmRun: parseInt(formValues.kmRun),
        color: formValues.color,
        ownership: parseInt(formValues.ownership),
        insurance: formValues.insurance,
        challans: formValues.challans,
        additionalDetails: formValues.details,
        status: 'pending' as const,
        submittedBy: user.id,
    };

    try {
      // Mock logic for creating a car
      console.log("Submitting car for approval:", carData);
      setUploadProgress(0);
      await new Promise(res => setTimeout(res, 500));
      setUploadProgress(50);
      await new Promise(res => setTimeout(res, 500));
      setUploadProgress(100);
      await new Promise(res => setTimeout(res, 300));
      
      toast({ title: 'Listing Submitted!', description: 'Your car listing has been sent for admin approval.' });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting car:", error);
      toast({ title: 'Submission Failed', description: 'There was an error submitting your listing.', variant: 'destructive' });
      setIsSubmitting(false);
      setUploadProgress(null);
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
                          <Select name="brand" onValueChange={setSelectedBrand} required>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a brand" />
                              </SelectTrigger>
                              <SelectContent>
                                  {carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                              </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Select name="model" disabled={!selectedBrand} required>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                              <SelectContent>
                                  {selectedBrand && (carModels[selectedBrand] || []).map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                              </SelectContent>
                          </Select>
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Input id="year" name="year" type="number" placeholder="e.g., 2022" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Expected Price (₹)</Label>
                          <Input id="price" name="price" type="number" placeholder="e.g., 750000" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kmRun">KM Run</Label>
                          <Input id="kmRun" name="kmRun" type="number" placeholder="e.g., 15000" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Color</Label>
                          <Input id="color" name="color" placeholder="e.g., Red" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ownership">No. of Owners</Label>
                          <Input id="ownership" name="ownership" type="number" placeholder="e.g., 1" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance">Insurance Details</Label>
                          <Input id="insurance" name="insurance" placeholder="e.g., Comprehensive, until Oct 2025" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="challans">Pending Challans</Label>
                      <Input id="challans" name="challans" placeholder="e.g., None, or details of any challans" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="details">Additional Details</Label>
                      <Textarea id="details" name="details" placeholder="Tell us more about your car's condition, features, or any other relevant information." required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="images">Upload Images (select multiple)</Label>
                        <Input id="images" type="file" multiple onChange={(e) => setImagesToUpload(e.target.files)} required accept="image/*" />
                    </div>
                    {uploadProgress !== null && (
                      <div>
                        <Progress value={uploadProgress} className="h-2"/>
                        <p className="text-sm text-center mt-1 text-muted-foreground">Uploading...</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit for Approval
                    </Button>
                  </DialogFooter>
                </form>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
