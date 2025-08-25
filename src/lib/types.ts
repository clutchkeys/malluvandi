

export type Role = 'admin' | 'manager' | 'employee-a' | 'employee-b' | 'customer';

export type CarBadge = 'price_drop' | 'new' | 'featured';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'present' | 'paid-leave' | 'unpaid-leave' | 'absent';
  hoursWorked?: number;
  reason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status?: 'Online' | 'Offline';
  attendance?: AttendanceRecord[];
  performanceScore?: number;
  newsletterSubscribed?: boolean;
  banned?: boolean;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year?: number;
  price?: number;
  kmRun?: number;
  fuel?: 'Petrol' | 'Diesel' | 'Electric';
  transmission?: 'Automatic' | 'Manual';
  ownership?: number;
  color?: string;
  engineCC?: number;
  additionalDetails?: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string; // User ID
  badges?: string[];
  instagramReelUrl?: string;
  createdAt?: string; // ISO 8601 date string
}

export interface Inquiry {
  id:string;
  carId: string;
  carSummary: string;
  customerId: string; // User ID
  customerName: string;
  customerPhone: string;
  submittedAt: string; // ISO 8601 date string
  assignedTo: string | null; // EmployeeB ID
  status: 'new' | 'contacted' | 'closed';
  remarks?: string; // Visible to admin
  privateNotes?: string; // Visible only to EmployeeB
  isSeriousCustomer?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  recipientGroup: 'all-staff' | 'all-customers' | 'employee-a' | 'employee-b';
  link?: string;
  createdAt: string; // ISO 8601 date string
  createdBy: string; // User ID
}

export interface Brand {
    id: string;
    name: string;
    logoUrl: string;
}
