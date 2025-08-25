
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserRoleUpdater } from '@/components/user-role-updater';
import type { User } from '@/lib/types';


async function getUsers(): Promise<User[]> {
    const supabase = createClient();
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    return users as User[];
}


export default async function AdminUsersPage() {
    const users = await getUsers();

    const getRoleVariant = (role: string) => {
        switch (role) {
        case 'admin':
            return 'default';
        case 'manager':
            return 'default';
        case 'employee-a':
            return 'secondary';
        case 'employee-b':
            return 'secondary';
        case 'customer':
            return 'outline';
        default:
            return 'outline';
        }
    };
    
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all staff and customer accounts.</CardDescription>
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
                    {users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={getRoleVariant(user.role)} className="capitalize">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <UserRoleUpdater userId={user.id} currentRole={user.role} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
