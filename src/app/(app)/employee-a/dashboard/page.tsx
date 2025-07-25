
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
import { CheckCircle, FileText, Loader2, MessageSquare, Bell } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function EmployeeADashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ submitted: 0, approved: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifLoading, setIsNotifLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch car stats
      const carsRef = collection(db, 'cars');
      const qCars = query(carsRef, where("submittedBy", "==", user.id));
      const unsubCars = onSnapshot(qCars, (querySnapshot) => {
        const userCars = querySnapshot.docs.map(doc => doc.data());
        const approvedCars = userCars.filter(c => c.status === 'approved').length;
        setStats({ submitted: userCars.length, approved: approvedCars });
      });

      // Fetch notifications
      const notifRef = collection(db, 'notifications');
      const qNotif = query(
          notifRef,
          where('recipientGroup', 'in', ['all', 'all-staff', 'employee-a']),
          orderBy('createdAt', 'desc'),
          limit(5)
      );
      const unsubNotif = onSnapshot(qNotif, (snapshot) => {
          setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
          setIsNotifLoading(false);
      });

      return () => {
        unsubCars();
        unsubNotif();
      };
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
              <CardTitle className="text-sm font-medium">Total Listings Submitted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submitted}</div>
              <p className="text-xs text-muted-foreground">All cars you've added</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Listings Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0}%</div>
                <Progress value={stats.submitted > 0 ? (stats.approved / stats.submitted) * 100 : 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
       </div>
       <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Recent announcements from the admin team.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isNotifLoading ? (
                    <div className="text-center text-muted-foreground py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <div key={notif.id} className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary p-2 rounded-full">
                                    <Bell className="h-5 w-5"/>
                                </div>
                                <div>
                                    <p className="text-sm">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        No new notifications.
                    </div>
                )}
            </CardContent>
       </Card>
    </div>
  )
}
