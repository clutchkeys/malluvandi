
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Brand } from '@/lib/types';
import { BrandManager } from './brand-manager';

async function getBrands(): Promise<Brand[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('brands').select('*');
    if (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
    return data as Brand[];
}

export default async function MarqueeBrandsPage() {
    const brands = await getBrands();

    return (
        <div className="w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Marquee Brands</CardTitle>
                    <CardDescription>Add, edit, or delete the brands that appear in the homepage scrolling marquee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BrandManager initialBrands={brands} />
                </CardContent>
            </Card>
        </div>
    );
}

