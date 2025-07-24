
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeANotificationsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Team Announcements</CardTitle>
                    <CardDescription>Recent messages from the admin team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        No new notifications at the moment.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
