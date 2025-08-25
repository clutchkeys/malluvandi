
'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Brand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createBrand, updateBrand, deleteBrand } from './actions';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BrandManagerProps {
    initialBrands: Brand[];
}

export function BrandManager({ initialBrands }: BrandManagerProps) {
    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const { toast } = useToast();
    
    const openModalForEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setIsModalOpen(true);
    };

    const openModalForNew = () => {
        setEditingBrand(null);
        setIsModalOpen(true);
    };
    
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            const action = editingBrand ? updateBrand.bind(null, editingBrand.id) : createBrand;
            const result = await action(formData);

            if (result.success) {
                toast({ title: `Brand ${editingBrand ? 'updated' : 'created'} successfully` });
                setIsModalOpen(false);
                // Manually refresh data is better than router.refresh() here
                 const supabase_client = (await import('@/lib/supabase/client')).createClient();
                 const { data } = await supabase_client.from('brands').select('*');
                 if(data) setBrands(data);

            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    };
    
    const handleDelete = (id: string) => {
        startTransition(async () => {
            const result = await deleteBrand(id);
            if (result.success) {
                toast({ title: 'Brand deleted' });
                setBrands(prev => prev.filter(b => b.id !== id));
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={openModalForNew}><PlusCircle className="mr-2" /> Add New Brand</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Logo URL</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {brands.map(brand => (
                        <TableRow key={brand.id}>
                            <TableCell>
                                <Image src={brand.logoUrl} alt={brand.name} width={64} height={32} className="object-contain" />
                            </TableCell>
                            <TableCell>{brand.name}</TableCell>
                            <TableCell className="truncate max-w-xs">{brand.logoUrl}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => openModalForEdit(brand)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                           <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete this brand.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(brand.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    {brands.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No brands found.</TableCell></TableRow>}
                </TableBody>
            </Table>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <form onSubmit={handleFormSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Brand Name</Label>
                                <Input id="name" name="name" defaultValue={editingBrand?.name || ''} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo URL</Label>
                                <Input id="logoUrl" name="logoUrl" type="url" defaultValue={editingBrand?.logoUrl || ''} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                               <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {editingBrand ? 'Save Changes' : 'Create Brand'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
