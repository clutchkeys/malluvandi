
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const appearanceSchema = z.object({
  logoUrl: z.string().url('Must be a valid URL for the logo.').or(z.literal('')),
  coverImageUrl: z.string().url('Must be a valid URL for the cover image.').or(z.literal('')),
  aboutImageUrl: z.string().url('Must be a valid URL for the about page image.').or(z.literal('')),
  googleAdsenseId: z.string().optional(),
});

export async function updateAppearanceSettings(formData: FormData) {
  const supabase = createClient();
  
  const data = {
    logoUrl: formData.get('logoUrl'),
    coverImageUrl: formData.get('coverImageUrl'),
    aboutImageUrl: formData.get('aboutImageUrl'),
    googleAdsenseId: formData.get('googleAdsenseId'),
  };

  const validatedData = appearanceSchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.', errors: validatedData.error.flatten().fieldErrors };
  }

  // Use a singleton ID 'singleton' for the appearance settings
  const { error } = await supabase
    .from('config')
    .update({ appearance: validatedData.data })
    .eq('id', 'singleton');

  if (error) {
    // If the update fails, it might be because the row doesn't exist. Let's try to insert it.
    // This is an upsert-like behavior.
     const { error: insertError } = await supabase
      .from('config')
      .insert({ id: 'singleton', appearance: validatedData.data });
      
     if (insertError) {
        console.error('Error updating/inserting appearance settings:', insertError);
        return { success: false, error: insertError.message };
     }
  }

  // Revalidate all pages that might use these images
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/dashboard/admin/appearance');
  
  return { success: true };
}
