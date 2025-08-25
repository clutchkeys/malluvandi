
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Inquiry } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function EmployeeBInquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('assignedTo', user.id)
        .order('submittedAt', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
      } else {
        setInquiries(data as Inquiry[]);
      }
      setLoading(false);
    };

    fetchInquiries();
  }, [user, supabase]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Inquiries</CardTitle>
        <CardDescription>View and manage customer inquiries assigned to you.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading inquiries...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.carSummary}</TableCell>
                    <TableCell>{inquiry.customerName}</TableCell>
                    <TableCell>{inquiry.customerPhone}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(inquiry.status)} className="capitalize">{inquiry.status}</Badge></TableCell>
                    <TableCell>{format(parseISO(inquiry.submittedAt), 'dd MMM, yyyy')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    You have no inquiries assigned to you.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
