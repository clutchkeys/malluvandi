
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Trash2, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateFilterSettings } from './actions';

interface Filters {
  brands: string[];
  models: Record<string, string[]>;
  years: number[];
}

export default function AdminSettingsPage() {
    const [filters, setFilters] = useState<Filters | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const supabase = createClient();
    
    const [newBrand, setNewBrand] = useState('');
    const [newModels, setNewModels] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchFilters = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('filters')
                .select('*')
                .limit(1); // Use limit(1) instead of single()
            
            if (error) {
                console.error("Error fetching filters:", error);
                toast({ title: "Error", description: "Could not fetch filter settings. Please ensure the 'filters' table exists and is populated.", variant: "destructive" });
            } else if (data && data.length > 0) {
                setFilters(data[0] as Filters);
            } else {
                 toast({ title: "No Settings Found", description: "Filter settings have not been configured yet.", variant: "destructive" });
            }
            setLoading(false);
        };

        fetchFilters();
    }, [supabase, toast]);
    
    const handleAddBrand = () => {
        if (!newBrand.trim() || !filters) return;
        if (filters.brands.includes(newBrand.trim())) {
            toast({ title: "Brand exists", description: "This brand is already in the list.", variant: "destructive"});
            return;
        }
        setFilters({
            ...filters,
            brands: [...filters.brands, newBrand.trim()].sort(),
            models: { ...filters.models, [newBrand.trim()]: [] }
        });
        setNewBrand('');
    };
    
    const handleRemoveBrand = (brandToRemove: string) => {
        if (!filters) return;
        const newModels = { ...filters.models };
        delete newModels[brandToRemove];
        
        setFilters({
            ...filters,
            brands: filters.brands.filter(b => b !== brandToRemove),
            models: newModels
        });
    };
    
    const handleAddModel = (brand: string) => {
        const modelToAdd = newModels[brand]?.trim();
        if (!modelToAdd || !filters) return;
        if (filters.models[brand]?.includes(modelToAdd)) {
            toast({ title: "Model exists", description: "This model is already in the list for this brand.", variant: "destructive"});
            return;
        }
        setFilters({
            ...filters,
            models: {
                ...filters.models,
                [brand]: [...(filters.models[brand] || []), modelToAdd].sort()
            }
        });
        setNewModels(prev => ({...prev, [brand]: ''}));
    };
    
    const handleRemoveModel = (brand: string, modelToRemove: string) => {
        if (!filters) return;
        setFilters({
            ...filters,
            models: {
                ...filters.models,
                [brand]: filters.models[brand].filter(m => m !== modelToRemove)
            }
        });
    };

    const handleSaveChanges = () => {
        if (!filters) return;
        startTransition(async () => {
            const result = await updateFilterSettings(filters);
            if (result.success) {
                toast({ title: "Settings Saved", description: "Filter settings have been updated successfully." });
            } else {
                toast({ title: "Error Saving", description: result.error, variant: "destructive" });
            }
        });
    };

    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading settings...</p>
            </div>
        );
    }
    
    if (!filters) {
        return <p className="text-destructive">Could not load filter settings. See console for details.</p>;
    }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Brands</CardTitle>
          <CardDescription>Add or remove car brands from the filters.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {filters.brands.map(brand => (
                    <AccordionItem value={brand} key={brand}>
                        <AccordionTrigger className="hover:no-underline">
                           <div className="flex justify-between items-center w-full pr-4">
                             <span>{brand}</span>
                             <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleRemoveBrand(brand); }}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-muted/50 p-4 rounded-md">
                            <h4 className="font-semibold mb-2">Models for {brand}</h4>
                            <ul className="space-y-2 mb-4">
                                {filters.models[brand]?.map(model => (
                                    <li key={model} className="flex justify-between items-center text-sm p-2 rounded bg-background">
                                        <span>{model}</span>
                                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => handleRemoveModel(brand, model)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                                {filters.models[brand]?.length === 0 && <li className="text-sm text-muted-foreground">No models added yet.</li>}
                            </ul>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder={`Add new model for ${brand}`} 
                                    value={newModels[brand] || ''}
                                    onChange={(e) => setNewModels(prev => ({...prev, [brand]: e.target.value}))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddModel(brand)}
                                />
                                <Button onClick={() => handleAddModel(brand)}>Add Model</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
        <CardFooter>
             <div className="flex gap-2 w-full">
                <Input 
                    placeholder="Add new brand" 
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                />
                <Button onClick={handleAddBrand} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Brand
                </Button>
            </div>
        </CardFooter>
      </Card>
      
       <div className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
            </Button>
        </div>
    </div>
  );
}
