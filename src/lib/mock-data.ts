import type { User, Car, Inquiry } from './types';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'admin-01', name: 'Adithya', email: 'admin@malluvandi.com', role: 'admin' },
  { id: 'manager-01', name: 'Ashitha', email: 'manager@malluvandi.com', role: 'manager' },
  { id: 'empA-01', name: 'Arjun', email: 'employee.a@malluvandi.com', role: 'employee-a' },
  { id: 'empB-01', name: 'Bhavana', email: 'employee.b@malluvandi.com', role: 'employee-b' },
  { id: 'empB-02', name: 'Ben', email: 'ben.b@malluvandi.com', role: 'employee-b' },
  { id: 'cust-01', name: 'Charles', email: 'customer@test.com', role: 'customer' },
];

// Mock Brands, Models, Years
export const MOCK_BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota'];
export const MOCK_MODELS: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Brezza', 'Ertiga'],
  'Hyundai': ['i20', 'Venue', 'Creta', 'Verna', 'Grand i10'],
  'Tata': ['Nexon', 'Punch', 'Altroz', 'Harrier', 'Safari'],
  'Mahindra': ['XUV700', 'Thar', 'Scorpio-N', 'XUV300'],
  'Kia': ['Seltos', 'Sonet', 'Carnival'],
  'Toyota': ['Innova Crysta', 'Fortuner', 'Glanza'],
};
export const MOCK_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];


// Mock Cars
export const MOCK_CARS: Car[] = [
  {
    id: 'car-01',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    year: 2022,
    color: 'Red',
    kmRun: 15000,
    ownership: 1,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: 'Excellent condition, single owner, regularly serviced at authorized service center. No modifications.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'empA-01',
    price: 750000,
    badges: ['featured', 'price_drop'],
  },
  {
    id: 'car-02',
    brand: 'Hyundai',
    model: 'Creta',
    year: 2021,
    color: 'White',
    kmRun: 25000,
    ownership: 1,
    insurance: 'Third Party',
    challans: '1 pending for speeding',
    additionalDetails: 'Top model with sunroof. Minor scratch on the left rear door. All papers clear.',
    images: ['https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'empA-01',
    price: 1400000,
    badges: ['featured'],
  },
  {
    id: 'car-03',
    brand: 'Tata',
    model: 'Nexon',
    year: 2023,
    color: 'Blue',
    kmRun: 8000,
    ownership: 1,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: 'Almost new condition. Fancy number plate. All accessories included.',
    images: ['https://placehold.co/600x400.png'],
    status: 'pending',
    submittedBy: 'empA-01',
    price: 1150000,
    badges: ['new'],
  },
  {
    id: 'car-04',
    brand: 'Mahindra',
    model: 'Thar',
    year: 2022,
    color: 'Black',
    kmRun: 12000,
    ownership: 2,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: '4x4 variant. Off-road tires installed. Maintained very well.',
    images: ['https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'empA-01',
    price: 1600000,
  },
   {
    id: 'car-05',
    brand: 'Kia',
    model: 'Seltos',
    year: 2020,
    color: 'Grey',
    kmRun: 35000,
    ownership: 1,
    insurance: 'Expired',
    challans: 'None',
    additionalDetails: 'GT Line variant. Needs new insurance policy. Otherwise in perfect running condition.',
    images: ['https://placehold.co/600x400.png'],
    status: 'rejected',
    submittedBy: 'empA-01',
    price: 1300000,
  },
  {
    id: 'car-06',
    brand: 'Toyota',
    model: 'Innova Crysta',
    year: 2019,
    color: 'Silver',
    kmRun: 65000,
    ownership: 1,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: '7-seater, well-maintained family car. Used for long trips only.',
    images: ['https://placehold.co/600x400.png'],
    status: 'approved',
    submittedBy: 'empA-01',
    price: 1800000,
    badges: ['price_drop']
  },
   {
    id: 'car-07',
    brand: 'Maruti Suzuki',
    model: 'Baleno',
    year: 2023,
    color: 'White',
    kmRun: 5000,
    ownership: 1,
    insurance: 'Comprehensive',
    challans: 'None',
    additionalDetails: 'Alpha model. Showroom condition. Selling due to relocation.',
    images: ['https://placehold.co/600x400.png'],
    status: 'pending',
    submittedBy: 'empA-01',
    price: 890000,
    badges: ['new']
  }
];

// Mock Inquiries
export const MOCK_INQUIRIES: Inquiry[] = [
    {
        id: 'inq-01',
        carId: 'car-01',
        customerName: 'Suresh Kumar',
        customerPhone: '9876543210',
        submittedAt: '2024-05-20T10:00:00Z',
        assignedTo: 'empB-01',
        status: 'contacted',
        remarks: 'Customer interested, planning a test drive on Saturday.',
        privateNotes: 'Follow up on Friday evening to confirm the test drive.',
        carSummary: 'Maruti Suzuki Swift'
    },
    {
        id: 'inq-02',
        carId: 'car-02',
        customerName: 'Priya Menon',
        customerPhone: '9123456780',
        submittedAt: '2024-05-21T11:30:00Z',
        assignedTo: 'empB-02',
        status: 'new',
        remarks: 'New inquiry received.',
        privateNotes: 'Check car availability before calling.',
        carSummary: 'Hyundai Creta'
    },
    {
        id: 'inq-03',
        carId: 'car-04',
        customerName: 'Rajesh Nair',
        customerPhone: '9988776655',
        submittedAt: '2024-05-19T15:00:00Z',
        assignedTo: 'empB-01',
        status: 'closed',
        remarks: 'Customer bought another car from a different dealer.',
        privateNotes: 'Price was too high for his budget.',
        carSummary: 'Mahindra Thar'
    }
];
