
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
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, User, UserPlus } from 'lucide-react';
import { assignInquiry } from '@/app/dashboard/admin/inquiries/actions';
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
      const { success, error } = await assignInquiry(inquiryId, employeeId);
      if (success) {
        setAssignedTo(employeeId);
        toast({ title: 'Success', description: "Inquiry assigned successfully." });
      } else {
        toast({ title: 'Error', description: error || 'Failed to assign inquiry.', variant: 'destructive' });
      }
    });
  };

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
