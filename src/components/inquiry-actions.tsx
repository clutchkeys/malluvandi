
'use client';

import React, { useState, useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { assignInquiry, deleteInquiry } from '@/app/dashboard/admin/inquiries/actions';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

interface InquiryActionsProps {
  inquiryId: string;
  salesStaff: User[];
  currentAssigneeId: string | null;
}

export function InquiryActions({ inquiryId, salesStaff, currentAssigneeId }: InquiryActionsProps) {
  const [assignedTo, setAssignedTo] = useState(currentAssigneeId);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAssignmentChange = (employeeId: string) => {
    startTransition(async () => {
      // Don't do anything if the assignment hasn't changed
      if (employeeId === assignedTo) return;
      
      const { success, error } = await assignInquiry(inquiryId, employeeId);
      if (success) {
        setAssignedTo(employeeId);
        toast({ title: 'Success', description: "Inquiry assigned successfully." });
      } else {
        toast({ title: 'Error', description: error || 'Failed to assign inquiry.', variant: 'destructive' });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const { success, error } = await deleteInquiry(inquiryId);
      if (success) {
        toast({ title: 'Inquiry Deleted' });
      } else {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      }
    });
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Assign to...</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={assignedTo || ''} onValueChange={handleAssignmentChange}>
            {salesStaff.map((staff) => (
              <DropdownMenuRadioItem key={staff.id} value={staff.id}>
                {staff.name}
              </DropdownMenuRadioItem>
            ))}
            {salesStaff.length === 0 && <DropdownMenuItem disabled>No sales staff found</DropdownMenuItem>}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this inquiry record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
