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
import { PlusCircle } from 'lucide-react';
import { cars, carBrands, carModels } from '@/lib/data';

export default function EmployeeAPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you would collect form data and submit to an API
    setIsAddCarOpen(false);
    toast({
      title: "Listing Submitted",
      description: "Your car listing has been sent for admin approval.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Car Listings</h1>
        <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Car</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
                <DialogDescription>
                  Fill in the details of the car to create a new listing. It will be sent for admin approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">Brand</Label>
                  <Select onValueChange={setSelectedBrand}>
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
                  <Select disabled={!selectedBrand}>
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
                  <Input id="year" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <Input id="price" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kmRun" className="text-right">KM Run</Label>
                  <Input id="kmRun" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">Color</Label>
                  <Input id="color" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ownership" className="text-right">Ownership</Label>
                  <Input id="ownership" type="number" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="insurance" className="text-right">Insurance</Label>
                  <Input id="insurance" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="challans" className="text-right">Challans</Label>
                  <Input id="challans" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">Details</Label>
                  <Textarea id="details" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="images" className="text-right">Images</Label>
                  <Input id="images" type="file" multiple className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsAddCarOpen(false)}>Cancel</Button>
                <Button type="submit">Submit for Approval</Button>
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
                    <Button variant="outline" size="sm" disabled={car.status !== 'pending'} onClick={() => toast({ title: 'Edit clicked', description: 'This feature is not yet implemented.'})}>Edit</Button>
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
