
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  logoUrl: z.string().url('Must be a valid URL'),
});


export async function createBrand(formData: FormData) {
    const supabase = createClient();
    
    const validatedData = brandSchema.safeParse({
        name: formData.get('name'),
        logoUrl: formData.get('logoUrl'),
    });

    if (!validatedData.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { error } = await supabase.from('brands').insert([validatedData.data]);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/marquee-brands');
    revalidatePath('/'); // Revalidate homepage as well
    return { success: true };
}


export async function updateBrand(id: string, formData: FormData) {
    const supabase = createClient();

    const validatedData = brandSchema.safeParse({
        name: formData.get('name'),
        logoUrl: formData.get('logoUrl'),
    });

    if (!validatedData.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { error } = await supabase
        .from('brands')
        .update(validatedData.data)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/marquee-brands');
    revalidatePath('/');
    return { success: true };
}

export async function deleteBrand(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/marquee-brands');
    revalidatePath('/');
    return { success: true };
}
