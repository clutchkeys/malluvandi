

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Inquiry, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { InquiryActions } from '@/components/inquiry-actions';
import { Loader2, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type InquiryWithAssigneeName = Inquiry & {
    assignedTo_name?: string;
};

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<InquiryWithAssigneeName[]>([]);
    const [salesStaff, setSalesStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        setLoading(true);

        // Fetch inquiries and sales staff in parallel
        const [inquiryRes, staffRes] = await Promise.all([
            supabase.from('inquiries').select('*').order('submittedAt', { ascending: false }),
            supabase.from('profiles').select('*').eq('role', 'employee-b')
        ]);
        
        const { data: inquiryData, error: inquiryError } = inquiryRes;
        const { data: staffData, error: staffError } = staffRes;

        if (inquiryError) {
            console.error('Error fetching inquiries:', inquiryError);
        }
        if (staffError) {
            console.error('Error fetching sales staff:', staffError);
        }

        const staff = (staffData as User[]) || [];
        const staffMap = new Map(staff.map(s => [s.id, s.name]));
        
        const inquiriesWithNames = ((inquiryData as Inquiry[]) || []).map(inquiry => ({
            ...inquiry,
            assignedTo_name: inquiry.assignedTo ? staffMap.get(inquiry.assignedTo) || 'Unassigned' : 'Unassigned',
        }));

        setInquiries(inquiriesWithNames);
        setSalesStaff(staff);
        setLoading(false);

    }, [supabase]);

    useEffect(() => {
        fetchData();

        const channel = supabase.channel('realtime-inquiries-admin')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, 
            (payload) => {
              // Refetch all data on any change
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
          <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Car</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Closure Report</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inquiries.map(inquiry => (
                        <TableRow key={inquiry.id}>
                            <TableCell className="font-medium">{inquiry.carSummary}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                  {inquiry.isSeriousCustomer && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Serious Customer</p>
                                        </TooltipContent>
                                    </Tooltip>
                                  )}
                                  <div>
                                    <div>{inquiry.customerName}</div>
                                    <div className="text-xs text-muted-foreground">{inquiry.customerPhone}</div>
                                  </div>
                                </div>
                            </TableCell>
                            <TableCell><Badge variant={getStatusVariant(inquiry.status)} className="capitalize">{inquiry.status}</Badge></TableCell>
                            <TableCell>{inquiry.assignedTo_name}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{inquiry.remarks || 'N/A'}</TableCell>
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
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
