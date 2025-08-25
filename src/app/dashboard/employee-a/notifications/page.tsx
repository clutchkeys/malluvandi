

import { createClient } from '@/lib/supabase/server';
import { Bell, Rss } from 'lucide-react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Notification } from '@/lib/types';
import { format } from 'date-fns';

async function getNotifications() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('recipientGroup', ['all-staff', 'employee-a'])
        .order('createdAt', { ascending: false });
    
    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }

    return data as Notification[];
}


export default async function EmployeeANotificationsPage() {
    const notifications = await getNotifications();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>System-wide announcements will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                {notifications.length === 0 ? (
                    <div className="flex flex-col h-64 items-center justify-center text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">No new notifications</h3>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <div key={notif.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                <div className="bg-primary/10 text-primary p-3 rounded-full">
                                   <Rss className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(notif.createdAt), "PPP p")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
      </Card>
    )
}
