

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const notificationSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  recipientGroup: z.enum(['all-staff', 'all-customers', 'employee-a', 'employee-b']),
  link: z.string().url().optional().or(z.literal('')),
  createdBy: z.string().uuid(),
});

const updateNotificationSchema = notificationSchema.omit({ createdBy: true });


export async function createNotification(input: z.infer<typeof notificationSchema>) {
  const supabase = createClient();

  const validatedData = notificationSchema.safeParse(input);

  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.' };
  }
  
  const { message, recipientGroup, createdBy, link } = validatedData.data;

  const { error } = await supabase.from('notifications').insert([
    {
      message,
      recipientGroup,
      link: link || null,
      created_by: createdBy,
    },
  ]);

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/admin/notifications');
  revalidatePath('/dashboard/employee-a/notifications');
  revalidatePath('/dashboard/employee-b/notifications');

  return { success: true };
}


export async function updateNotification(id: string, input: z.infer<typeof updateNotificationSchema>) {
    const supabase = createClient();
    const validatedData = updateNotificationSchema.safeParse(input);

    if (!validatedData.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { message, recipientGroup, link } = validatedData.data;

    const { error } = await supabase
        .from('notifications')
        .update({ message, recipientGroup, link: link || null })
        .eq('id', id);
    
    if (error) {
        console.error('Error updating notification:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/notifications');
    return { success: true };
}

export async function deleteNotification(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/notifications');
    return { success: true };
}
