
'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { updateCarStatus, deleteCar } from '@/app/dashboard/admin/listings/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from 'lucide-react';


interface ListingActionsProps {
  carId: string;
  currentStatus: 'pending' | 'approved' | 'rejected';
}

export function ListingActions({ carId, currentStatus }: ListingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const { success, error } = await updateCarStatus(carId, status);
      if (success) {
        toast({ title: `Listing ${status}`, description: `The car has been successfully ${status}.` });
      } else {
        toast({ title: 'Error', description: error || `Failed to ${status} listing.`, variant: 'destructive' });
      }
    });
  };
  
  const handleDelete = () => {
     startTransition(async () => {
      const { success, error } = await deleteCar(carId);
      if (success) {
        toast({ title: 'Listing Deleted', description: 'The listing has been permanently deleted.' });
      } else {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      }
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isPending}>
                { isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" /> }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentStatus === 'pending' && (
                <>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-green-600 focus:text-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogTrigger asChild>
                     <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => router.push(`/dashboard/edit-listing/${carId}`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

            {/* This feels complex, maybe there's a better way to handle multiple triggers */}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                    <AlertDialogDescription>
                       Are you sure you want to proceed? This action may not be reversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {/* These actions are generic, which isn't ideal. Let's create specific dialogs for each action. */}
                    {/* For now, this is a simplified example */}
                    <AlertDialogAction onClick={() => handleStatusUpdate('approved')} className="bg-green-600 hover:bg-green-700">Approve</AlertDialogAction>
                    <AlertDialogAction onClick={() => handleStatusUpdate('rejected')} className="bg-destructive hover:bg-destructive/90">Reject</AlertDialogAction>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete permanently</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

// A better implementation would be to separate the dialogs
export function BetterListingActions({ carId, currentStatus }: ListingActionsProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleAction = (action: 'approve' | 'reject' | 'delete') => {
        startTransition(async () => {
            let result;
            if (action === 'approve') result = await updateCarStatus(carId, 'approved');
            else if (action === 'reject') result = await updateCarStatus(carId, 'rejected');
            else if (action === 'delete') result = await deleteCar(carId);

            if (result?.success) {
                 toast({ title: `Success`, description: `The listing has been successfully ${action}d.` });
            } else {
                 toast({ title: 'Error', description: result?.error || `Failed to ${action} listing.`, variant: 'destructive' });
            }
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {currentStatus === 'pending' && (
                    <>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-green-600 focus:text-green-700">
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Approve this listing?</AlertDialogTitle><AlertDialogDescription>This will make it visible to all customers.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('approve')} className="bg-green-600 hover:bg-green-700">Confirm</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Reject this listing?</AlertDialogTitle><AlertDialogDescription>It will not be visible to customers.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('reject')} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <DropdownMenuSeparator />
                    </>
                )}
                 <DropdownMenuItem onClick={() => router.push(`/dashboard/edit-listing/${carId}`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete this listing forever?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('delete')} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Due to complexity in the above, we'll use a simpler version without the dropdown for approve/reject on the admin page.
// The Employee page will get the dropdown with Edit/Delete.
// The Admin page will get direct buttons for approve/reject, and a dropdown for Edit/Delete.

// Final simplified component:
export function FinalListingActions({ carId, currentStatus }: ListingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const { success, error } = await updateCarStatus(carId, status);
      if (success) {
        toast({ title: `Listing ${status}`, description: `The car has been successfully ${status}.` });
      } else {
        toast({ title: 'Error', description: error || `Failed to ${status} listing.`, variant: 'destructive' });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const { success, error } = await deleteCar(carId);
      if (success) {
        toast({ title: 'Listing Deleted', description: 'The listing has been permanently deleted.' });
      } else {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      }
    });
  }

  if (currentStatus === 'pending') {
    return (
      <div className="flex items-center gap-2 justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50" disabled={isPending}>
              <XCircle className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Reject this listing?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate('rejected')} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-600 hover:bg-green-500/10 border-green-600/50" disabled={isPending}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Approve this listing?</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate('approved')} className="bg-green-600 hover:bg-green-700">Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
     <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/edit-listing/${carId}`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete this listing forever?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}
