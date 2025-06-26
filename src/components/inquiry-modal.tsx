'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Car } from '@/lib/types';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
}

export function InquiryModal({ isOpen, onClose, car }: InquiryModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
        toast({
            title: "Validation Error",
            description: "Please fill in both name and phone number.",
            variant: "destructive"
        })
        return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Inquiry submitted:', { carId: car.id, name, phone });
      toast({
        title: 'Inquiry Sent!',
        description: "Our team will contact you shortly.",
      });
      setIsSubmitting(false);
      onClose();
      setName('');
      setPhone('');
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inquire about {car.brand} {car.model}</DialogTitle>
          <DialogDescription>
            Please provide your details. Our sales team will get in touch with you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
