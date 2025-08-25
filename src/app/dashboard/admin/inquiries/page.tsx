
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Inquiry, User } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { InquiryActions } from '@/components/inquiry-actions';

async function getInquiries(): Promise<Inquiry[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('inquiries')
        .select(`
            *,
            profiles:assignedTo ( name )
        `)
        .order('submittedAt', { ascending: false });

    if (error) {
        console.error('Error fetching inquiries:', error);
        return [];
    }
    
    // The type from generated Supabase types might be complex, so we cast it.
    return data.map(item => ({
        ...item,
        assignedTo_name: (item.profiles as any)?.name || 'Unassigned'
    })) as Inquiry[];
}

async function getSalesStaff(): Promise<User[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee-b');

    if (error) {
        console.error('Error fetching sales staff:', error);
        return [];
    }
    return data as User[];
}

export default async function AdminInquiriesPage() {
    const inquiries = await getInquiries();
    const salesStaff = await getSalesStaff();

    const getStatusVariant = (status: string) => {
        switch (status) {
        case 'new': return 'default';
        case 'contacted': return 'secondary';
        case 'closed': return 'outline';
        default: return 'outline';
        }
    };
    
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Manage Inquiries</CardTitle>
          <CardDescription>View and assign customer inquiries to the sales team.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Car</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inquiries.map(inquiry => (
                        <TableRow key={inquiry.id}>
                            <TableCell className="font-medium">{inquiry.carSummary}</TableCell>
                            <TableCell>{inquiry.customerName}</TableCell>
                            <TableCell>{inquiry.customerPhone}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(inquiry.status)} className="capitalize">{inquiry.status}</Badge></TableCell>
                            <TableCell>{(inquiry as any).assignedTo_name || 'Unassigned'}</TableCell>
                            <TableCell>{format(parseISO(inquiry.submittedAt), 'dd MMM, yyyy')}</TableCell>
                            <TableCell className="text-right">
                                <InquiryActions inquiryId={inquiry.id} salesStaff={salesStaff} currentAssigneeId={inquiry.assignedTo} />
                            </TableCell>
                        </TableRow>
                    ))}
                     {inquiries.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">No inquiries found.</TableCell>
                         </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
