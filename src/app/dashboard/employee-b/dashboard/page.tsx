
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EmployeeBDashboardPage() {
  
  return (
     <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your dashboard. You can view and manage customer inquiries from the 'Inquiries' page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
