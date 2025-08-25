
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Inquiry } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { updateInquiry } from '@/app/dashboard/admin/inquiries/actions';


interface CloseInquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry;
}

export function CloseInquiryDialog({ isOpen, onClose, inquiry }: CloseInquiryDialogProps) {
  const { toast } = useToast();
  const [remarks, setRemarks] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [isSeriousCustomer, setIsSeriousCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks) {
        toast({ title: "Closure Report is required.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    
    const updates = {
      status: 'closed' as const,
      remarks,
      privateNotes,
      isSeriousCustomer,
    };

    const { success, error } = await updateInquiry(inquiry.id, updates);
    
    if (success) {
      toast({ title: "Inquiry Closed", description: "The inquiry has been successfully marked as closed." });
      onClose();
    } else {
      toast({ title: "Error", description: error, variant: "destructive" });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Inquiry: {inquiry.customerName}</DialogTitle>
          <DialogDescription>
            Please provide a closure report for this inquiry. This will be visible to the admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Closure Report (Visible to Admin)</Label>
              <Textarea 
                id="remarks" 
                value={remarks} 
                onChange={e => setRemarks(e.target.value)} 
                required 
                placeholder="e.g., Customer purchased the vehicle, Found a better deal elsewhere, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privateNotes">Private Notes (Your eyes only)</Label>
              <Textarea 
                id="privateNotes" 
                value={privateNotes} 
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Add any personal notes or reminders here..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isSerious" 
                checked={isSeriousCustomer}
                onCheckedChange={(checked) => setIsSeriousCustomer(!!checked)}
              />
              <Label htmlFor="isSerious">Mark as Serious Customer?</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report & Close
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
