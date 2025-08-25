
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Inquiry, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { InquiryActions } from '@/components/inquiry-actions';
import { Loader2 } from 'lucide-react';

type InquiryWithAssignee = Inquiry & {
    profiles: { name: string } | null;
};

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<(Inquiry & { assignedTo_name?: string })[]>([]);
    const [salesStaff, setSalesStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const getInquiries = useCallback(async () => {
        const { data, error } = await supabase
            .from('inquiries')
            .select(`
                *,
                profiles ( name )
            `)
            .order('submittedAt', { ascending: false });

        if (error) {
            console.error('Error fetching inquiries:', error);
            return [];
        }
        
        const typedData = data as InquiryWithAssignee[];
        return typedData.map(item => ({
            ...item,
            assignedTo_name: item.profiles?.name || 'Unassigned'
        }));
    }, [supabase]);

    const getSalesStaff = useCallback(async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'employee-b');

        if (error) {
            console.error('Error fetching sales staff:', error);
            return [];
        }
        return data as User[];
    }, [supabase]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [inquiriesData, salesStaffData] = await Promise.all([
                getInquiries(),
                getSalesStaff()
            ]);
            setInquiries(inquiriesData);
            setSalesStaff(salesStaffData);
            setLoading(false);
        };

        fetchData();

        const channel = supabase.channel('realtime-inquiries-admin')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, 
            (payload) => {
              // Refetch inquiries on any change
              getInquiries().then(setInquiries);
            }
          )
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [getInquiries, getSalesStaff, supabase]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'new': return 'default';
            case 'contacted': return 'secondary';
            case 'closed': return 'outline';
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
        <CardHeader>
          <CardTitle>Manage Inquiries</CardTitle>
          <CardDescription>View and assign customer inquiries to the sales team.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Car</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inquiries.map(inquiry => (
                        <TableRow key={inquiry.id}>
                            <TableCell className="font-medium">{inquiry.carSummary}</TableCell>
                            <TableCell>{inquiry.customerName}</TableCell>
                            <TableCell>{inquiry.customerPhone}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(inquiry.status)} className="capitalize">{inquiry.status}</Badge></TableCell>
                            <TableCell>{inquiry.assignedTo_name || 'Unassigned'}</TableCell>
                            <TableCell>{format(parseISO(inquiry.submittedAt), 'dd MMM, yyyy')}</TableCell>
                            <TableCell className="text-right">
                                <InquiryActions inquiryId={inquiry.id} salesStaff={salesStaff} currentAssigneeId={inquiry.assignedTo} />
                            </TableCell>
                        </TableRow>
                    ))}
                     {inquiries.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">No inquiries found.</TableCell>
                         </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
