
export type Role = 'admin' | 'manager' | 'employee-a' | 'employee-b' | 'customer';

export type CarBadge = 'price_drop' | 'new' | 'featured';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'present' | 'paid-leave' | 'unpaid-leave' | 'absent';
  hoursWorked?: number;
  reason?: string;
}

export interface User {
  id: string; // Firebase Auth UID or mock ID
  name: string;
  email: string;
  phone: string;
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
  year: number;
  color: string;
  kmRun: number;
  ownership: number;
  insurance: string;
  challans: string;
  additionalDetails: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string; // EmployeeA ID
  price: number;
  badges?: CarBadge[];
}

export interface Inquiry {
  id: string;
  carId: string;
  customerName: string;
  customerPhone: string;
  submittedAt: string; // ISO 8601 date string
  assignedTo: string; // EmployeeB ID
  status: 'new' | 'contacted' | 'closed';
  remarks: string; // Visible to admin
  privateNotes: string; // Visible only to EmployeeB
  carSummary?: string; // e.g. "Maruti Suzuki Swift"
}
