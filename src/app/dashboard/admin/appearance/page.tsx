
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateAppearanceSettings } from './actions';
import { Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AppearanceSettings {
    logoUrl?: string;
    coverImageUrl?: string;
    aboutImageUrl?: string;
    googleAdsenseId?: string;
}

export default function AdminAppearancePage() {
    const [settings, setSettings] = useState<AppearanceSettings>({});
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = createClient();
            setLoading(true);
            const { data, error } = await supabase
                .from('config')
                .select('appearance')
                .eq('id', 'singleton')
                .single();
            
            if (data?.appearance) {
                setSettings(data.appearance);
            } else if (error && error.code !== 'PGRST116') { // PGRST116: 'single' row not found
                console.error("Error fetching appearance settings:", error);
                toast({ title: "Error", description: "Could not fetch appearance settings.", variant: "destructive" });
            }
            setLoading(false);
        };
        fetchSettings();
    }, [toast]);

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
            const result = await updateAppearanceSettings(formData);
            if (result.success) {
                toast({ title: 'Settings Saved', description: 'Your site appearance has been updated.' });
            } else {
                toast({ title: 'Error Saving', description: result.error, variant: 'destructive' });
            }
        });
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-2">Loading Appearance Settings...</p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleFormSubmit}>
                <CardHeader>
                    <CardTitle>Site Appearance</CardTitle>
                    <CardDescription>Manage your website's logo, cover images, and advertisement settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo Image URL</Label>
                        <Input 
                            id="logoUrl" 
                            name="logoUrl"
                            placeholder="https://.../logo.png" 
                            value={settings.logoUrl || ''}
                            onChange={handleInputChange}
                        />
                         <p className="text-xs text-muted-foreground">Used in the header and footer.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="coverImageUrl">Homepage Cover Image URL</Label>
                        <Input 
                            id="coverImageUrl" 
                            name="coverImageUrl"
                            placeholder="https://.../cover-image.jpg"
                            value={settings.coverImageUrl || ''}
                            onChange={handleInputChange}
                        />
                         <p className="text-xs text-muted-foreground">The main image on the homepage hero section.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="aboutImageUrl">About Us Page Image URL</Label>
                        <Input 
                            id="aboutImageUrl" 
                            name="aboutImageUrl"
                            placeholder="https://.../about-us-image.jpg"
                            value={settings.aboutImageUrl || ''}
                            onChange={handleInputChange}
                        />
                         <p className="text-xs text-muted-foreground">The image displayed on the about us page.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="googleAdsenseId">Google AdSense ID</Label>
                        <Input 
                            id="googleAdsenseId"
                            name="googleAdsenseId"
                            placeholder="e.g., pub-1234567890123456"
                            value={settings.googleAdsenseId || ''}
                            onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground">Your Google AdSense Publisher ID for showing ads.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
