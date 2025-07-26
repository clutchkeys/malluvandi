

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
import { PlusCircle, Edit, Loader2, Trash2, Upload } from 'lucide-react';
import type { Car, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ImportCarsModal } from '@/components/import-cars-modal';

export default function EmployeeAListingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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
    setImageUrls(car.images || []);
    setIsFormOpen(true);
  };
  
  const handleAddNewClick = () => {
    setCarToEdit(null);
    setSelectedBrand('');
    setImageUrls([]);
    setIsFormOpen(true);
  }

  const handleCloseDialog = () => {
    setIsFormOpen(false);
    setCarToEdit(null);
    setIsSubmitting(false);
  }

  const handleAddImageUrl = () => {
    if (imageUrl && !imageUrls.includes(imageUrl)) {
        setImageUrls([...imageUrls, imageUrl]);
        setImageUrl('');
    }
  };

  const handleRemoveImageUrl = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;
    
    try {
      if (!selectedBrand || !formValues.model) {
        throw new Error("Brand and Model are required fields.");
      }
      
      const carData: Partial<Omit<Car, 'id'>> = {
          brand: selectedBrand,
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
          status: 'pending' as const,
          submittedBy: user.id,
          images: imageUrls,
          badges: formValues.badges ? formValues.badges.split(',').map((b:string) => b.trim()) : [],
      };

      if (carToEdit) {
        const carRef = doc(db, 'cars', carToEdit.id);
        await updateDoc(carRef, { ...carData, status: 'pending' });
        toast({ title: 'Listing Updated', description: 'Your car listing has been sent for re-approval.' });
      } else {
        await addDoc(collection(db, 'cars'), carData);
        toast({ title: 'Listing Submitted', description: 'Your car listing has been sent for admin approval.' });
      }
      
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error submitting car:", error);
      toast({ title: 'Submission Failed', description: error.message || 'There was an error submitting your listing.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <div className="flex gap-2">
            <Button onClick={() => setIsImportModalOpen(true)} variant="outline"><Upload className="mr-2 h-4 w-4"/> Import CSV</Button>
            <Button onClick={handleAddNewClick}><PlusCircle className="mr-2 h-4 w-4" /> Add New Car</Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[625px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{carToEdit ? 'Edit Car' : 'Add New Car'}</DialogTitle>
                <DialogDescription>
                  Fill in the details of the car. It will be sent for admin approval. Brand and Model are required.
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
                      <SelectContent>
                          {selectedBrand && (carModels[selectedBrand] || []).map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">Year</Label>
                  <Input id="year" name="year" type="number" className="col-span-3" defaultValue={carToEdit?.year} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <Input id="price" name="price" type="number" className="col-span-3" defaultValue={carToEdit?.price} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="engineCC" className="text-right">Engine CC</Label>
                  <Input id="engineCC" name="engineCC" type="number" className="col-span-3" defaultValue={carToEdit?.engineCC} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fuel" className="text-right">Fuel</Label>
                   <Select name="fuel" defaultValue={carToEdit?.fuel}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transmission" className="text-right">Transmission</Label>
                   <Select name="transmission" defaultValue={carToEdit?.transmission}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select transmission" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kmRun" className="text-right">KM Run</Label>
                  <Input id="kmRun" name="kmRun" type="number" className="col-span-3" defaultValue={carToEdit?.kmRun} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">Color</Label>
                  <Input id="color" name="color" className="col-span-3" defaultValue={carToEdit?.color} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ownership" className="text-right">Ownership</Label>
                  <Input id="ownership" name="ownership" type="number" className="col-span-3" defaultValue={carToEdit?.ownership} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">Details</Label>
                  <Textarea id="details" name="details" className="col-span-3" defaultValue={carToEdit?.additionalDetails} placeholder="Include insurance details, challans, etc."/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="badges" className="text-right">Badges</Label>
                    <Input id="badges" name="badges" className="col-span-3" defaultValue={carToEdit?.badges?.join(', ')} placeholder="e.g. Featured, Price Drop"/>
                </div>
                <div className="grid grid-cols-4 gap-4 items-start">
                    <Label htmlFor="images" className="text-right pt-2">Image URLs</Label>
                    <div className="col-span-3 space-y-2">
                        <div className="flex gap-2">
                            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
                            <Button type="button" onClick={handleAddImageUrl}>Add</Button>
                        </div>
                         <div className="space-y-2">
                            {imageUrls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                                <Input value={url} readOnly className="flex-1" />
                                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveImageUrl(url)}><Trash2 size={16}/></Button>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                    <TableCell>{car.price ? `₹${car.price.toLocaleString('en-IN')}`: 'N/A'}</TableCell>
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
      <ImportCarsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} currentUser={user}/>
    </>
  );
}
