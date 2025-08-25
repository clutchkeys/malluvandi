
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Car } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ImportCarsModal } from '@/components/import-cars-modal';

export default function EmployeeAListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchCars = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('submittedBy', user.id)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching cars:', error);
      } else {
        setCars(data as Car[]);
      }
      setLoading(false);
    };

    fetchCars();
  }, [user, supabase]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>My Car Listings</CardTitle>
                <CardDescription>Manage all the cars you have submitted.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Import from CSV
                </Button>
                <Button onClick={() => router.push('/sell')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Car
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading your listings...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.brand} {car.model}</TableCell>
                      <TableCell>₹{car.price?.toLocaleString('en-IN') || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(car.status)} className="capitalize">{car.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {car.createdAt ? format(parseISO(car.createdAt), 'dd MMM, yyyy') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      You haven't submitted any cars yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ImportCarsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        currentUser={user}
      />
    </>
  );
}
