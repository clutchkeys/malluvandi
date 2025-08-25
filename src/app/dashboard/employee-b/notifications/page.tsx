
'use client';
import { Bell } from "lucide-react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function EmployeeBNotificationsPage() {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>System-wide announcements will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-64 items-center justify-center text-center text-muted-foreground">
                <Bell className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No new notifications</h3>
                <p className="text-sm">You're all caught up!</p>
            </CardContent>
      </Card>
    )
}
