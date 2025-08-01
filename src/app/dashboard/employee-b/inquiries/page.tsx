
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import type { Inquiry, Car } from '@/lib/types';
import { summarizeCarDetails } from '@/ai/flows/summarize-car-details';
import { answerCarQueries } from '@/ai/flows/answer-car-queries';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';


const InquiryListItem = ({ inquiry, onSelect, isSelected }: { inquiry: Inquiry, onSelect: (id: string) => void, isSelected: boolean }) => {
    const [date, setDate] = useState('');
    useEffect(() => {
        setDate(new Date(inquiry.submittedAt).toLocaleDateString('en-CA'));
    }, [inquiry.submittedAt]);

    return (
        <button onClick={() => onSelect(inquiry.id)} className={`w-full text-left p-4 border-b hover:bg-muted/50 ${isSelected ? 'bg-muted' : ''}`}>
            <p className="font-semibold">{inquiry.customerName}</p>
            <p className="text-sm text-muted-foreground">{inquiry.carSummary}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">{date || ''}</p>
                <Badge variant={inquiry.status === 'new' ? 'default' : inquiry.status === 'contacted' ? 'secondary' : 'outline'} className="capitalize">{inquiry.status}</Badge>
            </div>
        </button>
    );
}

export default function EmployeeBInquiriesPage() {
  const { user, loading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        const inquiriesRef = collection(db, 'inquiries');
        const q = query(
            inquiriesRef, 
            where("assignedTo", "==", user.id), 
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userInquiries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
            const sortedInquiries = userInquiries.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setInquiries(sortedInquiries);

            if (sortedInquiries.length > 0 && !selectedInquiryId) {
                setSelectedInquiryId(sortedInquiries[0].id);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }
  }, [user, selectedInquiryId]);
  
  const selectedInquiry = inquiries.find(inq => inq.id === selectedInquiryId);
  
  const updateInquiryInState = (inquiryId: string, updates: Partial<Inquiry>) => {
    setInquiries(prev => prev.map(inq => inq.id === inquiryId ? {...inq, ...updates} : inq));
  };

  return (
      <ResizablePanelGroup direction="horizontal" className="h-full max-w-full rounded-lg border">
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">My Inquiries ({inquiries.length})</h2>
            </div>
            <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : inquiries.length > 0 ? inquiries.map(inquiry => (
                  <InquiryListItem 
                    key={inquiry.id}
                    inquiry={inquiry}
                    onSelect={setSelectedInquiryId}
                    isSelected={selectedInquiryId === inquiry.id}
                  />
                )) : (
                  <div className="p-8 text-center text-muted-foreground">No inquiries found.</div>
                )}
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <ScrollArea className="h-[calc(100vh-theme(spacing.24))]">
            {isLoading && !selectedInquiry ? (
              <div className="p-6 space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : selectedInquiry ? (
               <InquiryDetails inquiry={selectedInquiry} onUpdate={updateInquiryInState} />
            ) : (
                <div className="p-8 text-center text-muted-foreground h-full flex items-center justify-center">Select an inquiry to view details</div>
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
  );
}

function InquiryDetails({ inquiry, onUpdate }: { inquiry: Inquiry; onUpdate: (inquiryId: string, updates: Partial<Inquiry>) => void }) {
    const [car, setCar] = useState<Car | null>(null);
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    
    const [query, setQuery] = useState('');
    const [isAiAnswering, setIsAiAnswering] = useState(false);
    const [chatHistory, setChatHistory] = useState<{user:string, ai:string}[]>([]);
    
    const [remarks, setRemarks] = useState(inquiry.remarks);
    const [privateNotes, setPrivateNotes] = useState(inquiry.privateNotes);

    const { toast } = useToast();

    useEffect(() => {
        setRemarks(inquiry.remarks);
        setPrivateNotes(inquiry.privateNotes);
        setSummary('');
        setChatHistory([]);

        const fetchCarDetails = async () => {
            if (!inquiry.carId) return;
            
            const carDocRef = doc(db, 'cars', inquiry.carId);
            const carDoc = await getDoc(carDocRef);
            if(carDoc.exists()){
                const carData = { id: carDoc.id, ...carDoc.data() } as Car;
                setCar(carData);
                setIsSummaryLoading(true);
                summarizeCarDetails(carData).then(result => {
                    setSummary(result.summary);
                }).catch(err => {
                    console.error(err);
                    setSummary("Failed to generate summary.");
                }).finally(() => {
                    setIsSummaryLoading(false);
                });
            } else {
                 setCar(null);
                 setSummary("Car details not found.");
                 setIsSummaryLoading(false);
            }
        };

        fetchCarDetails();
    }, [inquiry]);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!query.trim() || !car) return;
        setIsAiAnswering(true);
        
        const fullCarDetails = JSON.stringify(car, null, 2);

        try {
            const result = await answerCarQueries({ carDetails: fullCarDetails, customerQuery: query });
            setChatHistory(prev => [...prev, { user: query, ai: result.answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { user: query, ai: "Sorry, I couldn't process that request." }]);
        } finally {
            setQuery('');
            setIsAiAnswering(false);
        }
    };
    
    const handleSave = async (field: 'remarks' | 'privateNotes' | 'status', value: string) => {
        const inquiryRef = doc(db, 'inquiries', inquiry.id);
        try {
            await updateDoc(inquiryRef, { [field]: value });
            onUpdate(inquiry.id, { [field]: value as any });
            toast({ title: `${field.charAt(0).toUpperCase() + field.slice(1)} Updated` });
        } catch (error) {
            toast({ title: 'Update Failed', variant: 'destructive' });
        }
    }
    
    if (!car && isSummaryLoading) return <div className="p-6">Loading car details...</div>;

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Customer: {inquiry.customerName}</CardTitle>
                            <CardDescription>Phone: {inquiry.customerPhone} | Inquiring about: {car?.brand} {car?.model}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Select onValueChange={(value) => handleSave('status', value)} defaultValue={inquiry.status}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI-Generated Summary</CardTitle>
                    <CardDescription>A quick summary of the car's key details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isSummaryLoading ? <Skeleton className="h-24 w-full" /> : <p className="text-sm text-muted-foreground">{summary}</p>}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle>Call Remarks</CardTitle><CardDescription>Visible to admins and managers.</CardDescription></CardHeader>
                    <CardContent><Textarea value={remarks || ''} onChange={e => setRemarks(e.target.value)} placeholder="Log call outcomes, customer feedback..." /></CardContent>
                    <CardFooter><Button size="sm" onClick={() => handleSave('remarks', remarks || '')}>Save Remarks</Button></CardFooter>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Private Notes</CardTitle><CardDescription>Only visible to you.</CardDescription></CardHeader>
                    <CardContent><Textarea value={privateNotes || ''} onChange={e => setPrivateNotes(e.target.value)} placeholder="Personal reminders, follow-up actions..." /></CardContent>
                     <CardFooter><Button size="sm" onClick={() => handleSave('privateNotes', privateNotes || '')}>Save Notes</Button></CardFooter>
                </Card>
            </div>
           
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
                    <CardDescription>Ask questions about the car, loans, or taxes to get quick answers for the customer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                        {chatHistory.length === 0 && <p className="text-sm text-muted-foreground">Chat history will appear here.</p>}
                        {chatHistory.map((chat, index) => (
                            <div key={index} className="space-y-2 mb-4">
                                <p className="text-sm font-semibold text-right">You: {chat.user}</p>
                                <p className="text-sm bg-muted p-2 rounded-md">AI: {chat.ai}</p>
                            </div>
                        ))}
                         {isAiAnswering && <div className="flex items-center gap-2"><Loader2 className="animate-spin" /><span>Thinking...</span></div>}
                    </ScrollArea>
                    <form onSubmit={handleQuerySubmit} className="flex gap-2">
                        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., What is the mileage? or Can I get a loan for this?" disabled={isAiAnswering || !car}/>
                        <Button type="submit" disabled={isAiAnswering || !car}>
                            {isAiAnswering ? <Loader2 className="animate-spin" /> : <Send />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
