
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Car, Inquiry } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { CarDetailSkeleton } from './car-detail-skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { MiniCarCard } from './mini-car-card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Save, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateInquiryNotes } from '@/app/dashboard/admin/inquiries/actions';
import { CloseInquiryDialog } from './close-inquiry-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateInquiry } from '@/app/dashboard/admin/inquiries/actions';
import { Badge } from './ui/badge';
import { format, parseISO } from 'date-fns';

export function InquiryDetailPanel({ inquiry }: { inquiry: Inquiry }) {
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [privateNotes, setPrivateNotes] = useState(inquiry.privateNotes || '');
    const [isSaving, startTransition] = useTransition();
    const { toast } = useToast();
    const supabase = createClient();
    
    // Status update logic
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

    useEffect(() => {
        const fetchCarDetails = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', inquiry.carId)
                .single();
            
            if (error) {
                console.error("Error fetching car for inquiry:", error);
            } else {
                setCar(data);
            }
            setLoading(false);
        };
        fetchCarDetails();
    }, [inquiry.carId, supabase]);

    const handleSaveNotes = () => {
        startTransition(async () => {
            const { success, error } = await updateInquiryNotes(inquiry.id, privateNotes);
            if (success) {
                toast({ title: "Notes saved!" });
            } else {
                toast({ title: "Error saving notes", description: error, variant: "destructive" });
            }
        });
    };

    const handleStatusChange = async (newStatus: 'new' | 'contacted' | 'closed') => {
        setIsUpdatingStatus(true);
        if (newStatus === 'closed') {
            setIsCloseModalOpen(true);
            setIsUpdatingStatus(false);
            return;
        }
        const { success, error } = await updateInquiry(inquiry.id, { status: newStatus });
        if (!success) {
            toast({ title: "Error updating status", description: error, variant: "destructive" });
        }
        setIsUpdatingStatus(false);
    };

    if (loading) {
        return <div className="p-6"><CarDetailSkeleton /></div>;
    }

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                    <CardTitle className="text-xl">Inquiry Details</CardTitle>
                    <CardDescription>Submitted on: {format(parseISO(inquiry.submittedAt), 'PPP p')}</CardDescription>
                </div>
                <div className="flex-grow overflow-auto p-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="font-medium">Name</p><p className="text-muted-foreground">{inquiry.customerName}</p></div>
                            <div><p className="font-medium">Phone</p><p className="text-muted-foreground">{inquiry.customerPhone}</p></div>
                             <div>
                                <p className="font-medium">Status</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="capitalize w-36 justify-start mt-1" disabled={isUpdatingStatus}>
                                        {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Badge variant={inquiry.status === 'new' ? 'default' : inquiry.status === 'contacted' ? 'secondary' : 'outline'} className="capitalize mr-2">{inquiry.status}</Badge>}
                                        <span className="truncate">{inquiry.status}</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                    <DropdownMenuRadioGroup
                                        value={inquiry.status}
                                        onValueChange={(value) => handleStatusChange(value as 'new' | 'contacted' | 'closed')}
                                    >
                                        <DropdownMenuRadioItem value="new">New</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="contacted">Contacted</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="closed">Closed</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {inquiry.isSeriousCustomer && (
                                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-2 rounded-md">
                                    <Star className="h-5 w-5"/>
                                    <span className="font-semibold text-sm">Serious Customer</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg">Car Details</CardTitle></CardHeader>
                        <CardContent>
                           {car ? <MiniCarCard car={car} /> : <p className="text-muted-foreground">Could not load car details.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-lg">Notes & Reports</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {inquiry.remarks && (
                                <div>
                                    <Label>Closure Report (Visible to Admin)</Label>
                                    <p className="text-sm p-3 bg-muted rounded-md border text-muted-foreground">{inquiry.remarks}</p>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="private-notes">Your Private Notes</Label>
                                <Textarea 
                                    id="private-notes"
                                    value={privateNotes}
                                    onChange={(e) => setPrivateNotes(e.target.value)}
                                    placeholder="Add notes about your conversation, reminders, etc."
                                    rows={5}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveNotes} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" /> Save Notes
                            </Button>
                        </CardFooter>
                    </Card>

                </div>
            </div>
             <CloseInquiryDialog 
                isOpen={isCloseModalOpen}
                onClose={() => setIsCloseModalOpen(false)}
                inquiry={inquiry}
            />
        </>
    );
}
