
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminNotificationsPage() {
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Send broadcast notifications to staff or customers.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Notification system not yet implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
}
