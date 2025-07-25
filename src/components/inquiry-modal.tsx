
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Car, Inquiry, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';


interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
}

export function InquiryModal({ isOpen, onClose, car }: InquiryModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callPreference, setCallPreference] = useState('now');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    if (user) {
        setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
        toast({
            title: "Validation Error",
            description: "Please fill in both name and phone number.",
            variant: "destructive"
        })
        return;
    }
     if (callPreference === 'schedule' && (!scheduledDate || !scheduledTime)) {
      toast({
        title: 'Validation Error',
        description: 'Please select a date and time for your scheduled call.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find an available sales person (Employee B)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'employee-b'));
      const querySnapshot = await getDocs(q);
      const salesPeople = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

      let assignedTo = 'unassigned';
      if (salesPeople.length > 0) {
        // Simple random assignment for now
        assignedTo = salesPeople[Math.floor(Math.random() * salesPeople.length)].id;
      }
      
      const newInquiry: Omit<Inquiry, 'id'> = {
        carId: car.id,
        carSummary: `${car.brand} ${car.model}`,
        customerName: name,
        customerPhone: phone,
        submittedAt: new Date().toISOString(),
        assignedTo: assignedTo,
        status: 'new' as const,
        remarks: `Call preference: ${callPreference === 'now' ? 'ASAP' : `Scheduled for ${format(scheduledDate!, 'PPP')} at ${scheduledTime}`}`,
        privateNotes: ''
      }
      
      await addDoc(collection(db, 'inquiries'), newInquiry);

      toast({
        title: 'Inquiry Sent!',
        description: "Our team will contact you shortly.",
      });
      onClose();
    } catch (error) {
       console.error("Error submitting inquiry:", error);
       toast({
           title: "Submission Failed",
           description: "Could not submit your inquiry. Please try again.",
           variant: "destructive"
       });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inquire about {car.brand} {car.model}</DialogTitle>
          <DialogDescription>
            Please confirm your details. Our sales team will get in touch with you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. 9876543210"/>
            </div>
             <div className="space-y-2">
              <Label>Preferred Call Time</Label>
              <RadioGroup value={callPreference} onValueChange={setCallPreference} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now">Call me now</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule">Schedule a call</Label>
                </div>
              </RadioGroup>
            </div>
             {callPreference === 'schedule' && (
              <div className="grid grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'justify-start text-left font-normal',
                        !scheduledDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                 <Select onValueChange={setScheduledTime} value={scheduledTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Inquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
