
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminInquiriesPage() {
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Manage Inquiries</CardTitle>
          <CardDescription>View and assign customer inquiries to the sales team.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading inquiries...</p>
        </CardContent>
      </Card>
    </div>
  );
}
