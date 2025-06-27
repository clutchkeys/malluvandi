import type { User, Car, Inquiry, Role, CarBadge } from './types';

export const users: User[] = [
  { id: 'user-admin-1', name: 'Admin', email: 'dukaanflow@gmail.com', role: 'admin', password: 'password' },
  { id: 'user-manager-1', name: 'Manager', email: 'manager@malluvandi.com', role: 'manager', password: 'password' },
  { id: 'user-emp-a-1', name: 'Aisha', email: 'aisha@malluvandi.com', role: 'employee-a', password: 'password' },
  { id: 'user-emp-a-2', name: 'Balan', email: 'balan@malluvandi.com', role: 'employee-a', password: 'password' },
  { id: 'user-emp-b-1', name: 'Chacko', email: 'chacko@malluvandi.com', role: 'employee-b', password: 'password' },
  { id: 'user-emp-b-2', name: 'Devi', email: 'devi@malluvandi.com', role: 'employee-b', password: 'password' },
  { id: 'user-cust-1', name: 'Rahul', email: 'rahul@customer.com', role: 'customer', password: 'password' },
];

export const carBrands: string[] = ['Maruti Suzuki', 'Hyundai', 'Toyota', 'Honda', 'Tata'];

export const carModels: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Alto'],
  'Hyundai': ['i20', 'Creta', 'Venue', 'Verna'],
  'Toyota': ['Innova Crysta', 'Fortuner', 'Glanza'],
  'Honda': ['City', 'Amaze'],
  'Tata': ['Nexon', 'Altroz', 'Harrier']
};

export const carYears: number[] = [2023, 2022, 2021, 2020, 2019, 2018];

export const carBadges: CarBadge[] = ['price_drop', 'new', 'featured'];

export let cars: Car[] = [
  {
    id: 'car-1',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    year: 2021,
    color: 'Red',
    kmRun: 25000,
    ownership: 1,
    insurance: 'Comprehensive, valid till Oct 2024',
    challans: 'None',
    additionalDetails: 'Excellent condition, single owner, regularly serviced at authorized service center. Includes seat covers and floor mats.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user-emp-a-1',
    price: 650000,
    badges: ['price_drop', 'featured'],
  },
  {
    id: 'car-2',
    brand: 'Hyundai',
    model: 'Creta',
    year: 2020,
    color: 'White',
    kmRun: 45000,
    ownership: 2,
    insurance: 'Third Party, valid till Dec 2024',
    challans: 'One pending for speeding.',
    additionalDetails: 'Top model with sunroof. Second owner. Minor scratches on the left side bumper.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user-emp-a-2',
    price: 1200000,
  },
  {
    id: 'car-3',
    brand: 'Toyota',
    model: 'Innova Crysta',
    year: 2019,
    color: 'Silver',
    kmRun: 80000,
    ownership: 1,
    insurance: 'Comprehensive, valid till Jan 2025',
    challans: 'None',
    additionalDetails: '7-seater, perfect for families. Well-maintained.',
    images: ['https://placehold.co/600x400.png'],
    status: 'pending',
    submittedBy: 'user-emp-a-1',
    price: 1800000,
  },
  {
    id: 'car-4',
    brand: 'Tata',
    model: 'Nexon',
    year: 2022,
    color: 'Blue',
    kmRun: 15000,
    ownership: 1,
    insurance: 'Comprehensive, valid till Mar 2025',
    challans: 'None',
    additionalDetails: 'Almost new condition. 5-star safety rating.',
    images: ['https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'user-emp-a-2',
    price: 900000,
    badges: ['new'],
  },
  {
    id: 'car-5',
    brand: 'Honda',
    model: 'City',
    year: 2018,
    color: 'Black',
    kmRun: 60000,
    ownership: 1,
    insurance: 'Expired',
    challans: 'None',
    additionalDetails: 'Classic sedan, smooth engine. Insurance needs to be renewed.',
    images: ['https://placehold.co/600x400.png'],
    status: 'rejected',
    submittedBy: 'user-emp-a-1',
    price: 750000,
  },
];

export const approvedCars = cars.filter(c => c.status === 'approved');

export let inquiries: Inquiry[] = [
    {
        id: 'inq-1',
        carId: 'car-1',
        customerName: 'Ramesh Kumar',
        customerPhone: '9876543210',
        submittedAt: new Date('2024-05-20T10:00:00Z'),
        assignedTo: 'user-emp-b-1',
        status: 'contacted',
        remarks: 'Customer is interested, planning a test drive on Saturday. They are looking for a car under 7 lakhs and this fits their budget. They have a few questions about the service history which I have addressed. Seems promising.',
        privateNotes: 'Seems like a serious buyer, follow up on Friday.'
    },
    {
        id: 'inq-2',
        carId: 'car-2',
        customerName: 'Suresh Menon',
        customerPhone: '9876543211',
        submittedAt: new Date('2024-05-21T14:30:00Z'),
        assignedTo: 'user-emp-b-2',
        status: 'new',
        remarks: '',
        privateNotes: ''
    }
];
