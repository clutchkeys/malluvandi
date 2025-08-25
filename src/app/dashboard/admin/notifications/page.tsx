

'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from './actions';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const recipientGroups = [
    { value: 'all-staff', label: 'All Staff' },
    { value: 'all-customers', label: 'All Customers' },
    { value: 'employee-a', label: 'Content Editors (Employee-A)' },
    { value: 'employee-b', label: 'Sales & Support (Employee-B)' },
];

export default function AdminNotificationsPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [recipientGroup, setRecipientGroup] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!message || !recipientGroup) {
            toast({ title: 'Error', description: 'Please enter a message and select a recipient group.', variant: 'destructive' });
            return;
        }
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
            return;
        }

        startTransition(async () => {
            const result = await createNotification({
                message,
                recipientGroup: recipientGroup as any, // Cast because we know it's valid
                createdBy: user.id
            });

            if (result.success) {
                toast({ title: 'Notification Sent!', description: 'Your message has been sent successfully.'});
                setMessage('');
                setRecipientGroup('');
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive'});
            }
        });
    };

    return (
        <div className="w-full">
            <Card>
                <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>Send broadcast notifications to staff or customers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                            id="message" 
                            placeholder="Type your notification message here..." 
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Group</Label>
                        <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                            <SelectTrigger id="recipient">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {recipientGroups.map(group => (
                                    <SelectItem key={group.value} value={group.value}>
                                        {group.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Notification
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
