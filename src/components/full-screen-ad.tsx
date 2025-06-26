'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';

interface FullScreenAdProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenAd({ isOpen, onClose }: FullScreenAdProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 max-w-4xl w-full h-[80vh] bg-transparent shadow-none flex items-center justify-center">
        <div className="relative w-full h-full bg-card rounded-lg overflow-hidden flex flex-col items-center justify-center text-center">
            <Image 
                src="https://placehold.co/800x600.png" 
                alt="Advertisement" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="advertisement product"
            />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={countdown > 0}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white rounded-full z-10"
          >
            {countdown > 0 ? countdown : <X className="h-6 w-6" />}
          </Button>
          <div className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded-md text-xs z-10">
            Advertisement
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
