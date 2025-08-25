

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const notificationSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  recipientGroup: z.enum(['all-staff', 'all-customers', 'employee-a', 'employee-b']),
  createdBy: z.string().uuid(),
});

export async function createNotification(input: z.infer<typeof notificationSchema>) {
  const supabase = createClient();

  const validatedData = notificationSchema.safeParse(input);

  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const { error } = await supabase.from('notifications').insert([
    {
      ...validatedData.data,
    },
  ]);

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  // Revalidate the notification pages for employees
  revalidatePath('/dashboard/employee-a/notifications');
  revalidatePath('/dashboard/employee-b/notifications');

  return { success: true };
}
