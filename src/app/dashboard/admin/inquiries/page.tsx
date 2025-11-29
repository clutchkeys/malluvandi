

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Inquiry, User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { InquiryDetailPanel } from '@/components/inquiry-detail-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InquiryActions } from '@/components/inquiry-actions';

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [salesStaff, setSalesStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        setLoading(true);

        const [inquiryRes, staffRes] = await Promise.all([
            supabase.from('inquiries').select('*').order('submittedAt', { ascending: false }),
            supabase.from('profiles').select('*').eq('role', 'employee-b')
        ]);
        
        const { data: inquiryData, error: inquiryError } = inquiryRes;
        const { data: staffData, error: staffError } = staffRes;

        if (inquiryError) console.error('Error fetching inquiries:', inquiryError);
        if (staffError) console.error('Error fetching sales staff:', staffError);
        
        const inquiriesData = (inquiryData as Inquiry[]) || [];
        setInquiries(inquiriesData);
        setSalesStaff((staffData as User[]) || []);

        if (inquiriesData.length > 0 && !selectedInquiryId) {
            setSelectedInquiryId(inquiriesData[0].id);
        } else if (inquiriesData.length === 0) {
            setSelectedInquiryId(null);
        }

        setLoading(false);
    }, [supabase, selectedInquiryId]);

    useEffect(() => {
        fetchData();

        const channel = supabase.channel('realtime-inquiries-admin')
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
            <ResizablePanel defaultSize={50} minSize={30}>
                <div className="flex flex-col h-full">
                    <div className='p-4'>
                        <h2 className="text-xl font-bold">All Inquiries ({inquiries.length})</h2>
                        <p className="text-sm text-muted-foreground">View and manage all customer inquiries.</p>
                    </div>
                    <div className="overflow-auto">
                        <Table>
                             <TableHeader>
                                <TableRow className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Car</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map(inquiry => {
                                    const staffMember = salesStaff.find(s => s.id === inquiry.assignedTo);
                                    return (
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
                                            <TableCell className="text-right">
                                               <InquiryActions inquiryId={inquiry.id} salesStaff={salesStaff} currentAssigneeId={inquiry.assignedTo} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {inquiries.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No inquiries found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
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
