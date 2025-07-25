
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import type { Notification } from "@/lib/types";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Bell, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function EmployeeANotificationsPage() {
    const { user, loading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotifLoading, setIsNotifLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const notifRef = collection(db, 'notifications');
            const q = query(
                notifRef,
                where('recipientGroup', 'in', ['all', 'all-staff', 'employee-a']),
                orderBy('createdAt', 'desc')
            );
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
                setIsNotifLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user]);

    if (loading) {
        return (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Team Announcements</CardTitle>
                    <CardDescription>Recent messages from the admin team.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isNotifLoading ? (
                        <div className="text-center text-muted-foreground py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                    ) : notifications.length > 0 ? (
                        <div className="space-y-6">
                            {notifications.map(notif => (
                                <div key={notif.id} className="flex items-start gap-4">
                                    <div className="bg-muted text-muted-foreground p-3 rounded-full">
                                        <Bell className="h-5 w-5"/>
                                    </div>
                                    <div className="border-b pb-4 flex-1">
                                        <p className="text-sm">{notif.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No new notifications at the moment.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
