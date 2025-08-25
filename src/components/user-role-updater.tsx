
'use client';

import React, { useState, useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { updateUserRole } from '@/app/dashboard/admin/users/actions';
import { useToast } from './ui/use-toast';

interface UserRoleUpdaterProps {
  userId: string;
  currentRole: string;
}

export function UserRoleUpdater({ userId, currentRole }: UserRoleUpdaterProps) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    startTransition(async () => {
      const { success, error } = await updateUserRole(userId, newRole);
      if (success) {
        toast({ title: 'Success', description: "User role updated successfully." });
      } else {
        toast({ title: 'Error', description: error || 'Failed to update role.', variant: 'destructive' });
        setRole(currentRole); // Revert on failure
      }
    });
  };

  const roles = ['admin', 'manager', 'employee-a', 'employee-b', 'customer'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <Edit className="h-4 w-4 mr-2" />
          {isPending ? 'Updating...' : 'Edit Role'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={role} onValueChange={handleRoleChange}>
          {roles.map((r) => (
            <DropdownMenuRadioItem key={r} value={r} className="capitalize">
              {r}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
