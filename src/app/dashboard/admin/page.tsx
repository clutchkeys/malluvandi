

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  List,
  LayoutDashboard,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Mail,
  Settings,
  UserCheck,
  Bell,
  Ban,
  CircleOff,
  Menu,
  Image as ImageIcon,
  Upload,
  User as UserIcon,
  KeyRound
} from 'lucide-react';
import type { User, Role, Car as CarType, Inquiry, AttendanceRecord, Brand } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { addMonths, subMonths, format, startOfMonth, getDay, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, setDoc, addDoc, writeBatch } from 'firebase/firestore';
import { ImportCarsModal } from '@/components/import-cars-modal';


const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'employee-a', 'employee-b', 'customer'], { required_error: 'Role is required' }),
  performanceScore: z.number().min(0).max(10).optional(),
});

export default function AdminPage() {
  const { user, loading, logout, register, sendPasswordReset } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState({
      cars: true, users: true, inquiries: true, filters: true, brands: true
  });
  
  // Data states
  const [carsState, setCarsState] = useState<CarType[]>([]);
  const [usersState, setUsersState] = useState<User[]>([]);
  const [inquiriesState, setInquiriesState] = useState<Inquiry[]>([]);
  const [brandsData, setBrandsData] = useState<Brand[]>([]);

  // Filter options state
  const [filterCategories, setFilterCategories] = useState<{ id: string; name: string; options: string[] }[]>([]);
  const [brandsState, setBrandsState] = useState<string[]>([]);
  const [modelsState, setModelsState] = useState<{[key: string]: string[]}>({});
  const [yearsState, setYearsState] = useState<number[]>([]);
  
  // Dialog/Alert states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isCarFormOpen, setIsCarFormOpen] = useState(false);
  const [isFilterFormOpen, setIsFilterFormOpen] = useState<{type: 'category' | 'value' | 'year', isOpen: boolean}>({type: 'category', isOpen: false});
  const [isReassignInquiryOpen, setIsReassignInquiryOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string | number, description: string, categoryId?: string } | null>(null);
  const [isBrandFormOpen, setIsBrandFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  // States for editing specific items
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [carToEdit, setCarToEdit] = useState<CarType | null>(null);
  const [filterToEdit, setFilterToEdit] = useState<{type: 'category' | 'value' | 'year', value: any, categoryId?: string} | null>(null);
  const [inquiryToReassign, setInquiryToReassign] = useState<Inquiry | null>(null);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

  
  // Misc states
  const [selectedBrandForModel, setSelectedBrandForModel] = useState('');
  const [formattedInquiryDate, setFormattedInquiryDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'customer', performanceScore: 0 },
  });
  
  useEffect(() => {
    if (!loading && user?.role !== 'admin' && user?.role !== 'manager') {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch all data
  useEffect(() => {
    setIsLoading(prev => ({...prev, cars: true, users: true, inquiries: true, filters: true, brands: true }));

    const unsubCars = onSnapshot(collection(db, 'cars'), snapshot => {
        setCarsState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarType)));
        setIsLoading(prev => ({...prev, cars: false}));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), snapshot => {
        setUsersState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        setIsLoading(prev => ({...prev, users: false}));
    });
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), snapshot => {
        setInquiriesState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry)));
        setIsLoading(prev => ({...prev, inquiries: false}));
    });
    const unsubFilters = onSnapshot(doc(db, 'config', 'filters'), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setBrandsState(data.brands || []);
            setModelsState(data.models || {});
            setYearsState((data.years || []).sort((a: number, b: number) => b - a));
            const categories = (data.brands || []).map((brand: string) => ({
                id: brand.toLowerCase(),
                name: brand,
                options: data.models[brand] || []
            }));
            setFilterCategories(categories);
        }
        setIsLoading(prev => ({...prev, filters: false}));
    });
    const unsubBrands = onSnapshot(collection(db, 'brands'), snapshot => {
        setBrandsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand)));
        setIsLoading(prev => ({...prev, brands: false}));
    });

    
    return () => {
        unsubCars();
        unsubUsers();
        unsubInquiries();
        unsubFilters();
        unsubBrands();
    };
  }, []);

  useEffect(() => {
    if (viewingInquiry) {
      setFormattedInquiryDate(new Date(viewingInquiry.submittedAt).toLocaleString('en-US'));
    }
  }, [viewingInquiry]);

  const pendingCars = useMemo(() => carsState.filter(car => car.status === 'pending'), [carsState]);
  const salesEmployees = useMemo(() => usersState.filter(u => u.role === 'employee-b'), [usersState]);
  const allStaff = useMemo(() => usersState.filter(u => u.role !== 'customer'), [usersState]);
  const allCustomers = useMemo(() => usersState.filter(u => u.role === 'customer'), [usersState]);
  const newsletterSubscribers = useMemo(() => usersState.filter(u => u.newsletterSubscribed), [usersState]);

  // Approval Handlers
  const handleApproval = async (carId: string, status: 'approved' | 'rejected') => {
    const carRef = doc(db, 'cars', carId);
    try {
        await updateDoc(carRef, { status });
        toast({
          title: `Listing ${status}`,
          description: `The car listing has been successfully ${status}.`,
        });
    } catch(e) {
         toast({ title: 'Error', description: 'Could not update listing status.', variant: 'destructive'});
    }
  };

  // --- User Management ---
  const handleOpenUserForm = (user: User | null) => {
    setUserToEdit(user);
    form.reset(user ? { ...user, performanceScore: user.performanceScore || 0 } : { name: '', email: '', role: 'customer', performanceScore: 0 });
    setIsUserFormOpen(true);
  }
  
  const onUserSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      if (userToEdit) {
          const userRef = doc(db, 'users', userToEdit.id);
          const updates: Partial<User> = {
              role: values.role,
          };
          if (values.role.startsWith('employee')) {
              updates.performanceScore = values.performanceScore;
          } else {
              updates.performanceScore = 0; // Or remove it if your data model allows
          }
          await updateDoc(userRef, updates);
          toast({ title: 'User Updated', description: `${userToEdit.name}'s role has been updated.` });
      } else {
          await register(values.name, values.email, Math.random().toString(36).slice(-8), '', false, values.role);
          toast({ title: 'User Created', description: 'User has been created with a temporary password.' });
      }
      setIsUserFormOpen(false);
    } catch(e: any) {
        toast({ title: 'Error', description: e.message || 'Could not save user.', variant: 'destructive'});
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, {banned: !currentStatus});
        toast({ title: `User ${currentStatus ? 'Unbanned' : 'Banned'}`, description: `The user's account status has been updated.` });
    } catch (e) {
        toast({ title: 'Error', description: 'Could not update ban status.', variant: 'destructive'});
    }
  }

  const handlePasswordReset = async (email: string) => {
    try {
        await sendPasswordReset(email);
        toast({ title: 'Password Reset Email Sent', description: `An email has been sent to ${email} with instructions to reset their password.`});
    } catch (e: any) {
        toast({ title: 'Error', description: e.message || 'Could not send password reset email.', variant: 'destructive'});
    }
  }
  
  // --- Car Management ---
  const handleOpenCarForm = (car: CarType | null) => {
    setCarToEdit(car);
    setSelectedBrandForModel(car?.brand || '');
    setImageUrls(car?.images || []);
    setIsCarFormOpen(true);
  }

  const onCarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as any;
    
    const carData: Partial<CarType> = {
        brand: formValues.brand,
        model: formValues.model,
        year: formValues.year ? parseInt(formValues.year) : undefined,
        price: formValues.price ? parseInt(formValues.price) : undefined,
        engineCC: formValues.engineCC ? parseInt(formValues.engineCC) : undefined,
        fuel: formValues.fuel,
        transmission: formValues.transmission,
        kmRun: formValues.kmRun ? parseInt(formValues.kmRun) : undefined,
        color: formValues.color,
        ownership: formValues.ownership ? parseInt(formValues.ownership) : undefined,
        additionalDetails: formValues.details,
        status: formValues.status,
        badges: formValues.badges ? formValues.badges.split(',').map((b:string) => b.trim()) : [],
        instagramReelUrl: formValues.instagramReelUrl,
        images: imageUrls,
    };
    
    try {
        if (!carData.brand || !carData.model) {
            toast({ title: "Validation Error", description: "Brand and Model are required.", variant: "destructive" });
            return;
        }

        if (carToEdit) {
          await updateDoc(doc(db, 'cars', carToEdit.id), carData);
          toast({ title: 'Car Updated' });
        } else {
          const newCarData = {
            ...carData,
            submittedBy: user.id,
            status: carData.status || 'pending',
          };
          await addDoc(collection(db, 'cars'), newCarData);
          toast({ title: 'Car Added' });
        }

        const filtersRef = doc(db, 'config', 'filters');
        const filtersSnap = await getDoc(filtersRef);
        if (filtersSnap.exists()) {
            const filtersData = filtersSnap.data();
            if (carData.brand && carData.model && !filtersData.models[carData.brand]?.includes(carData.model)) {
                if (!filtersData.models[carData.brand]) {
                    filtersData.models[carData.brand] = [];
                }
                filtersData.models[carData.brand].push(carData.model);
                await updateDoc(filtersRef, { models: filtersData.models });
            }
        }
        setIsCarFormOpen(false);
    } catch (error) {
        console.error("Error saving car:", error);
        toast({ title: 'Save Failed', description: 'Could not save car details.', variant: 'destructive'});
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrl && !imageUrls.includes(imageUrl)) {
        setImageUrls([...imageUrls, imageUrl]);
        setImageUrl('');
    }
  };

  const handleRemoveImageUrl = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };


  // --- Inquiry Management ---
  const handleReassignInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newAssigneeId = new FormData(e.currentTarget).get('assignee') as string;
    if (inquiryToReassign && newAssigneeId) {
        const inquiryRef = doc(db, 'inquiries', inquiryToReassign.id);
        try {
            await updateDoc(inquiryRef, { assignedTo: newAssigneeId });
            toast({ title: "Inquiry Reassigned" });
            setIsReassignInquiryOpen(false);
        } catch (error) {
            toast({ title: 'Error', description: 'Could not reassign inquiry.', variant: 'destructive'});
        }
    }
  }

  // --- Filter Management ---
    const handleOpenFilterForm = (type: 'category' | 'value' | 'year', value: any | null, categoryId?: string) => {
        setFilterToEdit(value ? { type, value, categoryId } : null);
        setIsFilterFormOpen({ type, isOpen: true });
    }

    const onFilterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const type = isFilterFormOpen.type;
        
        try {
            const filtersRef = doc(db, 'config', 'filters');
            const currentDoc = await getDoc(filtersRef);
            const currentData = currentDoc.exists() ? currentDoc.data() : { brands: [], models: {}, years: [] };

            if (type === 'category') { // Brand management
                 if (filterToEdit) { // Edit brand
                    const oldName = (filterToEdit.value as any).name;
                    currentData.brands = currentData.brands.map((b: string) => b === oldName ? name : b);
                    if (currentData.models[oldName]) {
                        currentData.models[name] = currentData.models[oldName];
                        delete currentData.models[oldName];
                    }
                } else { // Add brand
                    if (!currentData.brands.includes(name)) {
                        currentData.brands.push(name);
                        currentData.models[name] = [];
                    }
                }
            } else if (type === 'value' && filterToEdit?.categoryId) { // Model management
                const brandName = filterToEdit.categoryId;
                if (!currentData.models[brandName]) currentData.models[brandName] = [];
                const modelValue = name.trim();
                if(modelValue) {
                   if (filterToEdit.value) { // Edit model
                        currentData.models[brandName] = currentData.models[brandName].map((m: string) => m === filterToEdit.value ? modelValue : m);
                    } else { // Add model
                        if (!currentData.models[brandName].includes(modelValue)) {
                            currentData.models[brandName].push(modelValue);
                        }
                    }
                }
            } else if (type === 'year') { // Year management
                const yearValue = parseInt(name);
                if (!isNaN(yearValue)) {
                    if (!currentData.years) currentData.years = [];
                    if (!currentData.years.includes(yearValue)) {
                        currentData.years.push(yearValue);
                        currentData.years.sort((a: number, b: number) => b - a);
                    }
                }
            }
            await setDoc(filtersRef, currentData, { merge: true });
            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Saved`});
            setIsFilterFormOpen({ type: 'category', isOpen: false });

        } catch (error) {
            console.error("Filter submit error:", error);
            toast({ title: 'Error', description: 'Could not save filter data.', variant: 'destructive'});
        }
    }

  // Brand Management
  const handleOpenBrandForm = (brand: Brand | null) => {
    setBrandToEdit(brand);
    setIsBrandFormOpen(true);
  }

  const onBrandSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const brandData = {
        name: formData.get('name') as string,
        logoUrl: formData.get('logoUrl') as string,
    }

    try {
        if (brandToEdit) {
            await updateDoc(doc(db, 'brands', brandToEdit.id), brandData);
            toast({ title: 'Brand Updated' });
        } else {
            // In a real app, you might want to prevent adding duplicate brand names
            await addDoc(collection(db, 'brands'), brandData);
            toast({ title: 'Brand Added'});
        }
        setIsBrandFormOpen(false);
    } catch(e) {
        toast({ title: 'Error', description: 'Could not save brand.', variant: 'destructive'});
    }
  }

  // --- Generic Delete Handler ---
  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { type, id, categoryId } = itemToDelete;
    
    try {
        if (type === 'user') {
            await deleteDoc(doc(db, 'users', id as string));
            toast({ title: `User Deleted`, description: "User's record has been removed." });
        }
        if (type === 'car') {
            await deleteDoc(doc(db, 'cars', id as string));
            toast({ title: `Car Deleted` });
        }
        if (type === 'brand') {
            await deleteDoc(doc(db, 'brands', id as string));
            toast({ title: 'Brand Deleted' });
        }
        if (type === 'filterCategory' || type === 'filterValue' || type === 'filterYear') {
            const filtersRef = doc(db, 'config', 'filters');
            const currentDoc = await getDoc(filtersRef);
            if (!currentDoc.exists()) return;
            const currentData = currentDoc.data();
            
            if (type === 'filterCategory') {
                delete currentData.models[id as string];
                currentData.brands = currentData.brands.filter((b:string) => b !== id);
            }
            if (type === 'filterValue' && categoryId) {
                currentData.models[categoryId] = currentData.models[categoryId].filter((m:string) => m !== id);
            }
            if (type === 'filterYear') {
                currentData.years = currentData.years.filter((y: number) => y !== id);
            }
            
            await setDoc(filtersRef, currentData);
            toast({ title: 'Filter data updated' });
        }
    } catch (error) {
        console.error("Delete error:", error);
        toast({ title: 'Delete Failed', variant: 'destructive' });
    }
    
    setItemToDelete(null);
  }

  const roleDisplay: Record<Role, { name: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined }> = {
    admin: { name: 'Admin', variant: 'destructive' },
    manager: { name: 'Manager', variant: 'default' },
    'employee-a': { name: 'Content Editor', variant: 'secondary' },
    'employee-b': { name: 'Sales', variant: 'outline' },
    customer: { name: 'Customer', variant: 'outline'}
  };

  const viewingInquiryCar = carsState.find(c => c.id === viewingInquiry?.carId);
  const viewingInquiryAssignee = usersState.find(u => u.id === viewingInquiry?.assignedTo);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: 'Pending Approvals', icon: Car },
    { id: 'listings', label: 'Car Listings', icon: List },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'users', label: 'User Management', icon: Users, managerOnly: false },
    { id: 'brands', label: 'Brand Management', icon: ImageIcon },
    { id: 'attendance', label: 'Attendance', icon: CalendarDays, adminOnly: true },
    { id: 'employees', label: 'Employees', icon: Users, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, adminOnly: true },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, adminOnly: true },
    { id: 'filters', label: 'Filter Management', icon: Sliders },
  ];

  const SideNav = () => (
     <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {navItems.map(item => {
          const isManagerOnlyHidden = item.id === 'users' && user?.role === 'manager';
          if ((item.adminOnly && user?.role !== 'admin') || isManagerOnlyHidden) {
            return null;
          }
          return (
            <button
              key={item.id}
              onClick={() => {
                  setActiveView(item.id);
                  if (isSheetOpen) setIsSheetOpen(false);
              }}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                activeView === item.id && 'bg-muted text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h2 className="font-semibold text-lg">Admin Panel</h2>
          </div>
          <div className="flex-1">
            <SideNav />
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Admin Panel</SheetTitle>
                  <SheetDescription asChild><span className="sr-only">Main Navigation</span></SheetDescription>
                </SheetHeader>
                <div className="flex-1 py-4">
                    <SideNav />
                </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold capitalize">{activeView.replace('-', ' ')}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {activeView === 'dashboard' && (
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
            )}

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
                            <TableCell className="font-medium"><div className="flex items-center gap-4"><Image src={car.images[0] || 'https://placehold.co/64x48.png'} alt={car.model || 'car'} width={64} height={48} className="rounded-md object-cover" data-ai-hint="car exterior"/><div>{car.brand} {car.model} ({car.year})<div className="text-xs text-muted-foreground">{car.color}</div></div></div></TableCell>
                            <TableCell>{usersState.find(u => u.id === car.submittedBy)?.name || car.submittedBy.substring(0,5)}</TableCell>
                            <TableCell>{car.price ? `₹${car.price.toLocaleString('en-IN')}` : 'N/A'}</TableCell>
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
                    <CardHeader className="flex-row justify-between items-center">
                        <CardTitle>All Car Listings</CardTitle>
                        <div className="flex gap-2">
                           <Button onClick={() => setIsImportModalOpen(true)} variant="outline"><Upload className="mr-2 h-4 w-4"/> Import CSV</Button>
                           <Button onClick={() => handleOpenCarForm(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add Car</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Car</TableHead><TableHead>Price</TableHead><TableHead>Badges</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {isLoading.cars ? <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                        carsState.map(car => (
                            <TableRow key={car.id}>
                            <TableCell className="font-medium">{car.brand} {car.model}</TableCell>
                            <TableCell>{car.price ? `₹${car.price.toLocaleString('en-IN')}` : 'N/A'}</TableCell>
                            <TableCell>
                                <div className='flex gap-1'>
                                    {car.badges?.map(badge => <Badge key={badge} variant="secondary">{badge}</Badge>)}
                                </div>
                            </TableCell>
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
                    <CardHeader className="flex-row justify-between items-center">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage staff and customer accounts.</CardDescription>
                      </div>
                      <Button onClick={() => handleOpenUserForm(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add User</Button>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="staff">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="staff">Staff</TabsTrigger>
                                <TabsTrigger value="customers">Customers</TabsTrigger>
                            </TabsList>
                            <TabsContent value="staff" className="mt-4">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Performance</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                    {isLoading.users ? <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                                    allStaff.map(u => (
                                        <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell><Badge variant={roleDisplay[u.role]?.variant}>{roleDisplay[u.role]?.name}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant={u.status === 'Online' ? 'default' : 'outline'} className="gap-1">
                                                <span className={cn("h-2 w-2 rounded-full", u.status === 'Online' ? 'bg-green-500' : 'bg-gray-400')}></span>
                                                {u.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{u.performanceScore || 0}/10</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenUserForm(u)} disabled={u.role === 'admin' && user?.role !== 'admin'}><Edit size={16}/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handlePasswordReset(u.email)}><KeyRound size={16} /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'user', id: u.id, description: `This will delete the user record for ${u.name}.`})} disabled={u.role === 'admin'}><Trash2 size={16}/></Button>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                             <TabsContent value="customers" className="mt-4">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Subscribed</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                    {isLoading.users ? <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow> :
                                    allCustomers.map(u => (
                                        <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell><Badge variant={u.banned ? 'destructive' : 'default'} className="capitalize">{u.banned ? 'Banned' : 'Active'}</Badge></TableCell>
                                        <TableCell>{u.newsletterSubscribed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenUserForm(u)}><Edit size={16}/></Button>
                                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleToggleBan(u.id, !!u.banned)}>
                                                {u.banned ? <CircleOff className="mr-2 h-4 w-4"/> : <Ban className="mr-2 h-4 w-4"/>}
                                                {u.banned ? 'Unban' : 'Ban'}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handlePasswordReset(u.email)}><KeyRound size={16} /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'user', id: u.id, description: `This will delete the user record for ${u.name}.`})}><Trash2 size={16}/></Button>
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}

             {activeView === 'brands' && (
                <Card>
                    <CardHeader className="flex-row justify-between items-center">
                        <CardTitle>Brand Management</CardTitle>
                        <Button onClick={() => handleOpenBrandForm(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add Brand</Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Logo</TableHead>
                                    <TableHead>Brand Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading.brands ? <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                                brandsData.map(brand => (
                                    <TableRow key={brand.id}>
                                        <TableCell>
                                            <Image src={brand.logoUrl || 'https://placehold.co/64x32.png'} alt={`${brand.name} logo`} width={64} height={32} className="object-contain"/>
                                        </TableCell>
                                        <TableCell className="font-medium">{brand.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenBrandForm(brand)}><Edit size={16}/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({type: 'brand', id: brand.id, description: `This will permanently delete the brand '${brand.name}'.`})}><Trash2 size={16}/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeView === 'attendance' && user?.role === 'admin' && (
              <AttendanceTracker employees={allStaff} />
            )}

            {activeView === 'employees' && user?.role === 'admin' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Employees</CardTitle>
                        <CardDescription>Monitor employee status, attendance, and scores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Performance Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading.users ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                                allStaff.filter(s => s.role.startsWith('employee')).map(emp => (
                                    <TableRow key={emp.id}>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.status === 'Online' ? 'default' : 'outline'} className="gap-1">
                                                <span className={cn("h-2 w-2 rounded-full", emp.status === 'Online' ? 'bg-green-500' : 'bg-gray-400')}></span>
                                                {emp.status}
                                            </Badge>
                                        </TableCell>
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

            {activeView === 'notifications' && user?.role === 'admin' && (
              <NotificationsPanel allUsers={usersState} currentUser={user}/>
            )}

            {activeView === 'newsletter' && user?.role === 'admin' && (
                <NewsletterPanel subscribers={newsletterSubscribers} />
            )}

            {activeView === 'filters' && (
                <Tabs defaultValue="brands" className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="brands">Brands</TabsTrigger>
                            <TabsTrigger value="models">Models</TabsTrigger>
                            <TabsTrigger value="years">Years</TabsTrigger>
                        </TabsList>
                         <Button size="sm" onClick={() => handleOpenFilterForm('category', null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Brand
                        </Button>
                    </div>
                    <TabsContent value="brands">
                        <Card>
                             <CardHeader>
                                <CardTitle>Brand Management</CardTitle>
                                <CardDescription>Add, edit, or delete car brands.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Brand Name</TableHead>
                                            <TableHead>No. of Models</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading.filters ? <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                                            brandsState.map(brand => (
                                                <TableRow key={brand}>
                                                    <TableCell className="font-medium">{brand}</TableCell>
                                                    <TableCell>{(modelsState[brand] || []).length}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('category', {name: brand})}><Edit size={16} /></Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({ type: 'filterCategory', id: brand, description: `This will delete the '${brand}' brand and all its models.` })}><Trash2 size={16} /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="models">
                         <Card>
                            <CardHeader>
                                <CardTitle>Model Management</CardTitle>
                                <CardDescription>Manage models within each brand. New models are added automatically when a new car is created.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isLoading.filters ? <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : brandsState.map(brand => (
                                    <div key={brand}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold">{brand}</h3>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenFilterForm('value', null, brand)}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Model
                                            </Button>
                                        </div>
                                        {(modelsState[brand] || []).length > 0 ? (
                                            <div className="rounded-lg border">
                                                <Table>
                                                    <TableBody>
                                                        {modelsState[brand].map(model => (
                                                            <TableRow key={model}>
                                                                <TableCell>{model}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenFilterForm('value', model, brand)}><Edit size={16} /></Button>
                                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({ type: 'filterValue', id: model, categoryId: brand, description: `This will delete the model '${model}' from '${brand}'.`})}><Trash2 size={16} /></Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : <p className="text-sm text-muted-foreground text-center py-4">No models added for this brand yet.</p>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="years">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Year Management</CardTitle>
                                    <CardDescription>Add or remove manufacturing years.</CardDescription>
                                </div>
                                 <Button size="sm" onClick={() => handleOpenFilterForm('year', null)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Year
                                 </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Year</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading.filters ? <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
                                            yearsState.map(year => (
                                                <TableRow key={year}>
                                                    <TableCell className="font-medium">{year}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItemToDelete({ type: 'filterYear', id: year, description: `This will delete the year '${year}'.` })}><Trash2 size={16} /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </main>
      </div>

        {/* --- Dialogs & Alerts --- */}

        <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{userToEdit ? 'Edit User' : 'Add New User'}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} disabled={!!userToEdit} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@malluvandi.com" {...field} disabled={!!userToEdit} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="employee-a">Content Editor</SelectItem>
                                        <SelectItem value="employee-b">Sales & Support</SelectItem>
                                        <SelectItem value="customer">Customer</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                        {(form.watch('role')?.startsWith('employee')) && (
                             <FormField control={form.control} name="performanceScore" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Performance Score (out of 10)</FormLabel>
                                    <FormControl><Input type="number" min="0" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} value={field.value || 0}/></FormControl>
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
                    <FormFieldItem label="Brand" name="brand" as="select" options={brandsState} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedBrandForModel(e.target.value)} required defaultValue={carToEdit?.brand} />
                     <div className="grid grid-cols-4 items-center gap-4 col-span-2 -mb-2">
                        <Label htmlFor="model" className="text-right">Model</Label>
                        <Input id="model" name="model" required className="col-span-3" defaultValue={carToEdit?.model} />
                    </div>
                    <FormFieldItem label="Manufactured Year" name="year" type="number" defaultValue={carToEdit?.year} />
                    <FormFieldItem label="Expected Price (₹)" name="price" type="number" defaultValue={carToEdit?.price} />
                    <FormFieldItem label="Engine CC" name="engineCC" type="number" defaultValue={carToEdit?.engineCC} />
                    <FormFieldItem label="Fuel" name="fuel" as="select" options={['Petrol', 'Diesel', 'Electric']} defaultValue={carToEdit?.fuel} />
                    <FormFieldItem label="Transmission" name="transmission" as="select" options={['Automatic', 'Manual']} defaultValue={carToEdit?.transmission} />
                    <FormFieldItem label="KM Driven" name="kmRun" type="number" defaultValue={carToEdit?.kmRun} />
                    <FormFieldItem label="Colour" name="color" defaultValue={carToEdit?.color} />
                    <FormFieldItem label="Ownership" name="ownership" type="number" defaultValue={carToEdit?.ownership} />
                </div>
                <FormFieldItem label="Additional Details" name="details" as="textarea" placeholder="Include insurance details, challans, etc." defaultValue={carToEdit?.additionalDetails} />
                <FormFieldItem label="Badges" name="badges" placeholder="e.g. Featured, Price Drop" defaultValue={carToEdit?.badges?.join(', ')} />
                <FormFieldItem label="Instagram Reel URL" name="instagramReelUrl" placeholder="https://www.instagram.com/reel/..." defaultValue={carToEdit?.instagramReelUrl} />
                <FormFieldItem label="Status" name="status" as="select" defaultValue={carToEdit?.status || 'pending'} options={['pending', 'approved', 'rejected']} required />
                <div className="space-y-2">
                  <Label>Image URLs</Label>
                  <div className="flex gap-2">
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
                    <Button type="button" onClick={handleAddImageUrl}>Add</Button>
                  </div>
                  <div className="space-y-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <Input value={url} readOnly className="flex-1" />
                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveImageUrl(url)}><Trash2 size={16}/></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter><Button type="button" variant="ghost" onClick={() => setIsCarFormOpen(false)}>Cancel</Button><Button type="submit">Save Car</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isBrandFormOpen} onOpenChange={setIsBrandFormOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{brandToEdit ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onBrandSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Brand Name</Label>
                        <Input id="name" name="name" defaultValue={brandToEdit?.name} required />
                    </div>
                    <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" name="logoUrl" defaultValue={brandToEdit?.logoUrl} required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsBrandFormOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Brand</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

         <Dialog open={isFilterFormOpen.isOpen} onOpenChange={() => setIsFilterFormOpen({type: 'category', isOpen: false})}>
            <DialogContent>
                <DialogHeader><DialogTitle>{filterToEdit ? 'Edit' : 'Add'} {isFilterFormOpen.type.charAt(0).toUpperCase() + isFilterFormOpen.type.slice(1)}</DialogTitle></DialogHeader>
                 <form className="space-y-4" onSubmit={onFilterSubmit}>
                    <div>
                        <Label>{isFilterFormOpen.type === 'category' ? 'Brand Name' : isFilterFormOpen.type === 'value' ? 'Model Name' : 'Year'}</Label>
                        <Input name="name" defaultValue={(filterToEdit?.value as any)?.name || filterToEdit?.value || ''} required type={isFilterFormOpen.type === 'year' ? 'number' : 'text'}/>
                    </div>
                    <DialogFooter><Button type="button" variant="ghost" onClick={() => setIsFilterFormOpen({type: 'category', isOpen: false})}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
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
        <ImportCarsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} currentUser={user}/>
    </div>
  );
}

const FormFieldItem = ({label, name, as = 'input', options, ...props}: {label: string, name: string, as?: 'input' | 'textarea' | 'select', options?: any[]} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.SelectHTMLAttributes<HTMLSelectElement>) => {
    const commonProps = {id: name, name, className: "col-span-3", ...props};
    const renderField = () => {
        if (as === 'textarea') return <Textarea {...commonProps} />;
        if (as === 'select') {
          const selectProps = props as React.SelectHTMLAttributes<HTMLSelectElement>;
          return (
            <Select name={name} value={selectProps.value as string | undefined} defaultValue={selectProps.defaultValue as string | undefined} onValueChange={(value) => {
              if (selectProps.onChange) {
                  const event = { target: { value: value, name: name } } as unknown as React.ChangeEvent<HTMLSelectElement>;
                  selectProps.onChange(event);
              }
            }} disabled={props.disabled} required={props.required}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>{(options || []).map(o => <SelectItem key={o} value={o}>{o.toString().charAt(0).toUpperCase() + o.toString().slice(1)}</SelectItem>)}</SelectContent>
            </Select>
        );
      }
      return <Input {...commonProps} />;
    };
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={name} className="text-right">{label}</Label>
            {renderField()}
        </div>
    )
}

function AttendanceTracker({ employees }: { employees: User[] }) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const selectedEmployee = useMemo(() => employees.find(e => e.id === selectedEmployeeId), [employees, selectedEmployeeId]);
    const attendanceData = useMemo(() => {
        const data: { [key: string]: AttendanceRecord } = {};
        selectedEmployee?.attendance?.forEach(rec => {
            data[format(parseISO(rec.date), 'yyyy-MM-dd')] = rec;
        });
        return data;
    }, [selectedEmployee]);
    
    const selectedDayRecord = selectedDate ? attendanceData[format(selectedDate, 'yyyy-MM-dd')] : null;

    const statusColors = {
        present: 'bg-green-100 text-green-800',
        'paid-leave': 'bg-blue-100 text-blue-800',
        'unpaid-leave': 'bg-yellow-100 text-yellow-800',
        absent: 'bg-red-100 text-red-800',
    };
    
    const DayComponent = ({ date }: { date: Date }) => {
        const record = attendanceData[format(date, 'yyyy-MM-dd')];
        const baseClasses = 'h-full w-full flex items-center justify-center rounded-full';
        const colorClass = record ? statusColors[record.status] : '';
        const selectedClass = isSameDay(date, selectedDate || new Date(0)) ? 'ring-2 ring-primary ring-offset-2' : '';
        return <div className={cn(baseClasses, colorClass, selectedClass)}>{format(date, 'd')}</div>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Tracker</CardTitle>
                <CardDescription>View employee attendance records by month.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Label htmlFor="employee-select">Select Employee</Label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger id="employee-select">
                            <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <div className="mt-6 space-y-4">
                        <h3 className="font-semibold">Legend</h3>
                        <div className="space-y-2 text-sm">
                           {Object.entries(statusColors).map(([status, className]) => (
                               <div key={status} className="flex items-center gap-2">
                                   <div className={cn('h-4 w-4 rounded-full', className.split(' ')[0])} />
                                   <span className="capitalize">{status.replace('-', ' ')}</span>
                               </div>
                           ))}
                        </div>
                    </div>
                     <div className="mt-6">
                         {selectedDayRecord ? (
                             <Card className="bg-muted/50">
                                 <CardHeader className="pb-2"><CardTitle className="text-base">Details for {format(selectedDate!, 'MMMM d')}</CardTitle></CardHeader>
                                 <CardContent className="text-sm space-y-1">
                                    <p><strong>Status:</strong> <span className="capitalize">{selectedDayRecord.status.replace('-', ' ')}</span></p>
                                    {selectedDayRecord.hoursWorked && <p><strong>Hours Worked:</strong> {selectedDayRecord.hoursWorked}</p>}
                                    {selectedDayRecord.reason && <p><strong>Reason:</strong> {selectedDayRecord.reason}</p>}
                                 </CardContent>
                             </Card>
                         ) : selectedDate && isSameMonth(selectedDate, currentMonth) ? (
                              <Card className="bg-muted/50"><CardContent className="p-4 text-center text-sm text-muted-foreground">No record for this day.</CardContent></Card>
                         ) : null}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                       <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft/></Button>
                       <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                       <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight/></Button>
                    </div>
                     <Calendar
                        mode="single"
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        selected={selectedDate || undefined}
                        onSelect={(day) => setSelectedDate(day || null)}
                        components={{ Day: DayComponent }}
                        className="rounded-md border"
                        classNames={{
                           day_outside: 'text-muted-foreground opacity-50',
                           day: 'h-12 w-12 rounded-full',
                        }}
                     />
                </div>
            </CardContent>
        </Card>
    );
}

function NotificationsPanel({ allUsers, currentUser }: { allUsers: User[]; currentUser: User | null }) {
    const { toast } = useToast();
    const [recipient, setRecipient] = useState('all');
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (!message.trim() || !currentUser) {
            toast({ title: 'Error', description: 'Message cannot be empty.', variant: 'destructive'});
            return;
        }

        try {
            await addDoc(collection(db, 'notifications'), {
                message: message.trim(),
                recipientGroup: recipient,
                createdAt: new Date().toISOString(),
                createdBy: currentUser.id,
            });
            toast({ title: 'Notification Sent!', description: `Message sent to: ${recipient}`});
            setMessage('');
        } catch (error) {
            console.error('Error sending notification:', error);
            toast({ title: 'Error', description: 'Could not send notification.', variant: 'destructive'});
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>Send a message to users or staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="recipient">Recipient Group</Label>
                    <Select value={recipient} onValueChange={setRecipient}>
                        <SelectTrigger id="recipient">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="all-staff">All Staff</SelectItem>
                            <SelectItem value="all-customers">All Customers</SelectItem>
                            <SelectItem value="employee-a">Content Editors</SelectItem>
                            <SelectItem value="employee-b">Sales & Support</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                        id="message" 
                        placeholder="Type your notification message here..." 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={5}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSend}>Send Notification</Button>
            </CardFooter>
        </Card>
    )
}

function NewsletterPanel({ subscribers }: { subscribers: User[]}) {
    const { toast } = useToast();
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSendEmail = () => {
        if (!subject.trim() || !body.trim()) {
            toast({ title: 'Error', description: 'Subject and body cannot be empty.', variant: 'destructive'});
            return;
        }
        // In a real app, this would trigger a backend function to send emails
        console.log(`Sending email to ${subscribers.length} subscribers. Subject: ${subject}`);
        toast({ title: 'Email Sent!', description: `Newsletter sent to ${subscribers.length} subscribers.`});
        setSubject('');
        setBody('');
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>Compose and send an email to all {subscribers.length} newsletter subscribers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Exciting New Cars in Stock!" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="body">Email Body</Label>
                    <Textarea 
                        id="body" 
                        placeholder="Dear subscriber, we have some great new offers for you..." 
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        rows={10}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSendEmail}>Send Email</Button>
            </CardFooter>
        </Card>
    );
}
    

    
