

'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2, PlusCircle, Trash, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from './ui/checkbox';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { uploadImagesAndSubmitCar } from '@/app/sell/actions';


const currentYear = new Date().getFullYear();

const carFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1980, 'Year must be after 1980').max(currentYear, `Year cannot be in the future`),
  registrationYear: z.coerce.number().int().min(1980, 'Year must be after 1980').max(currentYear, `Year cannot be in the future`).optional().or(z.literal('')),
  price: z.coerce.number().int().positive('Price must be a positive number'),
  kmRun: z.coerce.number().int().positive('KM driven must be a positive number'),
  fuel: z.enum(['Petrol', 'Diesel', 'Electric'], { required_error: 'Fuel type is required' }),
  transmission: z.enum(['Automatic', 'Manual'], { required_error: 'Transmission is required' }),
  ownership: z.coerce.number().int().min(1, 'Ownership is required'),
  color: z.string().min(1, 'Color is required'),
  additionalDetails: z.string().optional(),
  images: z.array(z.object({ value: z.string().url({ message: "Please enter a valid URL." }) })),
  badges: z.array(z.string()).optional(),
  instagramReelUrl: z.string().url().optional().or(z.literal('')),
});


type CarFormData = z.infer<typeof carFormSchema>;

interface CarFormProps {
  brands: string[];
  models: { [key: string]: string[] };
  initialData?: Car; // For editing
}

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['brand', 'model', 'year', 'registrationYear', 'price'] },
  { id: 'Step 2', name: 'Car Details', fields: ['kmRun', 'fuel', 'transmission', 'ownership', 'color'] },
  { id: 'Step 3', name: 'Media & More', fields: ['images', 'badges', 'instagramReelUrl', 'additionalDetails'] },
  { id: 'Step 4', name: 'Review & Submit' },
]

const badgeOptions = ['new', 'featured', 'price drop'];

