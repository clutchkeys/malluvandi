'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function requestPasswordReset(email: string) {
  const supabase = createClient();
  const origin = headers().get('origin');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  });

  if (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateUserPassword(password: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error('Error updating password:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
