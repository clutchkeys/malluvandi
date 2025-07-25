
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Loader2 } from 'lucide-react';
import type { Car } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function EmployeeAListingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);

  // Form state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [imagesToUpload, setImagesToUpload] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter options
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    const fetchFilters = async () => {
        const configRef = doc(db, "config", "filters");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
            const configData = configSnap.data();
            setCarBrands(configData.brands || []);
            setCarModels(configData.models || {});
        }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        const carsRef = collection(db, 'cars');
        const q = query(carsRef, where("submittedBy", "==", user.id));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userCars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
            setCars(userCars);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleEditClick = (car: Car) => {
    setCarToEdit(car);
    setSelectedBrand(car.brand);
    setIsFormOpen(true);
  };
  
  const handleAddNewClick = () => {
    setCarToEdit(null);
    setSelectedBrand('');
    setIsFormOpen(true);
  }

  const handleCloseDialog = () => {
    setIsFormOpen(false);
    setCarToEdit(null);
    setImagesToUpload(null);
    setUploadProgress(0);
    setIsSubmitting(false);
  }

  const uploadImages = async (): Promise<string[]> => {
    if (!imagesToUpload || imagesToUpload.length === 0) return [];
    toast({ title: 'Uploading Images...', description: 'Please wait.' });

    const urls: string[] = [];
    const uploadPromises = Array.from(imagesToUpload).map(file => {
      const storageRef = ref(storage, `car-images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => prev + progress / imagesToUpload.length);
          },
          error => reject(error),
          () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
        );
      });
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setUploadProgress(0);

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;
    
    if (!formValues.model) {
        toast({ title: 'Error', description: 'Please select a car model.', variant: 'destructive'});
        setIsSubmitting(false);
        return;
    }

    try {
      const carData: Omit<Car, 'id'> = {
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
          images: carToEdit?.images || [], // Keep old images if editing
      };

      if (imagesToUpload && imagesToUpload.length > 0) {
        const newImageUrls = await uploadImages();
        carData.images = [...carData.images, ...newImageUrls]; // Add new images
      }
      
      if (carToEdit) {
        const carRef = doc(db, 'cars', carToEdit.id);
        await updateDoc(carRef, { ...carData, status: 'pending' });
        toast({ title: 'Listing Updated', description: 'Your car listing has been sent for re-approval.' });
      } else {
        if (carData.images.length === 0) throw new Error("Please upload at least one image.");
        await addDoc(collection(db, 'cars'), carData);
        toast({ title: 'Listing Submitted', description: 'Your car listing has been sent for admin approval.' });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting car:", error);
      toast({ title: 'Submission Failed', description: 'There was an error submitting your listing.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" /> Add New Car</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{carToEdit ? 'Edit Car' : 'Add New Car'}</DialogTitle>
                <DialogDescription>
                  Fill in the details of the car. It will be sent for admin approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">Brand</Label>
                  <Select name="brand" onValueChange={setSelectedBrand} defaultValue={carToEdit?.brand} required>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a brand" /></SelectTrigger>
                      <SelectContent>{carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">Model</Label>
                  <Select name="model" disabled={!selectedBrand} defaultValue={carToEdit?.model} required>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a model" /></SelectTrigger>
                      <SelectContent>{selectedBrand && (carModels[selectedBrand] || []).map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">Year</Label>
                  <Input id="year" name="year" type="number" className="col-span-3" defaultValue={carToEdit?.year} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <Input id="price" name="price" type="number" className="col-span-3" defaultValue={carToEdit?.price} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kmRun" className="text-right">KM Run</Label>
                  <Input id="kmRun" name="kmRun" type="number" className="col-span-3" defaultValue={carToEdit?.kmRun} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">Color</Label>
                  <Input id="color" name="color" className="col-span-3" defaultValue={carToEdit?.color} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ownership" className="text-right">Ownership</Label>
                  <Input id="ownership" name="ownership" type="number" className="col-span-3" defaultValue={carToEdit?.ownership} required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="insurance" className="text-right">Insurance</Label>
                  <Input id="insurance" name="insurance" className="col-span-3" defaultValue={carToEdit?.insurance} required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="challans" className="text-right">Challans</Label>
                  <Input id="challans" name="challans" className="col-span-3" defaultValue={carToEdit?.challans} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">Details</Label>
                  <Textarea id="details" name="details" className="col-span-3" defaultValue={carToEdit?.additionalDetails} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="images" className="text-right">Images</Label>
                    <Input id="images" type="file" multiple className="col-span-3" onChange={(e) => setImagesToUpload(e.target.files)} accept="image/*" required={!carToEdit} />
                </div>
                {isSubmitting && uploadProgress > 0 && (
                  <div className="col-span-4">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-center mt-1">Uploading...</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {carToEdit ? 'Save Changes' : 'Submit for Approval'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>My Listings</CardTitle>
          <CardDescription>A list of all cars you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : cars.length > 0 ? (
                cars.map(car => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium">{car.brand} {car.model} ({car.year})</TableCell>
                    <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(car.status)} className="capitalize">{car.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(car)} disabled={car.status === 'pending'}>
                        <Edit className="mr-2 h-3 w-3" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">You have not submitted any car listings.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
