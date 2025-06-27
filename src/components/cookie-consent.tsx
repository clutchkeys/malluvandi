'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('cookie_consent') !== 'true') {
        setShowConsent(true);
      }
    } catch (e) {
      // If localStorage is not available, we can't store consent,
      // so we don't show the banner.
    }
  }, []);

  const acceptConsent = () => {
    setShowConsent(false);
    try {
      localStorage.setItem('cookie_consent', 'true');
    } catch (e) {
      // If localStorage is not available, we can't store consent.
    }
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="pointer-events-auto mx-auto max-w-xl p-4">
        <div className="rounded-lg border bg-background/80 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 flex-shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience. By clicking "Accept", you consent to our use of cookies. Read our{' '}
                <Link href="/privacy" className="font-semibold underline hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <Button size="sm" onClick={acceptConsent}>
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
