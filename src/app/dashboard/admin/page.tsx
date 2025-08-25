

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AdminPage() {
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your admin dashboard. You can manage listings, users, and inquiries from here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
