
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const currentYear = new Date().getFullYear();

const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1980).max(currentYear),
  registrationYear: z.coerce.number().int().min(1980, 'Year must be after 1980').max(currentYear, `Year cannot be in the future`).optional(),
  price: z.number().int().positive(),
  kmRun: z.number().int().positive(),
  fuel: z.enum(['Petrol', 'Diesel', 'Electric']),
  transmission: z.enum(['Automatic', 'Manual']),
  ownership: z.number().int().min(1),
  color: z.string().min(1, 'Color is required'),
  engineCC: z.number().int().positive(),
  additionalDetails: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  badges: z.array(z.string()).optional(),
  instagramReelUrl: z.string().url().optional().or(z.literal('')),
});


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


export async function updateCar(carId: string, carData: z.infer<typeof carSchema>) {
    const supabase = createClient();

    const validatedData = carSchema.safeParse(carData);
    if (!validatedData.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { error } = await supabase
        .from('cars')
        .update(validatedData.data)
        .eq('id', carId);

    if (error) {
        console.error('Error updating car:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin/listings');
    revalidatePath('/dashboard/employee-a/listings');
    revalidatePath(`/car/${carId}`);

    return { success: true };
}

export async function deleteCar(carId: string) {
    const supabase = createClient();
    
    // First, delete all inquiries associated with this car.
    const { error: inquiryError } = await supabase
        .from('inquiries')
        .delete()
        .eq('carId', carId);

    if (inquiryError) {
        console.error('Error deleting associated inquiries:', inquiryError);
        return { success: false, error: inquiryError.message };
    }

    // Now, delete the car itself.
    const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

    if (error) {
        console.error('Error deleting car:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/dashboard/admin/listings');
    revalidatePath('/dashboard/employee-a/listings');
    revalidatePath('/');

    return { success: true };
}
