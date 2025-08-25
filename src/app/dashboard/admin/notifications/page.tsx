

'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createNotification, updateNotification, deleteNotification } from './actions';
import { Loader2, Edit, Trash2, PlusCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Notification } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const recipientGroups = [
    { value: 'all-staff', label: 'All Staff' },
    { value: 'all-customers', label: 'All Customers' },
    { value: 'employee-a', label: 'Content Editors (Employee-A)' },
    { value: 'employee-b', label: 'Sales & Support (Employee-B)' },
];

export default function AdminNotificationsPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [recipientGroup, setRecipientGroup] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const supabase = createClient();
    
    // For Edit Modal
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('createdAt', { ascending: false });
            
            if (error) {
                console.error("Error fetching notifications:", error);
                toast({ title: "Error", description: "Could not fetch notifications.", variant: "destructive" });
            } else {
                setNotifications(data as Notification[]);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [supabase, toast]);
    
    useEffect(() => {
        if (editingNotification) {
            setMessage(editingNotification.message);
            setLink(editingNotification.link || '');
            setRecipientGroup(editingNotification.recipientGroup);
            setIsEditModalOpen(true);
        } else {
             setMessage('');
             setLink('');
             setRecipientGroup('');
        }
    }, [editingNotification]);


    const handleFormSubmit = () => {
        if (!message || !recipientGroup) {
            toast({ title: 'Error', description: 'Please enter a message and select a recipient group.', variant: 'destructive' });
            return;
        }
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
            return;
        }

        startTransition(async () => {
            const action = editingNotification ? updateNotification : createNotification;
            const payload = {
                message,
                recipientGroup: recipientGroup as any,
                link,
            };
            
            const result = editingNotification 
                ? await updateNotification(editingNotification.id, payload)
                : await createNotification({ ...payload, createdBy: user.id });

            if (result.success) {
                toast({ title: `Notification ${editingNotification ? 'Updated' : 'Sent'}!`, description: 'Your message has been processed successfully.'});
                setMessage('');
                setLink('');
                setRecipientGroup('');
                setIsEditModalOpen(false);
                setEditingNotification(null);
                // Refetch notifications
                const { data } = await supabase.from('notifications').select('*').order('createdAt', { ascending: false });
                if (data) setNotifications(data as Notification[]);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive'});
            }
        });
    };
    
    const handleDelete = (id: string) => {
        startTransition(async () => {
             const result = await deleteNotification(id);
             if (result.success) {
                toast({ title: 'Notification Deleted' });
                setNotifications(prev => prev.filter(n => n.id !== id));
             } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive'});
             }
        });
    }

    return (
        <div className="w-full space-y-6">
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
                        <Label htmlFor="link">Optional Link</Label>
                        <Input
                          id="link"
                          type="url"
                          placeholder="https://example.com/some-page"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
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
                    <Button onClick={handleFormSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Notification
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sent Notifications</CardTitle>
                    <CardDescription>View, edit, or delete previously sent notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                    <Table>
                        <TableHeader>
                           <TableRow>
                             <TableHead>Message</TableHead>
                             <TableHead>Recipient Group</TableHead>
                             <TableHead>Link</TableHead>
                             <TableHead>Sent At</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.map(notif => (
                                <TableRow key={notif.id}>
                                    <TableCell className="max-w-xs truncate">{notif.message}</TableCell>
                                    <TableCell className="capitalize">{notif.recipientGroup.replace('-', ' ')}</TableCell>
                                    <TableCell>{notif.link ? <a href={notif.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Link <ExternalLink size={14}/></a> : 'None'}</TableCell>
                                    <TableCell>{format(new Date(notif.createdAt), "dd MMM, yyyy")}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingNotification(notif)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                   <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete this notification.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(notif.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {notifications.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No notifications sent yet.</TableCell>
                                 </TableRow>
                             )}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

             <AlertDialog open={isEditModalOpen} onOpenChange={ (isOpen) => { if (!isOpen) { setEditingNotification(null); setIsEditModalOpen(false); } }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Notification</AlertDialogTitle>
                    </AlertDialogHeader>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-message">Message</Label>
                            <Textarea id="edit-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-link">Optional Link</Label>
                            <Input id="edit-link" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-recipient">Recipient Group</Label>
                            <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                                <SelectTrigger id="edit-recipient"><SelectValue /></SelectTrigger>
                                <SelectContent>{recipientGroups.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleFormSubmit} disabled={isPending}>
                          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Update
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
        </div>
    );
}
