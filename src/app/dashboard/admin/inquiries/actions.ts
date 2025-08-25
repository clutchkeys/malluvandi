
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function assignInquiry(inquiryId: string, employeeId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inquiries')
    .update({ assignedTo: employeeId, status: 'contacted' })
    .eq('id', inquiryId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning inquiry:', error);
    return { success: false, error: error.message };
  }
  
  // Revalidate both admin and employee-b pages
  revalidatePath('/dashboard/admin/inquiries');
  revalidatePath('/dashboard/employee-b/inquiries');
  revalidatePath('/dashboard/admin/serious-customers');
  
  return { success: true, data };
}


export async function updateInquiry(inquiryId: string, updates: { status?: 'new' | 'contacted' | 'closed', remarks?: string; privateNotes?: string; isSeriousCustomer?: boolean; }) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inquiries')
    .update(updates)
    .eq('id', inquiryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating inquiry status:', error);
    return { success: false, error: error.message };
  }

  // Revalidate both admin and employee-b pages
  revalidatePath('/dashboard/admin/inquiries');
  revalidatePath('/dashboard/employee-b/inquiries');
  revalidatePath('/dashboard/admin/serious-customers');

  return { success: true, data };
}

export async function updateInquiryNotes(inquiryId: string, privateNotes: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inquiries')
    .update({ privateNotes })
    .eq('id', inquiryId)
    .select('id, privateNotes')
    .single();

  if (error) {
    console.error('Error updating inquiry notes:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/dashboard/employee-b/inquiries');

  return { success: true, data };
}
