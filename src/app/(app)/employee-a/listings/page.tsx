

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
import { PlusCircle, Edit, Loader2, Trash2, Upload } from 'lucide-react';
import type { Car, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse';


function ImportCarsModal({ isOpen, onClose, currentUser }: { isOpen: boolean; onClose: () => void; currentUser: User | null}) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!file || !currentUser) {
            toast({ title: "No file selected", description: "Please select a CSV file to import.", variant: "destructive" });
            return;
        }
        setIsProcessing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const requiredHeaders = ['brand', 'model', 'year', 'price', 'kmRun', 'color', 'ownership', 'images'];
                const headers = results.meta.fields || [];
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    toast({ title: "Invalid CSV Format", description: `Missing required columns: ${missingHeaders.join(', ')}`, variant: "destructive" });
                    setIsProcessing(false);
                    return;
                }

                const batch = writeBatch(db);
                let count = 0;

                for (const row of results.data as any[]) {
                    try {
                        const newCar: Omit<Car, 'id'> = {
                            brand: row.brand,
                            model: row.model,
                            year: parseInt(row.year),
                            price: parseInt(row.price),
                            engineCC: row.engineCC ? parseInt(row.engineCC) : 0,
                            fuel: row.fuel || 'Petrol',
                            transmission: row.transmission || 'Manual',
                            kmRun: parseInt(row.kmRun),
                            color: row.color,
                            ownership: parseInt(row.ownership),
                            additionalDetails: row.additionalDetails || '',
                            images: row.images.split(',').map((img: string) => img.trim()),
                            status: 'pending',
                            submittedBy: currentUser.id,
                            badges: row.badges ? row.badges.split(',').map((b: string) => b.trim()) : [],
                        };
                        const carRef = doc(collection(db, 'cars'));
                        batch.set(carRef, newCar);
                        count++;
                    } catch (e) {
                         toast({ title: `Error in row ${count+1}`, description: `Skipping row due to invalid data.`, variant: 'destructive' });
                    }
                }
                
                try {
                    await batch.commit();
                    toast({ title: `Import Successful`, description: `${count} cars have been added for approval.` });
                    onClose();
                } catch (error) {
                    toast({ title: `Import Failed`, description: `Could not save cars to the database.`, variant: 'destructive' });
                }

                setIsProcessing(false);
            },
            error: (error: any) => {
                toast({ title: "Parsing Error", description: error.message, variant: "destructive" });
                setIsProcessing(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Cars from CSV</DialogTitle>
                    <DialogDescription>Upload a CSV file with car data. The file must contain the following headers: `brand,model,year,price,kmRun,color,ownership,images,engineCC,fuel,transmission,additionalDetails,badges`.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleImport} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Upload className="mr-2"/>}
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
      if (imageUrls.length === 0) {
        throw new Error("Please add at least one image URL.");
      }
      
      const carData: Omit<Car, 'id'> = {
          brand: selectedBrand,
          model: formValues.model,
          year: parseInt(formValues.year),
          price: parseInt(formValues.price),
          engineCC: parseInt(formValues.engineCC),
          fuel: formValues.fuel,
          transmission: formValues.transmission,
          kmRun: parseInt(formValues.kmRun),
          color: formValues.color,
          ownership: parseInt(formValues.ownership),
          additionalDetails: formValues.details,
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
      
        // Dynamically add model to filters if it doesn't exist
        const filtersRef = doc(db, 'config', 'filters');
        const filtersSnap = await getDoc(filtersRef);
        if (filtersSnap.exists()) {
            const filtersData = filtersSnap.data();
            if (filtersData.models && filtersData.models[carData.brand] && !filtersData.models[carData.brand].includes(carData.model)) {
                filtersData.models[carData.brand].push(carData.model);
                await updateDoc(filtersRef, { models: filtersData.models });
            }
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
                  <Input id="model" name="model" className="col-span-3" defaultValue={carToEdit?.model} required />
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
                  <Label htmlFor="engineCC" className="text-right">Engine CC</Label>
                  <Input id="engineCC" name="engineCC" type="number" className="col-span-3" defaultValue={carToEdit?.engineCC} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fuel" className="text-right">Fuel</Label>
                   <Select name="fuel" defaultValue={carToEdit?.fuel} required>
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
                   <Select name="transmission" defaultValue={carToEdit?.transmission} required>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder="Select transmission" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                  </Select>
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
      <ImportCarsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} currentUser={user}/>
    </>
  );
}

    

    
