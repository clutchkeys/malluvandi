

'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import type { Car, User } from '@/lib/types';
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
        toast({ title: "Backend Disconnected", description: "Cannot import cars at this time.", variant: "destructive"});
        return;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Cars from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with car data. Required headers are `brand` and `model`. 
                        Optional headers: `year,price,engineCC,fuel,transmission,kmRun,color,ownership,additionalDetails,images,badges,instagramReelUrl`.
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
