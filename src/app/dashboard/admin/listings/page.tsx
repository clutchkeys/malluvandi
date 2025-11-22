
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Car, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Loader2, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { FinalListingActions as ListingActions } from '@/components/listing-actions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type CarWithSubmitterName = Car & {
    submittedBy_name?: string;
};

export default function AdminListingsPage() {
    const [cars, setCars] = useState<CarWithSubmitterName[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    const fetchData = useCallback(async () => {
        setLoading(true);

        const [carRes, userRes] = await Promise.all([
             supabase.from('cars').select('*').order('createdAt', { ascending: false }),
             supabase.from('profiles').select('id, name')
        ]);
        
        const { data: carData, error: carError } = carRes;
        const { data: userData, error: userError } = userRes;


        if (carError) console.error('Error fetching cars:', carError);
        if (userError) console.error('Error fetching users:', userError);

        const users = (userData as Pick<User, 'id'|'name'>[]) || [];
        const userMap = new Map(users.map(u => [u.id, u.name]));

        const carsWithNames = ((carData as Car[]) || []).map(car => ({
            ...car,
            submittedBy_name: userMap.get(car.submittedBy) || 'Unknown User',
        }));

        setCars(carsWithNames);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();

        const channel = supabase.channel('realtime-cars-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, 
              (payload) => {
                fetchData();
              }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData, supabase]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'approved': return 'default';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
  return (
    <div className="w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Car Listings</CardTitle>
            <CardDescription>Review, approve, or reject car listings submitted by editors.</CardDescription>
          </div>
          <Button onClick={() => router.push('/sell')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Car
          </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Car</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cars.map(car => (
                        <TableRow key={car.id}>
                            <TableCell>
                                <Image 
                                    src={car.images?.[0] || 'https://placehold.co/100x75.png'}
                                    alt={car.model}
                                    width={100}
                                    height={75}
                                    className="rounded-md object-cover"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{car.brand} {car.model}</TableCell>
                            <TableCell>{car.submittedBy_name}</TableCell>
                            <TableCell>{car.createdAt ? format(parseISO(car.createdAt), 'dd MMM, yyyy') : 'N/A'}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(car.status)} className="capitalize">{car.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <ListingActions carId={car.id} currentStatus={car.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                     {cars.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">No car listings found.</TableCell>
                         </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
