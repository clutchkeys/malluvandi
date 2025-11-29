
'use server';

import { randomUUID } from 'crypto';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Car } from '@/lib/types';
import { updateCar } from '@/app/dashboard/admin/listings/actions';


const currentYear = new Date().getFullYear();

const carFormSchema = z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.coerce.number().int().min(1980, 'Year must be after 1980').max(currentYear, `Year cannot be in the future`),
    registrationYear: z.coerce.number().int().min(1980, 'Year must be after 1980').max(currentYear, `Year cannot be in the future`).optional(),
    price: z.coerce.number().int().positive('Price must be a positive number'),
    kmRun: z.coerce.number().int().positive('KM driven must be a positive number'),
    fuel: z.enum(['Petrol', 'Diesel', 'Electric'], { required_error: 'Fuel type is required' }),
    transmission: z.enum(['Automatic', 'Manual'], { required_error: 'Transmission is required' }),
    ownership: z.coerce.number().int().min(1, 'Ownership is required'),
    color: z.string().min(1, 'Color is required'),
    additionalDetails: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    badges: z.array(z.string()).optional(),
    instagramReelUrl: z.string().url().optional().or(z.literal('')),
});

type CarFormData = z.infer<typeof carFormSchema>;

export async function uploadImagesAndSubmitCar(formData: FormData) {
  const supabase = createClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Handle image uploads
  const imageFiles = formData.getAll('images') as File[];
  const imageUrls = JSON.parse(formData.get('existingImageUrls') as string || '[]') as string[];

  for (const file of imageFiles) {
    if (file.size > 0) {
      const fileName = `${user.id}/${randomUUID()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading to Supabase Storage:', uploadError);
        return { success: false, error: 'Failed to upload image.' };
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName);
        
      if (publicUrlData) {
        imageUrls.push(publicUrlData.publicUrl);
      }
    }
  }

  // Construct car data object from FormData
  const carData: CarFormData = {
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    year: Number(formData.get('year')),
    registrationYear: formData.get('registrationYear') ? Number(formData.get('registrationYear')) : undefined,
    price: Number(formData.get('price')),
    kmRun: Number(formData.get('kmRun')),
    fuel: formData.get('fuel') as 'Petrol' | 'Diesel' | 'Electric',
    transmission: formData.get('transmission') as 'Automatic' | 'Manual',
    ownership: Number(formData.get('ownership')),
    color: formData.get('color') as string,
    additionalDetails: formData.get('additionalDetails') as string | undefined,
    images: imageUrls,
    badges: formData.getAll('badges') as string[],
    instagramReelUrl: formData.get('instagramReelUrl') as string | undefined,
  };
  
  const validatedData = carFormSchema.safeParse(carData);
    if (!validatedData.success) {
        console.error("Validation Errors:", validatedData.error.flatten().fieldErrors);
        return { success: false, error: 'Invalid data provided.', errors: validatedData.error.flatten().fieldErrors };
    }


  const carId = formData.get('carId') as string | null;

  if (carId) {
    // Update existing car
     const result = await updateCar(carId, validatedData.data);
     if (result.success) {
       revalidatePath('/dashboard/employee-a/listings');
       revalidatePath(`/dashboard/edit-listing/${carId}`);
       return { success: true, carId };
     } else {
       return { success: false, error: result.error };
     }
  } else {
    // Create new car
    const { data: newCar, error } = await supabase.from('cars').insert([{
        ...validatedData.data,
        submittedBy: user.id,
        status: 'pending',
    }]).select().single();

    if (error) {
        console.error('Error inserting car:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/dashboard/employee-a/listings');
    revalidatePath('/sell');

    return { success: true, carId: newCar.id };
  }
}
