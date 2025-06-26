'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
  Edit,
  Trash2,
  ListFilter,
} from 'lucide-react';
import { cars, users as mockUsers, carBrands as mockCarBrands, carModels as mockCarModels } from '@/lib/data';
import type { User, Role } from '@/lib/types';


const initialPendingCars = cars.filter(car => car.status === 'pending');

const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  role: z.enum(['employee-a', 'employee-b'], { required_error: 'Role is required' }),
});

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pendingCars, setPendingCars] = useState(initialPendingCars);
  
  // User Management State
  const [usersState, setUsersState] = useState<User[]>(mockUsers.filter(u => u.role !== 'admin'));
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteUserAlertOpen, setIsDeleteUserAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filter Management State
  const [brands, setBrands] = useState<string[]>(mockCarBrands);
  const [models, setModels] = useState<{[key: string]: string[]}>(mockCarModels);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingModel, setEditingModel] = useState<{ brand: string; model: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'brand' | 'model', value: any } | null>(null);
  const [brandForModel, setBrandForModel] = useState<string>('');


  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', email: '', password: '', role: 'employee-a' },
  });

  if (!loading && user?.role !== 'admin') {
    router.push('/');
    return null;
  }
  
  // Approval Handlers
  const handleApproval = (carId: string, status: 'approved' | 'rejected') => {
    setPendingCars(prev => prev.filter(car => car.id !== carId));
    toast({
      title: `Listing ${status}`,
      description: `The car listing has been successfully ${status}.`,
    });
  };

  // User Management Handlers
  const openEditUserDialog = (userToEdit: User) => {
    setUserToEdit(userToEdit);
    form.reset({
        id: userToEdit.id,
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role as 'employee-a' | 'employee-b',
    });
    setIsEditUserOpen(true);
  };

  const openDeleteUserAlert = (user: User) => {
    setUserToDelete(user);
    setIsDeleteUserAlertOpen(true);
  }

  const onUserSubmit = (values: z.infer<typeof employeeSchema>) => {
    if (userToEdit) { // Editing existing user
        setUsersState(currentUsers => currentUsers.map(u => 
            u.id === userToEdit.id ? { ...u, name: values.name, email: values.email, role: values.role } : u
        ));
        toast({ title: 'Employee Updated', description: `${values.name}'s details have been updated.` });
        setIsEditUserOpen(false);
        setUserToEdit(null);
    } else { // Adding new user
        const newUser: User = {
            id: `user-emp-${Date.now()}`,
            name: values.name,
            email: values.email,
            password: values.password || 'password', // Default password if not provided
            role: values.role,
        };
        setUsersState(currentUsers => [...currentUsers, newUser]);
        toast({ title: 'Employee Added', description: `${values.name} has been added.` });
        setIsAddUserOpen(false);
    }
    form.reset();
  };

  const deleteUser = () => {
    if (!userToDelete) return;
    setUsersState(currentUsers => currentUsers.filter(u => u.id !== userToDelete.id));
    toast({ title: 'Employee Deleted', description: `${userToDelete.name} has been removed.` });
    setIsDeleteUserAlertOpen(false);
    setUserToDelete(null);
  };

  // Filter Management Handlers
  // ... In a real app, these would be API calls. Here, we manipulate state.
  const handleAddOrEditBrand = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newBrandName = (e.currentTarget.elements.namedItem('brandName') as HTMLInputElement).value.trim();
      if (!newBrandName) return;

      if (editingBrand) { // Edit
          setBrands(brands.map(b => b === editingBrand ? newBrandName : b));
          const oldModels = models[editingBrand] || [];
          const newModels = { ...models };
          delete newModels[editingBrand];
          newModels[newBrandName] = oldModels;
          setModels(newModels);
          toast({ title: 'Brand Updated' });
      } else { // Add
          if (!brands.includes(newBrandName)) {
              setBrands([...brands, newBrandName]);
              toast({ title: 'Brand Added' });
          } else {
              toast({ title: 'Brand Exists', variant: 'destructive' });
          }
      }
      setIsBrandDialogOpen(false);
      setEditingBrand(null);
  }
  
  const handleDeleteItem = () => {
      if (!itemToDelete) return;
      if (itemToDelete.type === 'brand') {
          setBrands(brands.filter(b => b !== itemToDelete.value));
          const newModels = { ...models };
          delete newModels[itemToDelete.value];
          setModels(newModels);
          toast({ title: 'Brand Deleted' });
      } else if (itemToDelete.type === 'model') {
          const { brand, model } = itemToDelete.value;
          setModels({
              ...models,
              [brand]: models[brand].filter(m => m !== model)
          });
          toast({ title: 'Model Deleted' });
      }
      setItemToDelete(null);
  }

  const handleAddOrEditModel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const modelName = (e.currentTarget.elements.namedItem('modelName') as HTMLInputElement).value.trim();
    if (!modelName || !brandForModel) return;

    if (editingModel) { // Edit
        setModels({
            ...models,
            [brandForModel]: models[brandForModel].map(m => m === editingModel.model ? modelName : m)
        });
        toast({ title: 'Model Updated' });
    } else { // Add
        const currentModels = models[brandForModel] || [];
        if (!currentModels.includes(modelName)) {
            setModels({
                ...models,
                [brandForModel]: [...currentModels, modelName]
            });
            toast({ title: 'Model Added' });
        } else {
            toast({ title: 'Model Exists', variant: 'destructive' });
        }
    }
    setIsModelDialogOpen(false);
    setEditingModel(null);
    setBrandForModel('');
  }


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
            <div className="text-2xl font-bold">{usersState.length}</div>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="filters">Filter Management</TabsTrigger>
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
                        <Button onClick={() => { form.reset(); setUserToEdit(null); }}><UserPlus className="mr-2 h-4 w-4" /> Add Employee</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Employee</DialogTitle>
                            <DialogDescription>Fill out the form to create a new employee account.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onUserSubmit)} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@malluvandi.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="employee-a">Content Manager (Employee A)</SelectItem>
                                                <SelectItem value="employee-b">Sales & Support (Employee B)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                                    <Button type="submit">Create Account</Button>
                                </DialogFooter>
                            </form>
                        </Form>
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
                        {usersState.map(u => (
                            <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell><Badge variant={u.role === 'employee-a' ? 'secondary' : 'outline'}>{u.role.replace('employee-a', 'Content Manager').replace('employee-b', 'Sales')}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => openEditUserDialog(u)}><Edit size={16}/></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteUserAlert(u)}><Trash2 size={16}/></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="filters">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                       <div>
                         <CardTitle>Car Brands</CardTitle>
                         <CardDescription>Manage available car brands.</CardDescription>
                       </div>
                       <Button size="sm" onClick={() => { setEditingBrand(null); setIsBrandDialogOpen(true); }}>Add Brand</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Brand Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {brands.map(brand => (
                                    <TableRow key={brand}>
                                        <TableCell>{brand}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingBrand(brand); setIsBrandDialogOpen(true); }}><Edit size={16}/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({ type: 'brand', value: brand })}><Trash2 size={16}/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Car Models</CardTitle>
                            <CardDescription>Manage models for each brand.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => { setEditingModel(null); setBrandForModel(''); setIsModelDialogOpen(true); }} disabled={brands.length === 0}>Add Model</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader><TableRow><TableHead>Model Name</TableHead><TableHead>Brand</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                             <TableBody>
                                {brands.flatMap(brand => 
                                    (models[brand] || []).map(model => (
                                        <TableRow key={`${brand}-${model}`}>
                                            <TableCell>{model}</TableCell>
                                            <TableCell><Badge variant="secondary">{brand}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingModel({ brand, model }); setBrandForModel(brand); setIsModelDialogOpen(true); }}><Edit size={16}/></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({ type: 'model', value: { brand, model } })}><Trash2 size={16}/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                             </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Employee: {userToEdit?.name}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>New Password (optional)</FormLabel><FormControl><Input type="password" placeholder="Leave blank to keep unchanged" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="employee-a">Content Manager (Employee A)</SelectItem>
                                        <SelectItem value="employee-b">Sales & Support (Employee B)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Delete User Alert Dialog */}
        <AlertDialog open={isDeleteUserAlertOpen} onOpenChange={setIsDeleteUserAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the account for {userToDelete?.name}. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Add/Edit Brand Dialog */}
        <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingBrand ? 'Edit' : 'Add'} Brand</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddOrEditBrand}>
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input id="brandName" name="brandName" defaultValue={editingBrand || ''} required className="mt-2"/>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsBrandDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Brand</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Add/Edit Model Dialog */}
        <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingModel ? 'Edit' : 'Add'} Model</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddOrEditModel}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <Label>Brand</Label>
                             <Select onValueChange={setBrandForModel} value={brandForModel} required disabled={!!editingModel}>
                                <SelectTrigger><SelectValue placeholder="Select a brand..." /></SelectTrigger>
                                <SelectContent>
                                    {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modelName">Model Name</Label>
                            <Input id="modelName" name="modelName" defaultValue={editingModel?.model || ''} required />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModelDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Model</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Delete Filter Item Alert */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the {itemToDelete?.type} `{itemToDelete?.type === 'brand' ? itemToDelete?.value : itemToDelete?.value.model}`.
                        {itemToDelete?.type === 'brand' && ' All of its models will be deleted too.'} This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
