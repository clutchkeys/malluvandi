
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Inquiry } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { updateInquiryStatus } from '@/app/dashboard/admin/inquiries/actions';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeBInquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchInquiries = useCallback(async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('assignedTo', user.id)
        .order('submittedAt', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
        setInquiries([]);
      } else {
        setInquiries(data as Inquiry[]);
      }
      setLoading(false);
  }, [user, supabase]);


  useEffect(() => {
    if (!user) return;

    fetchInquiries();

    const channel = supabase.channel(`realtime-inquiries-employee-${user.id}`)
      .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'inquiries',
            filter: `assignedTo=eq.${user.id}`
          },
          (payload) => {
             // Refetch when a change is detected for this user's assignments
             fetchInquiries();
          }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [user, supabase, fetchInquiries]);

  const handleStatusChange = async (inquiryId: string, newStatus: 'new' | 'contacted' | 'closed') => {
    setIsUpdating(inquiryId);
    const { success, error } = await updateInquiryStatus(inquiryId, newStatus);
    if (success) {
      // The real-time subscription will handle the UI update, but we can also optimistically update the state
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i));
      toast({ title: "Status updated successfully" });
    } else {
      toast({ title: "Error updating status", description: error, variant: "destructive" });
    }
    setIsUpdating(null);
  }

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
            <p className="ml-4">Loading your inquiries...</p>
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="capitalize w-28 justify-start" disabled={isUpdating === inquiry.id}>
                            {isUpdating === inquiry.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Badge variant={getStatusVariant(inquiry.status)} className="capitalize mr-2">{inquiry.status}</Badge>}
                             <span className="truncate">{inquiry.status}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuRadioGroup
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value as 'new' | 'contacted' | 'closed')}
                          >
                            <DropdownMenuRadioItem value="new">New</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="contacted">Contacted</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="closed">Closed</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