export function CarForm({ brands, models, initialData }: CarFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: isEditMode ? {
      ...initialData,
      year: initialData.year || currentYear,
      registrationYear: initialData.registrationYear || undefined,
      price: initialData.price || 0,
      kmRun: initialData.kmRun || 0,
      fuel: initialData.fuel || undefined,
      transmission: initialData.transmission || undefined,
      ownership: initialData.ownership || 1,
      badges: initialData.badges || [],
      images: initialData.images?.map(img => ({ value: img })) || [],
    } : {
      images: [{ value: '' }],
      badges: [],
      year: currentYear,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "images",
    control,
  });

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as any, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step + 1);
    }
  };
  

  const onSubmit = async () => {
    if (!user) {
        toast({ title: 'Not authenticated', description: 'You must be logged in to submit a listing.', variant: 'destructive'});
        return;
    }
    setIsSubmitting(true);
    
    const formData = new FormData();
    const allValues = getValues();
    
    // Append all form values to FormData
    Object.entries(allValues).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        const imageUrls = value.map(img => img.value).filter(Boolean); // Filter out empty strings
        formData.append('images', JSON.stringify(imageUrls));
      } else if (key === 'badges' && Array.isArray(value)) {
        value.forEach(badge => formData.append('badges', badge));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });


    if (isEditMode && initialData.id) {
        formData.append('carId', initialData.id);
    }

    const result = await uploadImagesAndSubmitCar(formData);
    
    if (result.success) {
        toast({ title: isEditMode ? 'Listing Updated!' : 'Listing Submitted!', description: isEditMode ? 'Your car details have been updated.' : 'Your car has been submitted for approval.'});
        router.push(user.role === 'admin' ? '/dashboard/admin/listings' : '/dashboard/employee-a/listings');
        router.refresh();
    } else {
        toast({ title: "Submission Failed", description: result.error, variant: "destructive" });
    }

    setIsSubmitting(false);
  };

  const selectedBrand = watch('brand');

  const availableModels = useMemo(() => {
    if (selectedBrand) {
      return models[selectedBrand] || [];
    }
    return [];
  }, [selectedBrand, models]);


  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Car Listing' : 'Sell Your Car'}</CardTitle>
        <CardDescription>{isEditMode ? 'Update the details of your vehicle.' : 'Fill out the details below to list your vehicle for sale.'}</CardDescription>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <Label>Brand</Label>
                    <Controller name="brand" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                            <SelectContent>{brands.map(brand => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                    {errors.brand && <p className="text-destructive text-xs mt-1">{errors.brand?.message}</p>}
                </div>
                <div>
                    <Label>Model</Label>
                    <Controller name="model" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBrand}>
                            <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
                            <SelectContent>{availableModels.map(model => (<SelectItem key={model} value={model}>{model}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                    {errors.model && <p className="text-destructive text-xs mt-1">{errors.model?.message}</p>}
                </div>
                <div>
                    <Label>Manufacture Year</Label>
                    <Input type="number" {...register('year')} placeholder={`e.g. ${currentYear}`} />
                    {errors.year && <p className="text-destructive text-xs mt-1">{errors.year?.message}</p>}
                </div>
                <div>
                    <Label>Registration Year</Label>
                    <Input type="number" {...register('registrationYear')} placeholder={`e.g. ${currentYear}`} />
                    {errors.registrationYear && <p className="text-destructive text-xs mt-1">{errors.registrationYear?.message}</p>}
                </div>
                <div className="md:col-span-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" {...register('price')} placeholder="e.g. 500000" />
                    {errors.price && <p className="text-destructive text-xs mt-1">{errors.price?.message}</p>}
                </div>
            </div>
          )}

          {currentStep === 1 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>KM Driven</Label>
                    <Input type="number" {...register('kmRun')} placeholder="e.g. 25000" />
                    {errors.kmRun && <p className="text-destructive text-xs mt-1">{errors.kmRun?.message}</p>}
                </div>
                <div>
                    <Label>Fuel Type</Label>
                    <Controller name="fuel" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select Fuel Type" /></SelectTrigger>
                            <SelectContent>{['Petrol', 'Diesel', 'Electric'].map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                    {errors.fuel && <p className="text-destructive text-xs mt-1">{errors.fuel?.message}</p>}
                </div>
                <div>
                    <Label>Transmission</Label>
                    <Controller name="transmission" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select Transmission" /></SelectTrigger>
                            <SelectContent>{['Automatic', 'Manual'].map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                        </Select>
                    )} />
                    {errors.transmission && <p className="text-destructive text-xs mt-1">{errors.transmission?.message}</p>}
                </div>
                <div>
                    <Label>Ownership (No. of owners)</Label>
                    <Input type="number" {...register('ownership')} placeholder="e.g. 1" />
                    {errors.ownership && <p className="text-destructive text-xs mt-1">{errors.ownership?.message}</p>}
                </div>
                <div className="md:col-span-2">
                    <Label>Color</Label>
                    <Input {...register('color')} placeholder="e.g. Red" />
                    {errors.color && <p className="text-destructive text-xs mt-1">{errors.color?.message}</p>}
                </div>
            </div>
          )}

           {currentStep === 2 && (
             <div className="grid grid-cols-1 gap-6">
                <div>
                    <Label>Car Image URLs</Label>
                    <div className="space-y-2 mt-2">
                       {fields.map((field, index) => (
                           <div key={field.id} className="flex items-center gap-2">
                               <Input
                                   {...register(`images.${index}.value`)}
                                   placeholder="https://example.com/image.png"
                               />
                               <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                   <Trash className="h-4 w-4" />
                               </Button>
                           </div>
                       ))}
                       {errors.images?.root && <p className="text-destructive text-xs mt-1">{errors.images.root.message}</p>}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ value: "" })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Image URL
                    </Button>
                </div>
                <div>
                    <Label>Badges (Optional)</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                        {badgeOptions.map(badge => (
                            <Controller key={badge} name="badges" control={control} render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`badge-${badge}`}
                                    checked={field.value?.includes(badge)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), badge])
                                            : field.onChange(field.value?.filter(v => v !== badge))
                                    }}
                                />
                                <label htmlFor={`badge-${badge}`} className="capitalize text-sm font-medium">{badge}</label>
                                </div>
                            )} />
                        ))}
                    </div>
                </div>
                <div><Label>Instagram Reel URL (Optional)</Label><Input {...register('instagramReelUrl')} placeholder="https://instagram.com/reel/..."/></div>
                <div><Label>Additional Details (Optional)</Label><Textarea {...register('additionalDetails')} rows={4} placeholder="Mention details about sound system, sun roof, modifications, insurance, challans, etc." /></div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Listing</h3>
              <div className="space-y-4">
                {Object.entries(getValues()).map(([key, value]) => {
                    const formattedKey = key.replace(/([A-Z])/g, ' $1');
                    let displayValue = null;
                    if (key === 'images' && Array.isArray(value) && value.length > 0) {
                        const urls = value.map(v => v.value).filter(Boolean);
                        if (urls.length === 0) return null;
                        displayValue = <div className="flex gap-2 flex-wrap justify-end max-w-xs">{urls.map((url, i) => <Image key={i} src={url} alt="preview" width={50} height={50} className="rounded" />)}</div>
                    } else if (Array.isArray(value)) {
                         displayValue = value.length > 0 ? <span className="text-muted-foreground text-sm text-right max-w-xs truncate">{value.join(', ')}</span> : null;
                    } else if (value) {
                         displayValue = <span className="text-muted-foreground text-sm text-right max-w-xs truncate">{String(value)}</span>
                    }

                    if (!displayValue) return null;

                    return (
                        <div key={key} className="flex justify-between items-start capitalize border-b pb-2">
                            <span className="font-medium text-sm">{formattedKey}:</span>
                            {displayValue}
                        </div>
                    )
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting}>
                <ArrowLeft className="mr-2"/>Previous
            </Button>

            {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                    Next<ArrowRight className="ml-2"/>
                </Button>
            ) : (
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                    {isEditMode ? 'Update Listing' : 'Submit for Approval'}
                </Button>
            )}
        </CardFooter>
      </form>
    </Card>
  );
}
