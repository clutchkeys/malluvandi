
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient as createAdminClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


const newUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'employee-a', 'employee-b', 'customer']),
});


export async function createNewUser(formData: z.infer<typeof newUserSchema>) {
    const cookieStore = cookies();
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );
    
    const validatedData = newUserSchema.safeParse(formData);
    if (!validatedData.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { name, email, password, role } = validatedData.data;

    // Use the admin client to create a user without sending a confirmation email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
            full_name: name,
            role: role,
        }
    });

    if (authError) {
        console.error('Error creating auth user:', authError);
        return { success: false, error: authError.message };
    }

    // The on-user-created trigger should handle creating the profile,
    // but we can update the role just in case.
    if (authData.user) {
         const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: role })
            .eq('id', authData.user.id);
        
         if (profileError) {
            console.error("Error updating profile role:", profileError);
            // Non-critical error, so we don't return failure here
         }
    }


    revalidatePath('/dashboard/admin/users');
    return { success: true };
}


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
  const cookieStore = cookies();
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  // Use the admin client to delete the user from auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
      console.error('Error deleting auth user:', authError);
      return { success: false, error: authError.message };
  }

  // The on-user-deleted trigger should handle deleting the profile, but we can call it just in case.
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);
    
   if (profileError) {
    console.warn('Could not delete user profile, it might have been deleted by the trigger.', profileError.message);
   }

  revalidatePath('/dashboard/admin/users');
  return { success: true };
}
