
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Inquiry } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { deleteInquiry } from '../inquiries/actions';
import { useToast } from '@/hooks/use-toast';

export default function SeriousCustomersPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, startTransition] = useTransition();
    const supabase = createClient();
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .eq('isSeriousCustomer', true)
            .order('submittedAt', { ascending: false });

        if (error) {
            console.error('Error fetching serious customer inquiries:', error);
            setInquiries([]);
        } else {
            setInquiries(data as Inquiry[]);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('serious-customers-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' },
                (payload) => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData, supabase]);

    const handleDelete = (inquiryId: string) => {
        startTransition(async () => {
            const result = await deleteInquiry(inquiryId);
            if (result.success) {
                toast({ title: 'Inquiry Deleted' });
                // The realtime subscription should handle UI update, but we can also filter manually
                setInquiries(prev => prev.filter(i => i.id !== inquiryId));
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
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
                <CardHeader>
                    <CardTitle>Serious Customers</CardTitle>
                    <CardDescription>A list of high-potential customers for follow-up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Car Inquired</TableHead>
                                <TableHead>Date of Inquiry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inquiries.map(inquiry => (
                                <TableRow key={inquiry.id}>
                                    <TableCell className="font-medium">{inquiry.customerName}</TableCell>
                                    <TableCell>{inquiry.customerPhone}</TableCell>
                                    <TableCell>{inquiry.carSummary}</TableCell>
                                    <TableCell>{format(parseISO(inquiry.submittedAt), 'dd MMM, yyyy')}</TableCell>
                                    <TableCell><Badge variant="outline" className="capitalize">{inquiry.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                       <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                                                   <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this inquiry record.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(inquiry.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {inquiries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No serious customers flagged yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
