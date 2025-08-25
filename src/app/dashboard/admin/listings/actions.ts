
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCarStatus(carId: string, status: 'approved' | 'rejected') {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('cars')
    .update({ status: status })
    .eq('id', carId)
    .select()
    .single();

  if (error) {
    console.error('Error updating car status:', error);
    return { success: false, error: error.message };
  }

  // Revalidate both admin and employee listing pages
  revalidatePath('/dashboard/admin/listings');
  revalidatePath('/dashboard/employee-a/listings');
  revalidatePath('/'); // Revalidate home page as new cars might be approved

  return { success: true, data };
}
