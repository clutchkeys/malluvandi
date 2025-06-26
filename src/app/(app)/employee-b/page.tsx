'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { cars, inquiries as mockInquiries } from '@/lib/data';
import type { Inquiry, Car } from '@/lib/types';
import { summarizeCarDetails } from '@/ai/flows/summarize-car-details';
import { answerCarQueries } from '@/ai/flows/answer-car-queries';

export default function EmployeeBPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
  const userInquiries = useMemo(() => mockInquiries.filter(inq => inq.assignedTo === user?.id), [user]);

  React.useEffect(() => {
    if(userInquiries.length > 0) {
      setSelectedInquiry(userInquiries[0]);
    }
  }, [userInquiries]);

  if (!loading && user?.role !== 'employee-b') {
    router.push('/');
    return null;
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.24))]">
       <div className="flex items-center justify-between space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sales & Support Dashboard</h1>
      </div>
      <ResizablePanelGroup direction="horizontal" className="h-full max-w-full rounded-lg border">
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">My Inquiries ({userInquiries.length})</h2>
            </div>
            <ScrollArea className="flex-1">
                {userInquiries.map(inquiry => {
                    const car = cars.find(c => c.id === inquiry.carId);
                    return(
                        <button key={inquiry.id} onClick={() => setSelectedInquiry(inquiry)} className={`w-full text-left p-4 border-b hover:bg-muted/50 ${selectedInquiry?.id === inquiry.id ? 'bg-muted' : ''}`}>
                            <p className="font-semibold">{inquiry.customerName}</p>
                            <p className="text-sm text-muted-foreground">{car?.brand} {car?.model}</p>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-muted-foreground">{inquiry.submittedAt.toLocaleDateString()}</p>
                                <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'} className="capitalize">{inquiry.status}</Badge>
                            </div>
                        </button>
                    )
                })}
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <ScrollArea className="h-full">
            {selectedInquiry ? <InquiryDetails inquiry={selectedInquiry} /> : <div className="p-8 text-center text-muted-foreground">Select an inquiry to view details</div>}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function InquiryDetails({ inquiry }: { inquiry: Inquiry }) {
    const car = cars.find(c => c.id === inquiry.carId);
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    
    const [query, setQuery] = useState('');
    const [isAiAnswering, setIsAiAnswering] = useState(false);
    const [chatHistory, setChatHistory] = useState<{user:string, ai:string}[]>([]);


    React.useEffect(() => {
        if (!car) return;
        setIsSummaryLoading(true);
        setSummary('');
        setChatHistory([]);
        summarizeCarDetails(car).then(result => {
            setSummary(result.summary);
            setIsSummaryLoading(false);
        }).catch(err => {
            console.error(err);
            setSummary("Failed to generate summary.");
            setIsSummaryLoading(false);
        });
    }, [car]);

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

    if (!car) return <div>Car not found for this inquiry.</div>;

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Customer: {inquiry.customerName}</CardTitle>
                    <CardDescription>Phone: {inquiry.customerPhone} | Inquiring about: {car.brand} {car.model}</CardDescription>
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
                    <CardHeader><CardTitle>Call Remarks</CardTitle><CardDescription>Visible to admins.</CardDescription></CardHeader>
                    <CardContent><Textarea defaultValue={inquiry.remarks} placeholder="Log call outcomes, customer feedback..." /></CardContent>
                    <CardFooter><Button size="sm">Save Remarks</Button></CardFooter>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Private Notes</CardTitle><CardDescription>Only visible to you.</CardDescription></CardHeader>
                    <CardContent><Textarea defaultValue={inquiry.privateNotes} placeholder="Personal reminders, follow-up actions..." /></CardContent>
                     <CardFooter><Button size="sm">Save Notes</Button></CardFooter>
                </Card>
            </div>
           
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
                    <CardDescription>Ask questions about the car to get quick answers for the customer.</CardDescription>
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
                    </ScrollArea>
                    <form onSubmit={handleQuerySubmit} className="flex gap-2">
                        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., What is the mileage?" disabled={isAiAnswering}/>
                        <Button type="submit" disabled={isAiAnswering}>
                            {isAiAnswering ? <Loader2 className="animate-spin" /> : <Send />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// Sub-component for Resizable Panel
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
