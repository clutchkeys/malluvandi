

'use client';

import React, 'react';
import { Loader2 } from 'lucide-react';


export default function AdminPage() {
  
  return (
    <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Backend disconnected. Please connect to a new backend.</p>
    </div>
  );
}
