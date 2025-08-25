
'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2, UploadCloud, X, PlusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from './ui/checkbox';
import Image from 'next/image';

const currentYear = new Date().getFullYear();

const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1980).max(currentYear),
  price: z.number().int().positive(),
  kmRun: z.number().int().positive(),
  fuel: z.enum(['Petrol', 'Diesel', 'Electric']),
  transmission: z.enum(['Automatic', 'Manual']),
  ownership: z.number().int().min(1),
  color: z.string().min(1, 'Color is required'),
  engineCC: z.number().int().positive(),
  insurance: z.string().optional(),
  challans: z.string().optional(),
  additionalDetails: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  badges: z.array(z.string()).optional(),
  instagramReelUrl: z.string().url().optional().or(z.literal('')),
});

type CarFormData = z.infer<typeof carSchema>;
interface SellCarFormProps {
  brands: string[];
  models: { [key: string]: string[] };
}

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['brand', 'model', 'year', 'price'] },
  { id: 'Step 2', name: 'Car Details', fields: ['kmRun', 'fuel', 'transmission', 'ownership', 'color', 'engineCC'] },
  { id: 'Step 3', name: 'Media & More', fields: ['images', 'badges', 'instagramReelUrl', 'additionalDetails'] },
  { id: 'Step 4', name: 'Review & Submit' },
]

const badgeOptions = ['new', 'featured', 'price drop'];

export function SellCarForm({ brands, models }: SellCarFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      images: [],
      badges: [],
      year: currentYear,
    },
  });

  const selectedBrand = watch('brand');

  const availableModels = useMemo(() => {
    if (selectedBrand) {
      return models[selectedBrand] || [];
    }
    return [];
  }, [selectedBrand, models]);

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as (keyof CarFormData)[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === 2) {
        await handleImageUpload();
      }
      setCurrentStep(step => step + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
    }
  }
  
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    const currentImageUrls = watch('images');
    setValue('images', currentImageUrls.filter((_, i) => i !== index));
  }

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    setIsUploading(true);
    
    const uploadPromises = imageFiles.map(file => {
        const fileName = `${user!.id}/${Date.now()}-${file.name}`;
        return supabase.storage.from('car-images').upload(fileName, file);
    });

    try {
        const results = await Promise.all(uploadPromises);
        const urls: string[] = [];
        for (const result of results) {
            if (result.error) throw result.error;
            const { data } = supabase.storage.from('car-images').getPublicUrl(result.data.path);
            urls.push(data.publicUrl);
        }
        setValue('images', urls);
    } catch (error: any) {
        toast({ title: "Image Upload Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (data: CarFormData) => {
    if (!user) {
        toast({ title: 'Not authenticated', description: 'You must be logged in to submit a listing.', variant: 'destructive'});
        return;
    }
    setIsSubmitting(true);
    try {
        const { error } = await supabase.from('cars').insert([{
            ...data,
            submittedBy: user.id,
            status: 'pending',
        }]);

        if (error) throw error;
        
        toast({ title: 'Listing Submitted!', description: 'Your car has been submitted for approval.'});
        router.push('/dashboard/employee-a/listings');

    } catch (error: any) {
        toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Sell Your Car</CardTitle>
        <CardDescription>Fill out the details below to list your vehicle for sale.</CardDescription>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label>Brand</Label><Controller name="brand" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger><SelectContent>{brands.map(brand => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}</SelectContent></Select>)} /><p className="text-destructive text-xs mt-1">{errors.brand?.message}</p></div>
                <div><Label>Model</Label><Controller name="model" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBrand}><SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger><SelectContent>{availableModels.map(model => (<SelectItem key={model} value={model}>{model}</SelectItem>))}</SelectContent></Select>)} /><p className="text-destructive text-xs mt-1">{errors.model?.message}</p></div>
                <div><Label>Year</Label><Input type="number" {...register('year', { valueAsNumber: true })} /> <p className="text-destructive text-xs mt-1">{errors.year?.message}</p></div>
                <div><Label>Price (₹)</Label><Input type="number" {...register('price', { valueAsNumber: true })} /><p className="text-destructive text-xs mt-1">{errors.price?.message}</p></div>
            </div>
          )}

          {currentStep === 1 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label>KM Run</Label><Input type="number" {...register('kmRun', { valueAsNumber: true })} /><p className="text-destructive text-xs mt-1">{errors.kmRun?.message}</p></div>
                <div><Label>Fuel</Label><Controller name="fuel" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Fuel Type" /></SelectTrigger><SelectContent>{['Petrol', 'Diesel', 'Electric'].map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent></Select>)} /><p className="text-destructive text-xs mt-1">{errors.fuel?.message}</p></div>
                <div><Label>Transmission</Label><Controller name="transmission" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Transmission" /></SelectTrigger><SelectContent>{['Automatic', 'Manual'].map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select>)} /><p className="text-destructive text-xs mt-1">{errors.transmission?.message}</p></div>
                <div><Label>Ownership (No. of owners)</Label><Input type="number" {...register('ownership', { valueAsNumber: true })} /><p className="text-destructive text-xs mt-1">{errors.ownership?.message}</p></div>
                <div><Label>Color</Label><Input {...register('color')} /><p className="text-destructive text-xs mt-1">{errors.color?.message}</p></div>
                <div><Label>Engine (CC)</Label><Input type="number" {...register('engineCC', { valueAsNumber: true })} /><p className="text-destructive text-xs mt-1">{errors.engineCC?.message}</p></div>
            </div>
          )}

           {currentStep === 2 && (
             <div className="grid grid-cols-1 gap-6">
                <div>
                    <Label>Car Images</Label>
                    <div className="mt-2 p-6 border-2 border-dashed rounded-lg text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-muted-foreground">Drag and drop, or click to upload</p>
                        <Input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageFileChange} className="sr-only"/>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('image-upload')?.click()}>Select Files</Button>
                    </div>
                     <p className="text-destructive text-xs mt-1">{errors.images?.message}</p>
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {imageFiles.map((file, index) => (
                           <div key={index} className="relative group">
                                <Image src={URL.createObjectURL(file)} alt={`upload-preview-${index}`} width={128} height={128} className="rounded-md object-cover w-full aspect-square" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                           </div>
                        ))}
                         {isUploading && <div className="flex items-center justify-center aspect-square border rounded-md"><Loader2 className="animate-spin"/></div>}
                    </div>
                </div>
                <div>
                    <Label>Badges</Label>
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
                <div><Label>Instagram Reel URL</Label><Input {...register('instagramReelUrl')} placeholder="https://instagram.com/reel/..."/></div>
                <div><Label>Additional Details</Label><Textarea {...register('additionalDetails')} rows={4} placeholder="Any extra information about the car..." /></div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Listing</h3>
              <div className="space-y-4">
                {Object.entries(watch()).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                        <div key={key} className="flex justify-between items-start capitalize">
                        <span className="font-medium text-sm">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        {key === 'images' ? 
                            <div className="flex gap-2 flex-wrap justify-end max-w-xs">{value.map((img:string, i:number) => <Image key={i} src={img} alt="preview" width={50} height={50} className="rounded" />)}</div> :
                            <span className="text-muted-foreground text-sm text-right">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                        }
                        </div>
                    )
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
            {currentStep > 0 && <Button type="button" variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2"/>Previous</Button>}
            {currentStep < steps.length - 1 && <Button type="button" onClick={handleNext}>Next<ArrowRight className="ml-2"/></Button>}
            {currentStep === steps.length - 1 && <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin mr-2"/>}Submit for Approval</Button>}
        </CardFooter>
      </form>
    </Card>
  );
}
