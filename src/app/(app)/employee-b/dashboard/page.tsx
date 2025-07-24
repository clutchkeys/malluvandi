
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MOCK_INQUIRIES } from '@/lib/mock-data';
import { CheckCircle, Loader2, MessageSquare } from 'lucide-react';

export default function EmployeeBDashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, closed: 0 });

  useEffect(() => {
    if (user) {
      const userInquiries = MOCK_INQUIRIES.filter(inq => inq.assignedTo === user.id);
      const closedInquiries = userInquiries.filter(inq => inq.status === 'closed').length;
      setStats({ assigned: userInquiries.length, closed: closedInquiries });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
         <p className="text-muted-foreground">Here's a summary of your performance.</p>
       </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.performanceScore || 0}/10</div>
              <p className="text-xs text-muted-foreground">Your current performance rating</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs text-muted-foreground">Total inquiries in your name</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closing Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.assigned > 0 ? Math.round((stats.closed / stats.assigned) * 100) : 0}%</div>
                <Progress value={stats.assigned > 0 ? (stats.closed / stats.assigned) * 100 : 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
       </div>
       <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Recent announcements from the admin team.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    No new notifications.
                </div>
            </CardContent>
       </Card>
    </div>
  )
}
