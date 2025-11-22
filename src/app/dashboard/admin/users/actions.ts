
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/admin/users');
  return { success: true, data: data?.[0] };
}

export async function updateUser(userId: string, updates: { name: string }) {
  const supabase = createClient();

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/dashboard/admin/users');
  return { success: true };
}


export async function deleteUser(userId: string) {
  const supabase = createClient();

  // This only deletes the user's profile, not the auth user.
  // Full user deletion requires admin privileges not available in client-side/server action logic.
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user profile:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/dashboard/admin/users');
  return { success: true };
}

