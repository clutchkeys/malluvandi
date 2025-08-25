
'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { updateCarStatus } from '@/app/dashboard/admin/listings/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface ListingActionsProps {
  carId: string;
}

export function ListingActions({ carId }: ListingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const { success, error } = await updateCarStatus(carId, status);
      if (success) {
        toast({ title: `Listing ${status}`, description: `The car has been successfully ${status}.` });
      } else {
        toast({ title: 'Error', description: error || `Failed to ${status} listing.`, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50" disabled={isPending}>
            <XCircle className="h-4 w-4 mr-2" /> Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reject this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The listing will be marked as rejected and will not be visible to customers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction('rejected')} className="bg-destructive hover:bg-destructive/90">
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-600 hover:bg-green-500/10 border-green-600/50" disabled={isPending}>
            <CheckCircle className="h-4 w-4 mr-2" /> Approve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to approve this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the car listing visible to all customers on the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction('approved')} className="bg-green-600 hover:bg-green-700">
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
