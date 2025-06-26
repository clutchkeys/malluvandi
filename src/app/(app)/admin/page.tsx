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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Users,
  Car,
  FileText,
  MessageSquare,
  UserPlus,
  Edit,
  Trash2,
  PlusCircle,
  TrendingDown,
  Sparkles,
  Star,
  Settings2,
} from 'lucide-react';
import { cars as mockCars, users as mockUsers, inquiries as mockInquiries, carBrands as mockCarBrands, carModels as mockCarModels, carYears as mockCarYears, carBadges } from '@/lib/data';
import type { User, Role, Car as CarType, Inquiry, CarBadge } from '@/lib/types';


const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  role: z.enum(['admin', 'employee-a', 'employee-b'], { required_error: 'Role is required' }),
});

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('approvals');
  
  // Data states
  const [carsState, setCarsState] = useState<CarType[]>(mockCars);
  const [usersState, setUsersState] = useState<User[]>(mockUsers.filter(u => u.role !== 'customer'));
  const [inquiriesState, setInquiriesState] = useState<Inquiry[]>(mockInquiries);
  const [brandsState, setBrandsState] = useState<string[]>(mockCarBrands);
  const [modelsState, setModelsState] = useState<{[key: string]: string[]}>(mockCarModels);
  const [yearsState, setYearsState] = useState<number[]>(mockCarYears);
  
  // Generic Dialog/Alert states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);
  const [isFilterFormOpen, setIsFilterFormOpen] = useState<{type: 'brand' | 'model' | 'year', isOpen: boolean}>({type: 'brand', isOpen: false});
  const [isReassignInquiryOpen, setIsReassignInquiryOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, value: any, description: string } | null>(null);

  // States for editing specific items
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [carToEdit, setCarToEdit] = useState<CarType | null>(null);
  const [filterToEdit, setFilterToEdit] = useState<{type: string, value: any} | null>(null);
  const [inquiryToReassign, setInquiryToReassign] = useState<Inquiry | null>(null);
  
  // Misc states
  const [selectedBrandForModel, setSelectedBrandForModel] = useState('');

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'employee-a' },
  });

  if (!loading && user?.role !== 'admin') {
    router.push('/');
    return null;
  }
  
  const pendingCars = useMemo(() => carsState.filter(car => car.status === 'pending'), [carsState]);
  const salesEmployees = useMemo(() => usersState.filter(u => u.role === 'employee-b'), [usersState]);

  // Approval Handlers
  const handleApproval = (carId: string, status: 'approved' | 'rejected') => {
    setCarsState(prev => prev.map(car => car.id === carId ? {...car, status} : car));
    toast({
      title: `Listing ${status}`,
      description: `The car listing has been successfully ${status}.`,
    });
  };

  // --- User Management ---
  const handleOpenUserForm = (user: User | null) => {
    setUserToEdit(user);
    form.reset(user ? { ...user, password: '' } : { name: '', email: '', password: '', role: 'employee-a' });
    setIsUserFormOpen(true);
  }
  
  const onUserSubmit = (values: z.infer<typeof userSchema>) => {
    if (userToEdit) { // Editing
        setUsersState(currentUsers => currentUsers.map(u => 
            u.id === userToEdit.id ? { ...u, name: values.name, email: values.email, role: values.role as Role } : u
        ));
        toast({ title: 'User Updated' });
    } else { // Adding
        const rolePrefix = values.role === 'admin' ? 'admin' : 'emp';
        const newUser: User = {
            id: `user-${rolePrefix}-${Date.now()}`,
            name: values.name,
            email: values.email,
            password: values.password || 'password',
            role: values.role as Role,
        };
        setUsersState(currentUsers => [...currentUsers, newUser]);
        toast({ title: 'User Added' });
    }
    setIsUserFormOpen(false);
  };
  
  // --- Car Management ---
  const handleOpenCarForm = (car: CarType | null) => {
    setCarToEdit(car);
    setIsCarFormOpen(true);
  }

  const onCarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;
    
    const selectedBadges = carBadges.filter(badge => formData.has(badge));

    const carData = {
        brand: formValues.brand,
        model: formValues.model,
        year: parseInt(formValues.year),
        price: parseInt(formValues.price),
        kmRun: parseInt(formValues.kmRun),
        color: formValues.color,
        ownership: parseInt(formValues.ownership),
        insurance: formValues.insurance,
        challans: formValues.challans,
        additionalDetails: formValues.details,
        status: formValues.status,
        badges: selectedBadges,
        submittedBy: carToEdit?.submittedBy || user!.id,
    };
    
    if (carToEdit) {
      setCarsState(carsState.map(c => c.id === carToEdit.id ? { ...c, ...carData } : c));
      toast({ title: 'Car Updated' });
    } else {
      const newCar: CarType = {
        id: `car-${Date.now()}`,
        ...carData,
        images: ['https://placehold.co/600x400.png'],
      };
      setCarsState([...carsState, newCar]);
      toast({ title: 'Car Added' });
    }
    setIsCarFormOpen(false);
  }

  // --- Inquiry Management ---
  const handleReassignInquiry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newAssigneeId = new FormData(e.currentTarget).get('assignee') as string;
    if (inquiryToReassign && newAssigneeId) {
      setInquiriesState(inquiriesState.map(inq => 
        inq.id === inquiryToReassign.id ? { ...inq, assignedTo: newAssigneeId } : inq
      ));
      toast({ title: "Inquiry Reassigned" });
    }
    setIsReassignInquiryOpen(false);
  }

  // --- Filter Management ---
  const handleOpenFilterForm = (type: 'brand' | 'model' | 'year', value: any | null) => {
    setFilterToEdit(value ? { type, value } : null);
    if(type === 'model' && value) setSelectedBrandForModel(value.brand);
    setIsFilterFormOpen({ type, isOpen: true });
  }

  const onFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = isFilterFormOpen.type;

    if (type === 'brand') {
      const brandName = formData.get('name') as string;
      if (filterToEdit) {
        setBrandsState(brandsState.map(b => b === filterToEdit.value ? brandName : b));
        const oldModels = modelsState[filterToEdit.value] || [];
        const newModels = { ...modelsState };
        delete newModels[filterToEdit.value];
        newModels[brandName] = oldModels;
        setModelsState(newModels);
      } else {
        setBrandsState([...brandsState, brandName]);
      }
    } else if (type === 'model') {
      const modelName = formData.get('name') as string;
      const brand = formData.get('brand') as string;
      if (filterToEdit) {
        setModelsState({ ...modelsState, [brand]: modelsState[brand].map(m => m === (filterToEdit.value as any).model ? modelName : m) });
      } else {
        setModelsState({ ...modelsState, [brand]: [...(modelsState[brand] || []), modelName] });
      }
    } else if (type === 'year') {
      const year = parseInt(formData.get('name') as string);
      if (filterToEdit) {
        setYearsState(yearsState.map(y => y === filterToEdit.value ? year : y));
      } else {
        setYearsState([...yearsState, year].sort((a,b) => b-a));
      }
    }
    
    toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Saved`});
    setIsFilterFormOpen({ type: 'brand', isOpen: false });
  }

  // --- Generic Delete Handler ---
  const handleDelete = () => {
    if (!itemToDelete) return;
    const { type, value } = itemToDelete;
    
    if (type === 'user') setUsersState(usersState.filter(u => u.id !== value.id));
    if (type === 'car') setCarsState(carsState.filter(c => c.id !== value.id));
    if (type === 'brand') {
      setBrandsState(brandsState.filter(b => b !== value));
      const newModels = { ...modelsState };
      delete newModels[value];
      setModelsState(newModels);
    }
    if (type === 'model') setModelsState({ ...modelsState, [value.brand]: modelsState[value.brand].filter(m => m !== value.model) });
    if (type === 'year') setYearsState(yearsState.filter(y => y !== value));

    toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Deleted` });
    setItemToDelete(null);
  }

  const roleDisplay: Record<Exclude<Role, 'customer'>, { name: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined }> = {
    admin: { name: 'Admin', variant: 'destructive' },
    'employee-a': { name: 'Content Manager', variant: 'secondary' },
    'employee-b': { name: 'Sales', variant: 'outline' },
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => setActiveTab('listings')} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Listings</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{carsState.length}</div></CardContent>
        </Card>
        <Card onClick={() => setActiveTab('approvals')} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><Car className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingCars.length}</div></CardContent>
        </Card>
        <Card onClick={() => setActiveTab('inquiries')} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Inquiries</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{inquiriesState.length}</div></CardContent>
        </Card>
        <Card onClick={() => setActiveTab('users')} className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{usersState.length}</div></CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="listings">Car Listings</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="filters">Filter Management</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader><CardTitle>Car Listings for Approval</CardTitle><CardDescription>Review and approve or reject new car listings.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Car</TableHead><TableHead>Submitted By</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pendingCars.map(car => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium"><div className="flex items-center gap-4"><Image src={car.images[0]} alt={car.model} width={64} height={48} className="rounded-md object-cover" data-ai-hint="car exterior"/><div>{car.brand} {car.model} ({car.year})<div className="text-xs text-muted-foreground">{car.color}</div></div></div></TableCell>
                      <TableCell>{mockUsers.find(u => u.id === car.submittedBy)?.name || 'Unknown'}</TableCell>
                      <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={() => handleApproval(car.id, 'approved')}><CheckCircle2 size={20} /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleApproval(car.id, 'rejected')}><XCircle size={20} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingCars.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No pending approvals.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="listings">
          <Card>
            <CardHeader className="flex-row justify-between items-center"><CardTitle>All Car Listings</CardTitle><Button onClick={() => handleOpenCarForm(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add Car</Button></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Car</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Badges</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {carsState.map(car => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.brand} {car.model}</TableCell>
                      <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell><Badge variant={car.status === 'approved' ? 'default' : car.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{car.status}</Badge></TableCell>
                      <TableCell><div className="flex gap-1">{car.badges?.map(b => <Badge key={b} variant="outline" className="text-xs capitalize">{b.replace('_', ' ')}</Badge>)}</div></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenCarForm(car)}><Edit size={16}/></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'car', value: car, description: `This will permanently delete the listing for ${car.brand} ${car.model}.`})}><Trash2 size={16}/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader><CardTitle>Customer Inquiries</CardTitle><CardDescription>Track and manage all customer inquiries.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Car</TableHead><TableHead>Assigned To</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {inquiriesState.map(inq => {
                    const car = carsState.find(c => c.id === inq.carId);
                    const assignee = usersState.find(u => u.id === inq.assignedTo);
                    return (
                      <TableRow key={inq.id}>
                        <TableCell>{inq.customerName}</TableCell>
                        <TableCell>{car ? `${car.brand} ${car.model}` : 'N/A'}</TableCell>
                        <TableCell>{assignee?.name || 'Unassigned'}</TableCell>
                        <TableCell><Badge variant={inq.status === 'new' ? 'default' : 'secondary'} className="capitalize">{inq.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{inq.remarks}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => { setInquiryToReassign(inq); setIsReassignInquiryOpen(true);}}>Re-assign</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>User Management</CardTitle><CardDescription>Add, edit, or remove user accounts.</CardDescription></div>
                <Button onClick={() => handleOpenUserForm(null)}><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {usersState.map(u => (
                            <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell><Badge variant={roleDisplay[u.role as Exclude<Role, 'customer'>].variant}>{roleDisplay[u.role as Exclude<Role, 'customer'>].name}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenUserForm(u)} disabled={u.id === user?.id}><Edit size={16}/></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'user', value: u, description: `This will permanently delete the account for ${u.name}.`})} disabled={u.id === user?.id}><Trash2 size={16}/></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="filters">
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex-row items-center justify-between"><CardTitle>Brands</CardTitle><Button size="sm" onClick={() => handleOpenFilterForm('brand', null)}>Add</Button></CardHeader>
                    <CardContent>
                        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right w-24">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>{brandsState.map(brand => (<TableRow key={brand}><TableCell>{brand}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('brand', brand)}><Edit size={16}/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'brand', value: brand, description: `This will delete the brand ${brand} and all its models.`})}><Trash2 size={16}/></Button></TableCell></TableRow>))}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between"><CardTitle>Models</CardTitle><Button size="sm" onClick={() => handleOpenFilterForm('model', null)}>Add</Button></CardHeader>
                    <CardContent>
                        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead className="text-right w-24">Actions</TableHead></TableRow></TableHeader>
                             <TableBody>{brandsState.flatMap(brand => (modelsState[brand] || []).map(model => (<TableRow key={`${brand}-${model}`}><TableCell>{model}</TableCell><TableCell><Badge variant="secondary">{brand}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('model', {brand, model})}><Edit size={16}/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'model', value: { brand, model }, description: `This will delete the model ${model}.`})}><Trash2 size={16}/></Button></TableCell></TableRow>)))}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between"><CardTitle>Years</CardTitle><Button size="sm" onClick={() => handleOpenFilterForm('year', null)}>Add</Button></CardHeader>
                    <CardContent>
                        <Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right w-24">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>{yearsState.map(year => (<TableRow key={year}><TableCell>{year}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('year', year)}><Edit size={16}/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'year', value: year, description: `This will delete the year ${year}.`})}><Trash2 size={16}/></Button></TableCell></TableRow>))}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>

        {/* --- Dialogs & Alerts --- */}

        <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{userToEdit ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@malluvandi.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder={userToEdit ? 'Leave blank to keep unchanged' : ''} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="employee-a">Content Manager (Employee A)</SelectItem>
                                        <SelectItem value="employee-b">Sales & Support (Employee B)</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter><Button type="button" variant="ghost" onClick={() => setIsUserFormOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isCarFormOpen} onOpenChange={setIsCarFormOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <form onSubmit={onCarSubmit}>
              <DialogHeader><DialogTitle>{carToEdit ? 'Edit Car' : 'Add Car'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormFieldItem label="Brand" name="brand" defaultValue={carToEdit?.brand} as="select" options={brandsState} onChange={e => setSelectedBrandForModel(e.target.value)} />
                    <FormFieldItem label="Model" name="model" defaultValue={carToEdit?.model} as="select" options={modelsState[selectedBrandForModel || carToEdit?.brand || ''] || []} disabled={!selectedBrandForModel && !carToEdit} />
                    <FormFieldItem label="Year" name="year" type="number" defaultValue={carToEdit?.year} />
                    <FormFieldItem label="Price (₹)" name="price" type="number" defaultValue={carToEdit?.price} />
                    <FormFieldItem label="KM Run" name="kmRun" type="number" defaultValue={carToEdit?.kmRun} />
                    <FormFieldItem label="Color" name="color" defaultValue={carToEdit?.color} />
                    <FormFieldItem label="Ownership" name="ownership" type="number" defaultValue={carToEdit?.ownership} />
                    <FormFieldItem label="Insurance" name="insurance" defaultValue={carToEdit?.insurance} />
                </div>
                 <FormFieldItem label="Challans" name="challans" defaultValue={carToEdit?.challans} />
                <FormFieldItem label="Details" name="details" as="textarea" defaultValue={carToEdit?.additionalDetails} />
                <FormFieldItem label="Status" name="status" as="select" defaultValue={carToEdit?.status || 'pending'} options={['pending', 'approved', 'rejected']} />
                 <div>
                    <Label>Badges</Label>
                    <div className="flex items-center space-x-4 mt-2">
                        {carBadges.map(badge => (
                            <div key={badge} className="flex items-center space-x-2">
                                <Checkbox id={badge} name={badge} defaultChecked={carToEdit?.badges?.includes(badge)} />
                                <label htmlFor={badge} className="text-sm font-medium capitalize">{badge.replace('_', ' ')}</label>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
              <DialogFooter><Button type="button" variant="ghost" onClick={() => setIsCarFormOpen(false)}>Cancel</Button><Button type="submit">Save Car</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

         <Dialog open={isFilterFormOpen.isOpen} onOpenChange={() => setIsFilterFormOpen({type: 'brand', isOpen: false})}>
            <DialogContent>
                <DialogHeader><DialogTitle>{filterToEdit ? 'Edit' : 'Add'} {isFilterFormOpen.type}</DialogTitle></DialogHeader>
                <form className="space-y-4" onSubmit={onFilterSubmit}>
                    {isFilterFormOpen.type === 'model' && (
                        <div>
                          <Label>Brand</Label>
                          <Select name="brand" onValueChange={setSelectedBrandForModel} value={selectedBrandForModel} defaultValue={(filterToEdit?.value as any)?.brand} required disabled={!!filterToEdit}>
                            <SelectTrigger><SelectValue placeholder="Select a brand..." /></SelectTrigger>
                            <SelectContent>{brandsState.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                    )}
                    <div>
                        <Label>Name</Label>
                        <Input name="name" defaultValue={(filterToEdit?.value as any)?.model || (isFilterFormOpen.type !== 'model' && filterToEdit?.value) || ''} required />
                    </div>
                    <DialogFooter><Button type="button" variant="ghost" onClick={() => setIsFilterFormOpen({type: 'brand', isOpen: false})}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={isReassignInquiryOpen} onOpenChange={setIsReassignInquiryOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Re-assign Inquiry</DialogTitle></DialogHeader>
                <form onSubmit={handleReassignInquiry}>
                    <Label>Assign to new salesperson</Label>
                    <Select name="assignee" defaultValue={inquiryToReassign?.assignedTo}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{salesEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <DialogFooter className="mt-4"><Button type="button" variant="ghost" onClick={() => setIsReassignInquiryOpen(false)}>Cancel</Button><Button type="submit">Re-assign</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>{itemToDelete?.description}</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

const FormFieldItem = ({label, name, as = 'input', options, ...props}: {label: string, name: string, as?: 'input' | 'textarea' | 'select', options?: any[]} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.SelectHTMLAttributes<HTMLSelectElement>) => {
    const commonProps = {id: name, name, className: "col-span-3", ...props};
    const renderField = () => {
        if (as === 'textarea') return <Textarea {...commonProps} />;
        if (as === 'select') return (
            <Select name={name} defaultValue={props.defaultValue as string} onValueChange={(props as any).onValueChange} disabled={props.disabled}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>{options?.map(o => <SelectItem key={o} value={o}>{o.toString().charAt(0).toUpperCase() + o.toString().slice(1)}</SelectItem>)}</SelectContent>
            </Select>
        );
        return <Input {...commonProps} />;
    };
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={name} className="text-right">{label}</Label>
            {renderField()}
        </div>
    )
}

    