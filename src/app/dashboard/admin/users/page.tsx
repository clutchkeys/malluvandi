
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserRoleUpdater } from '@/components/user-role-updater';
import type { User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { deleteUser, updateUser } from './actions';
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminUsersPage() {
    const [staff, setStaff] = useState<User[]>([]);
    const [customers, setCustomers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editedName, setEditedName] = useState('');

    const supabase = createClient();
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data: users, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            setStaff([]);
            setCustomers([]);
        } else {
            const allUsers = users as User[];
            setStaff(allUsers.filter(u => u.role !== 'customer'));
            setCustomers(allUsers.filter(u => u.role === 'customer'));
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    useEffect(() => {
        if(editingUser) {
            setEditedName(editingUser.name);
            setIsModalOpen(true);
        }
    }, [editingUser]);
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setEditedName('');
    }

    const getRoleVariant = (role: string) => {
        switch (role) {
        case 'admin':
        case 'manager':
            return 'default';
        case 'employee-a':
        case 'employee-b':
            return 'secondary';
        case 'customer':
            return 'outline';
        default:
            return 'outline';
        }
    };

    const handleDeleteUser = (userId: string) => {
        startTransition(async () => {
            const result = await deleteUser(userId);
            if(result.success) {
                toast({ title: "User profile deleted." });
                fetchUsers();
            } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
            }
        });
    }
    
    const handleUpdateUser = () => {
        if(!editingUser || !editedName) return;

        startTransition(async () => {
             const result = await updateUser(editingUser.id, { name: editedName });
             if(result.success) {
                toast({ title: "User updated successfully" });
                fetchUsers();
                handleModalClose();
             } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
             }
        });
    }
    
    const renderUserTable = (users: User[], title: string) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : users.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No {title.toLowerCase()} found.</TableCell>
                    </TableRow>
                ) : (
                    users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={getRoleVariant(user.role)} className="capitalize">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                                <UserRoleUpdater userId={user.id} currentRole={user.role} />
                                <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                           <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will delete the user's profile and they may lose access. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
    
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all staff and customer accounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="staff">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>
                <TabsContent value="staff">
                    {renderUserTable(staff, "Staff")}
                </TabsContent>
                <TabsContent value="customers">
                    {renderUserTable(customers, "Customers")}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
       <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">User Name</Label>
                        <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} required />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleModalClose}>Cancel</Button>
                    <Button onClick={handleUpdateUser} disabled={isPending}>
                       {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                       Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
