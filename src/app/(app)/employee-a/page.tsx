'use client';

import React, { useState } from 'react';
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
import { PlusCircle, Edit } from 'lucide-react';
import { cars as initialCars, carBrands, carModels } from '@/lib/data';
import type { Car } from '@/lib/types';

export default function EmployeeAPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('');

  if (!loading && user?.role !== 'employee-a') {
    router.push('/');
    return null;
  }
  
  const userListings = cars.filter(car => car.submittedBy === user?.id);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    };
    
    if (carToEdit) {
      // Update logic
      const updatedCar = { ...carToEdit, ...carData };
      setCars(cars.map(c => c.id === carToEdit.id ? updatedCar : c));
      toast({
        title: 'Listing Updated',
        description: 'Your car listing has been successfully updated and is pending re-approval.',
      });
    } else {
      // Add logic
      const newCar: Car = {
        id: `car-${Date.now()}`,
        ...carData,
        images: ['https://placehold.co/600x400.png'],
        status: 'pending',
        submittedBy: user!.id,
      };
      setCars([...cars, newCar]);
      toast({
        title: 'Listing Submitted',
        description: 'Your car listing has been sent for admin approval.',
      });
    }
    
    setIsFormOpen(false);
    setCarToEdit(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Car Listings</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
                  <Select name="brand" onValueChange={setSelectedBrand} defaultValue={carToEdit?.brand}>
                      <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                          {carBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">Model</Label>
                  <Select name="model" disabled={!selectedBrand} defaultValue={carToEdit?.model}>
                      <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                          {selectedBrand && carModels[selectedBrand]?.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
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
                  <Label htmlFor="insurance" className="text-right">Insurance</Label>
                  <Input id="insurance" name="insurance" className="col-span-3" defaultValue={carToEdit?.insurance} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="challans" className="text-right">Challans</Label>
                  <Input id="challans" name="challans" className="col-span-3" defaultValue={carToEdit?.challans} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">Details</Label>
                  <Textarea id="details" name="details" className="col-span-3" defaultValue={carToEdit?.additionalDetails} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="images" className="text-right">Images</Label>
                  <Input id="images" type="file" multiple className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit">{carToEdit ? 'Save Changes' : 'Submit for Approval'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
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
              {userListings.map(car => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">{car.brand} {car.model} ({car.year})</TableCell>
                  <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(car.status)} className="capitalize">{car.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(car)}>
                      <Edit className="mr-2 h-3 w-3" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {userListings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">You have not submitted any car listings.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
