
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const filtersSchema = z.object({
  brands: z.array(z.string()).min(1),
  models: z.record(z.array(z.string())),
  years: z.array(z.number()),
});

export async function updateFilterSettings(filters: z.infer<typeof filtersSchema>) {
  const supabase = createClient();

  const validatedData = filtersSchema.safeParse(filters);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  // There's only one row in the filters table, with a known ID.
  const { error } = await supabase
    .from('filters')
    .update(validatedData.data)
    .eq('id', 'singleton'); // Use a fixed ID for the single row

  if (error) {
    console.error('Error updating filters:', error);
    return { success: false, error: error.message };
  }

  // Revalidate pages that use these filters
  revalidatePath('/');
  revalidatePath('/sell');
  revalidatePath('/dashboard/admin/settings');

  return { success: true };
}
