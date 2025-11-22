'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function requestPasswordReset(email: string) {
  const supabase = createClient();
  const headersList = headers();
  const origin = headersList.get('origin');

  // Vercel provides the production URL in an env var.
  // We construct the URL safely, preferring the Vercel URL if available.
  const getURL = () => {
    const url =
      process.env.VERCEL_URL || // Vercel production URL
      origin ||                // Fallback to request origin
      'http://localhost:9002';   // Default for local dev
    return url.startsWith('http') ? url : `https://` + url;
  };

  const redirectTo = `${getURL()}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
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
