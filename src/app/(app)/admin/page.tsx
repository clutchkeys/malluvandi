'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Users,
  Car,
  DollarSign,
  Activity,
  UserPlus,
} from 'lucide-react';
import { cars, users as mockUsers } from '@/lib/data';
import Image from 'next/image';

const initialPendingCars = cars.filter(car => car.status === 'pending');
const allUsers = mockUsers.filter(u => u.role !== 'admin');

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pendingCars, setPendingCars] = useState(initialPendingCars);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  if (!loading && user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  const handleApproval = (carId: string, status: 'approved' | 'rejected') => {
    setPendingCars(prev => prev.filter(car => car.id !== carId));
    toast({
      title: `Listing ${status}`,
      description: `The car listing has been successfully ${status}.`,
    });
  };

  const handleAddEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you'd handle form data and API calls here.
    toast({
      title: 'Employee Added',
      description: 'The new employee account has been created.',
    });
    setIsAddUserOpen(false);
  };
  
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,23,189</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCars.length}</div>
            <p className="text-xs text-muted-foreground">Cars awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">Employee A & B</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">New inquiries this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals">
        <TabsList>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Car Listings for Approval</CardTitle>
              <CardDescription>Review and approve or reject new car listings submitted by employees.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCars.map(car => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-4">
                           <Image src={car.images[0]} alt={car.model} width={64} height={48} className="rounded-md object-cover" data-ai-hint="car exterior"/>
                           <div>
                                {car.brand} {car.model} ({car.year})
                                <div className="text-xs text-muted-foreground">{car.color}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>{mockUsers.find(u => u.id === car.submittedBy)?.name || 'Unknown'}</TableCell>
                      <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={() => handleApproval(car.id, 'approved')}>
                          <CheckCircle2 size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleApproval(car.id, 'rejected')}>
                          <XCircle size={20} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingCars.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">No pending approvals.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>Add, edit, or remove employee accounts.</CardDescription>
              </div>
               <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button><UserPlus className="mr-2 h-4 w-4" /> Add Employee</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>Fill out the form to create a new employee account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddEmployee}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="john@malluvandi.com" required />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Account</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
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
                  {allUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge variant={u.role === 'employee-a' ? 'secondary' : 'outline'}>{u.role.replace('-', ' ')}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Edit clicked', description: 'This feature is not yet implemented.'})}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
