'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Settings Saved",
            description: "Your profile information has been updated.",
        });
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue={user?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input id="password" type="password" placeholder="Enter a new password"/>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" placeholder="Confirm your new password" />
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
