export type Role = 'admin' | 'employee-a' | 'employee-b' | 'customer';

export type CarBadge = 'price_drop' | 'new' | 'featured';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string; // Should not be sent to client
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
  submittedAt: Date;
  assignedTo: string; // EmployeeB ID
  status: 'new' | 'contacted' | 'closed';
  remarks: string; // Visible to admin
  privateNotes: string; // Visible only to EmployeeB
}
