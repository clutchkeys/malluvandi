
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Inquiry } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SeriousCustomersPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

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
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inquiries', filter: 'isSeriousCustomer=eq.true' },
                (payload) => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData, supabase]);

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
                                </TableRow>
                            ))}
                            {inquiries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No serious customers flagged yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
