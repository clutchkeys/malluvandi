
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { InquiryDetailPanel } from '@/components/inquiry-detail-panel';

export default function EmployeeBInquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  const supabase = createClient();

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
      const inquiriesData = data as Inquiry[];
      setInquiries(inquiriesData);
      if (inquiriesData.length > 0 && !selectedInquiryId) {
        setSelectedInquiryId(inquiriesData[0].id);
      } else if (inquiriesData.length === 0) {
        setSelectedInquiryId(null);
      }
    }
    setLoading(false);
  }, [user, supabase, selectedInquiryId]);


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
             fetchInquiries();
          }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [user, supabase, fetchInquiries]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };
  
  const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId);

  if (loading) {
      return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full max-h-[calc(100vh-8rem)] w-full rounded-lg border">
        <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex flex-col h-full">
                <div className='p-4'>
                    <h2 className="text-xl font-bold">My Inquiries ({inquiries.length})</h2>
                    <p className="text-sm text-muted-foreground">Select an inquiry to view details.</p>
                </div>
                <div className="overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                            <TableHead>Customer</TableHead>
                            <TableHead>Car</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inquiries.map((inquiry) => (
                        <TableRow 
                            key={inquiry.id}
                            onClick={() => setSelectedInquiryId(inquiry.id)}
                            className={cn("cursor-pointer", selectedInquiryId === inquiry.id && "bg-muted hover:bg-muted")}
                        >
                            <TableCell>
                                <div className="font-medium">{inquiry.customerName}</div>
                                <div className="text-xs text-muted-foreground">{inquiry.customerPhone}</div>
                            </TableCell>
                            <TableCell className="text-xs">{inquiry.carSummary}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(inquiry.status)} className="capitalize">{inquiry.status}</Badge>
                            </TableCell>
                        </TableRow>
                        ))}
                        {inquiries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    You have no inquiries assigned to you.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
            {selectedInquiry ? (
                <InquiryDetailPanel inquiry={selectedInquiry} key={selectedInquiry.id}/>
            ) : (
                <div className="flex h-full items-center justify-center bg-muted/50">
                    <p className="text-muted-foreground">Select an inquiry to see the details.</p>
                </div>
            )}
        </ResizablePanel>
    </ResizablePanelGroup>
  );
}
