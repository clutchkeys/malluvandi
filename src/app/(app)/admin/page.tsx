'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Edit,
  Trash2,
  PlusCircle,
  Eye,
  Loader2,
  Sliders,
  BarChart3,
  List,
} from 'lucide-react';
import type { User, Role, Car as CarType, Inquiry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOCK_CARS, MOCK_USERS, MOCK_INQUIRIES, MOCK_BRANDS, MOCK_MODELS, MOCK_YEARS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';


const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'employee-a', 'employee-b'], { required_error: 'Role is required' }),
  performanceScore: z.number().min(0).max(10).optional(),
});

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState('approvals');
  const [isLoading, setIsLoading] = useState({
      cars: true, users: true, inquiries: true, filters: true
  });
  
  // Data states
  const [carsState, setCarsState] = useState<CarType[]>([]);
  const [usersState, setUsersState] = useState<User[]>([]);
  const [inquiriesState, setInquiriesState] = useState<Inquiry[]>([]);

  // Filter options state
  const [brandsState, setBrandsState] = useState<string[]>([]);
  const [modelsState, setModelsState] = useState<{[key: string]: string[]}>({});
  const [yearsState, setYearsState] = useState<number[]>([]);
  
  // Dialog/Alert states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);
  const [isFilterFormOpen, setIsFilterFormOpen] = useState<{type: 'brand' | 'model' | 'year', isOpen: boolean}>({type: 'brand', isOpen: false});
  const [isReassignInquiryOpen, setIsReassignInquiryOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string, description: string } | null>(null);

  // States for editing specific items
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [carToEdit, setCarToEdit] = useState<CarType | null>(null);
  const [filterToEdit, setFilterToEdit] = useState<{type: string, value: any} | null>(null);
  const [inquiryToReassign, setInquiryToReassign] = useState<Inquiry | null>(null);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  
  // Misc states
  const [selectedBrandForModel, setSelectedBrandForModel] = useState('');
  const [formattedInquiryDate, setFormattedInquiryDate] = useState('');

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'employee-a' },
  });
  
  useEffect(() => {
    if (!loading && user?.role !== 'admin' && user?.role !== 'manager') {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch all data
  useEffect(() => {
    setIsLoading({ cars: true, users: true, inquiries: true, filters: true });
    // Using mock data
    setCarsState(MOCK_CARS);
    setUsersState(MOCK_USERS.filter(u => u.role !== 'customer'));
    setInquiriesState(MOCK_INQUIRIES);
    setBrandsState(MOCK_BRANDS);
    setModelsState(MOCK_MODELS);
    setYearsState(MOCK_YEARS);
    setIsLoading({ cars: false, users: false, inquiries: false, filters: false });
  }, []);

  useEffect(() => {
    if (viewingInquiry) {
      setFormattedInquiryDate(new Date(viewingInquiry.submittedAt).toLocaleString('en-US'));
    }
  }, [viewingInquiry]);

  const pendingCars = useMemo(() => carsState.filter(car => car.status === 'pending'), [carsState]);
  const salesEmployees = useMemo(() => usersState.filter(u => u.role === 'employee-b'), [usersState]);

  // Approval Handlers
  const handleApproval = async (carId: string, status: 'approved' | 'rejected') => {
    // Mock logic
    setCarsState(prev => prev.map(car => car.id === carId ? {...car, status} : car));
    toast({
      title: `Listing ${status}`,
      description: `The car listing has been successfully ${status}.`,
    });
  };

  // --- User Management ---
  const handleOpenUserForm = (user: User | null) => {
    setUserToEdit(user);
    form.reset(user ? { ...user, performanceScore: user.performanceScore || 0 } : { name: '', email: '', role: 'employee-a', performanceScore: 0 });
    setIsUserFormOpen(true);
  }
  
  const onUserSubmit = async (values: z.infer<typeof userSchema>) => {
    if (userToEdit) {
        setUsersState(currentUsers => currentUsers.map(u => 
            u.id === userToEdit.id ? { ...u, role: values.role as Role, performanceScore: values.performanceScore } : u
        ));
        toast({ title: 'User Updated' });
    }
    setIsUserFormOpen(false);
  };
  
  // --- Car Management ---
  const handleOpenCarForm = (car: CarType | null) => {
    setCarToEdit(car);
    setSelectedBrandForModel(car?.brand || '');
    setIsCarFormOpen(true);
  }

  const onCarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;
    
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
    };
    
    if (carToEdit) {
      setCarsState(carsState.map(c => c.id === carToEdit.id ? { ...c, ...carData } : c));
      toast({ title: 'Car Updated' });
    } else {
      const newCarData = {
        id: `car-${Date.now()}`,
        ...carData,
        submittedBy: user!.id,
        images: ['https://placehold.co/600x400.png'],
      };
      setCarsState([...carsState, newCarData as CarType]);
      toast({ title: 'Car Added' });
    }
    setIsCarFormOpen(false);
  }

  // --- Inquiry Management ---
  const handleReassignInquiry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newAssigneeId = new FormData(e.currentTarget).get('assignee') as string;
    if (inquiryToReassign && newAssigneeId) {
        setInquiriesState(inquiriesState.map(i => i.id === inquiryToReassign.id ? {...i, assignedTo: newAssigneeId} : i))
        toast({ title: "Inquiry Reassigned" });
    }
    setIsReassignInquiryOpen(false);
  }

  // --- Filter Management ---
  const handleOpenFilterForm = (type: 'brand' | 'model' | 'year', value: any | null) => {
    setFilterToEdit(value ? { type, value } : null);
    if(type === 'model' && value) setSelectedBrandForModel(value.brand);
    else if(type === 'model' && !value) setSelectedBrandForModel('');
    setIsFilterFormOpen({ type, isOpen: true });
  }

  const onFilterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = isFilterFormOpen.type;

    let newBrands = [...brandsState];
    let newModels = {...modelsState};
    let newYears = [...yearsState];

    if (type === 'brand') {
      const brandName = formData.get('name') as string;
      if (filterToEdit) {
        const oldBrandName = filterToEdit.value;
        newBrands = brandsState.map(b => b === oldBrandName ? brandName : b);
        const oldModels = newModels[oldBrandName] || [];
        delete newModels[oldBrandName];
        newModels[brandName] = oldModels;
      } else {
        newBrands = [...brandsState, brandName];
      }
    } else if (type === 'model') {
      const modelName = formData.get('name') as string;
      const brand = formData.get('brand') as string;
      if (filterToEdit) {
        newModels = { ...newModels, [brand]: newModels[brand].map(m => m === (filterToEdit.value as any).model ? modelName : m) };
      } else {
        newModels = { ...newModels, [brand]: [...(newModels[brand] || []), modelName] };
      }
    } else if (type === 'year') {
      const year = parseInt(formData.get('name') as string);
      if (filterToEdit) {
        newYears = yearsState.map(y => y === filterToEdit.value ? year : y);
      } else {
        newYears = [...yearsState, year];
      }
      newYears.sort((a,b) => b-a);
    }
    
    setBrandsState(newBrands);
    setModelsState(newModels);
    setYearsState(newYears);
    
    toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Saved`});
    setIsFilterFormOpen({ type: 'brand', isOpen: false });
  }

  // --- Generic Delete Handler ---
  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    if (type === 'user') {
        setUsersState(prev => prev.filter(u => u.id !== id));
        toast({ title: `User Deleted`, description: "User's record has been removed." });
    }
    if (type === 'car') {
        setCarsState(prev => prev.filter(c => c.id !== id));
        toast({ title: `Car Deleted` });
    }
    
    setItemToDelete(null);
  }

  const roleDisplay: Record<Exclude<Role, 'customer'>, { name: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined }> = {
    admin: { name: 'Admin', variant: 'destructive' },
    manager: { name: 'Manager', variant: 'default' },
    'employee-a': { name: 'Content Editor', variant: 'secondary' },
    'employee-b': { name: 'Sales', variant: 'outline' },
  };

  const viewingInquiryCar = carsState.find(c => c.id === viewingInquiry?.carId);
  const viewingInquiryAssignee = usersState.find(u => u.id === viewingInquiry?.assignedTo);
  
  const navItems = [
    { id: 'approvals', label: 'Pending Approvals', icon: Car },
    { id: 'listings', label: 'Car Listings', icon: List },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
    { id: 'performance', label: 'Employee Performance', icon: BarChart3, adminOnly: true },
    { id: 'filters', label: 'Filter Management', icon: Sliders },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h2 className="font-semibold">Admin Panel</h2>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item =>
                (!item.adminOnly || user?.role === 'admin') && (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      activeView === item.id && 'bg-muted text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Listings</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{carsState.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><Car className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{pendingCars.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Inquiries</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{inquiriesState.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{usersState.length}</div></CardContent>
                </Card>
            </div>

            {activeView === 'approvals' && (
                <Card>
                    <CardHeader><CardTitle>Car Listings for Approval</CardTitle><CardDescription>Review and approve or reject new car listings.</CardDescription></CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Car</TableHead><TableHead>Submitted By</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {isLoading.cars ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                        pendingCars.length > 0 ? pendingCars.map(car => (
                            <TableRow key={car.id}>
                            <TableCell className="font-medium"><div className="flex items-center gap-4"><Image src={car.images[0]} alt={car.model} width={64} height={48} className="rounded-md object-cover" data-ai-hint="car exterior"/><div>{car.brand} {car.model} ({car.year})<div className="text-xs text-muted-foreground">{car.color}</div></div></div></TableCell>
                            <TableCell>{usersState.find(u => u.id === car.submittedBy)?.name || car.submittedBy.substring(0,5)}</TableCell>
                            <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={() => handleApproval(car.id, 'approved')}><CheckCircle2 size={20} /></Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleApproval(car.id, 'rejected')}><XCircle size={20} /></Button>
                            </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No pending approvals.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            )}

            {activeView === 'listings' && (
                <Card>
                    <CardHeader className="flex-row justify-between items-center"><CardTitle>All Car Listings</CardTitle><Button onClick={() => handleOpenCarForm(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add Car</Button></CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Car</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {isLoading.cars ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                        carsState.map(car => (
                            <TableRow key={car.id}>
                            <TableCell className="font-medium">{car.brand} {car.model}</TableCell>
                            <TableCell>₹{car.price.toLocaleString('en-IN')}</TableCell>
                            <TableCell><Badge variant={car.status === 'approved' ? 'default' : car.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">{car.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenCarForm(car)}><Edit size={16}/></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'car', id: car.id, description: `This will permanently delete the listing for ${car.brand} ${car.model}.`})}><Trash2 size={16}/></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            )}
            
            {activeView === 'inquiries' && (
                <Card>
                    <CardHeader><CardTitle>Customer Inquiries</CardTitle><CardDescription>Track and manage all customer inquiries.</CardDescription></CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Car</TableHead><TableHead>Assigned To</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {isLoading.inquiries ? <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                        inquiriesState.map(inq => {
                            const assignee = usersState.find(u => u.id === inq.assignedTo);
                            return (
                            <TableRow key={inq.id} className="cursor-pointer" onClick={() => setViewingInquiry(inq)}>
                                <TableCell>{inq.customerName}</TableCell>
                                <TableCell>{inq.carSummary || 'N/A'}</TableCell>
                                <TableCell>{assignee?.name || 'Unassigned'}</TableCell>
                                <TableCell><Badge variant={inq.status === 'new' ? 'default' : 'secondary'} className="capitalize">{inq.status}</Badge></TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{inq.remarks || "No remarks yet."}</TableCell>
                                <TableCell className="text-right flex items-center justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setViewingInquiry(inq)}><Eye className="mr-2 h-4 w-4"/> View</Button>
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setInquiryToReassign(inq); setIsReassignInquiryOpen(true);}}>Re-assign</Button>
                                </TableCell>
                            </TableRow>
                            )
                        })}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            )}

            {activeView === 'users' && user?.role === 'admin' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <div><CardTitle>User Management</CardTitle><CardDescription>Edit user roles.</CardDescription></div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                            {isLoading.users ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                            usersState.map(u => (
                                <TableRow key={u.id}>
                                <TableCell className="font-medium">{u.name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell><Badge variant={roleDisplay[u.role as Exclude<Role, 'customer'>]?.variant}>{roleDisplay[u.role as Exclude<Role, 'customer'>]?.name}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenUserForm(u)} disabled={u.id === user?.id}><Edit size={16}/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'user', id: u.id, description: `This will delete the user record for ${u.name} from Firestore, but will not delete their login account.`})} disabled={u.id === user?.id}><Trash2 size={16}/></Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeView === 'performance' && user?.role === 'admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Performance</CardTitle>
                        <CardDescription>Monitor employee status, attendance, and scores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Attendance</TableHead>
                                    <TableHead>Performance Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading.users ? <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                                usersState.filter(u => u.role.startsWith('employee')).map(emp => (
                                    <TableRow key={emp.id}>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.status === 'Online' ? 'default' : 'outline'} className="gap-1">
                                                <span className={cn("h-2 w-2 rounded-full", emp.status === 'Online' ? 'bg-green-500' : 'bg-gray-400')}></span>
                                                {emp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{emp.attendance}</TableCell>
                                        <TableCell>{emp.performanceScore}/10</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenUserForm(emp)}><Edit size={16}/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeView === 'filters' && (
                 <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between"><CardTitle>Brands</CardTitle><Button size="sm" onClick={() => handleOpenFilterForm('brand', null)}>Add</Button></CardHeader>
                        <CardContent>
                            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right w-24">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>{isLoading.filters ? <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow> : brandsState.map(brand => (<TableRow key={brand}><TableCell>{brand}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('brand', brand)}><Edit size={16}/></Button></TableCell></TableRow>))}</TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between"><CardTitle>Models</CardTitle><Button size="sm" onClick={() => handleOpenFilterForm('model', null)}>Add</Button></CardHeader>
                        <CardContent>
                            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead className="text-right w-24">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>{isLoading.filters ? <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow> : brandsState.flatMap(brand => (modelsState[brand] || []).map(model => (<TableRow key={`${brand}-${model}`}><TableCell>{model}</TableCell><TableCell><Badge variant="secondary">{brand}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('model', {brand, model})}><Edit size={16}/></Button></TableCell></TableRow>)))}</TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between"><CardTitle>Years</CardTitle><Button size="sm" onClick={() => handleOpenFilterForm('year', null)}>Add</Button></CardHeader>
                        <CardContent>
                            <Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead className="text-right w-24">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>{isLoading.filters ? <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow> : yearsState.map(year => (<TableRow key={year}><TableCell>{year}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('year', year)}><Edit size={16}/></Button></TableCell></TableRow>))}</TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
      </div>

        {/* --- Dialogs & Alerts --- */}

        <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{userToEdit ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} disabled /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@malluvandi.com" {...field} disabled /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {user?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                                        {user?.role === 'admin' && <SelectItem value="manager">Manager</SelectItem>}
                                        <SelectItem value="employee-a">Content Editor</SelectItem>
                                        <SelectItem value="employee-b">Sales & Support</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                        {(userToEdit?.role.startsWith('employee')) && (
                             <FormField control={form.control} name="performanceScore" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Performance Score (out of 10)</FormLabel>
                                    <FormControl><Input type="number" min="0" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        )}
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
                          <Select name="brand" onValueChange={setSelectedBrandForModel} value={selectedBrandForModel} defaultValue={(filterToEdit?.value as any)?.brand} required>
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
        
        <Dialog open={!!viewingInquiry} onOpenChange={() => setViewingInquiry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                For {viewingInquiryCar ? `${viewingInquiryCar.brand} ${viewingInquiryCar.model}` : 'a car'}.
              </DialogDescription>
            </DialogHeader>
            {viewingInquiry && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 p-1 pr-6">
                  <h4 className="font-semibold text-lg">Customer Information</h4>
                  <p><span className="font-medium">Name:</span> {viewingInquiry.customerName}</p>
                  <p><span className="font-medium">Phone:</span> {viewingInquiry.customerPhone}</p>
                  <p><span className="font-medium">Submitted:</span> {formattedInquiryDate}</p>
                  
                  <h4 className="font-semibold text-lg pt-2">Sales Information</h4>
                  <p><span className="font-medium">Assigned To:</span> {viewingInquiryAssignee?.name || 'Unassigned'}</p>
                  <p><span className="font-medium">Status:</span> <Badge variant={viewingInquiry.status === 'new' ? 'default' : 'secondary'} className="capitalize">{viewingInquiry.status}</Badge></p>

                  <h4 className="font-semibold text-lg pt-2">Call Remarks</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingInquiry.remarks || "No remarks provided."}</p>
                  
                  <h4 className="font-semibold text-lg pt-2">Private Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingInquiry.privateNotes || "No private notes."}</p>
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingInquiry(null)}>Close</Button>
            </DialogFooter>
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
                <SelectContent>{(options || []).map(o => <SelectItem key={o} value={o}>{o.toString().charAt(0).toUpperCase() + o.toString().slice(1)}</SelectItem>)}</SelectContent>
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
