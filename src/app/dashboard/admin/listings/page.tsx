
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminListingsPage() {
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Manage Car Listings</CardTitle>
          <CardDescription>Review, approve, or reject car listings submitted by editors.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading listings...</p>
        </CardContent>
      </Card>
    </div>
  );
}
