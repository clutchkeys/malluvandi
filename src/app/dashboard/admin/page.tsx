
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car, MessageSquare, Users, Hourglass } from 'lucide-react';

export const revalidate = 10; // Revalidate data every 10 seconds

async function getStats() {
  const supabase = createClient();

  const { count: totalCars } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true });

  const { count: pendingApprovals } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
    
  const { count: activeInquiries } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .in('status', ['new', 'contacted']);

  return {
    totalCars: totalCars ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    activeInquiries: activeInquiries ?? 0,
  };
}


export default async function AdminPage() {
  const { totalCars, pendingApprovals, activeInquiries } = await getStats();

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Cars" value={totalCars} icon={Car} />
        <StatCard title="Pending Approvals" value={pendingApprovals} icon={Hourglass} />
        <StatCard title="Active Inquiries" value={activeInquiries} icon={MessageSquare} />
        <StatCard title="Total Users" value={0} icon={Users} description="Connect to backend" />
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>An overview of recent user signups and inquiries.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Chart will be displayed here.</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
             <CardDescription>The latest cars submitted for approval.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Recent listings will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
