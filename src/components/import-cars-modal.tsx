
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import type { Car, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse';


export function ImportCarsModal({ isOpen, onClose, currentUser }: { isOpen: boolean; onClose: () => void; currentUser: User | null}) {
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
                const requiredHeaders = ['brand', 'model'];
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
                        const newCar: Partial<Omit<Car, 'id'>> = {
                            brand: row.brand,
                            model: row.model,
                            year: row.year ? parseInt(row.year) : undefined,
                            price: row.price ? parseInt(row.price) : undefined,
                            engineCC: row.engineCC ? parseInt(row.engineCC) : undefined,
                            fuel: row.fuel || undefined,
                            transmission: row.transmission || undefined,
                            kmRun: row.kmRun ? parseInt(row.kmRun) : undefined,
                            color: row.color || undefined,
                            ownership: row.ownership ? parseInt(row.ownership) : undefined,
                            additionalDetails: row.additionalDetails || '',
                            images: row.images ? row.images.split(',').map((img: string) => img.trim()) : [],
                            status: 'pending',
                            submittedBy: currentUser.id,
                            badges: row.badges ? row.badges.split(',').map((b: string) => b.trim()) : [],
                        };

                        if (!newCar.brand || !newCar.model) {
                             toast({ title: `Skipping row ${count+1}`, description: `Brand and model are required.`, variant: 'destructive' });
                             continue;
                        }

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
                    <DialogDescription>
                        Upload a CSV file with car data. Required headers are `brand` and `model`. 
                        Optional headers: `year,price,engineCC,fuel,transmission,kmRun,color,ownership,additionalDetails,images,badges`.
                        The `images` and `badges` columns should be comma-separated values.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Upload className="mr-2"/>}
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
