

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EmployeeADashboardPage() {
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your dashboard. You can add and manage your car listings from the 'My Listings' page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
