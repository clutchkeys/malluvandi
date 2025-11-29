
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { GeistSans } from 'geist/font/sans';
import { CookieConsent } from '@/components/cookie-consent';
import { SplashScreen } from '@/components/splash-screen';
import { AiChatPopup } from '@/components/ai-chat-popup';
import { AuthProvider } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/server';
import React from 'react';

export const metadata: Metadata = {
  title: 'Mallu Vandi - Trusted Used Cars in Kerala',
  description: 'Buy and sell top-quality, certified pre-owned cars in Kerala. Explore hundreds of listings for Swift, Creta, Nexon, and more with Mallu Vandi, your trusted used car marketplace.',
  keywords: ['used cars kerala', 'second hand cars kochi', 'pre-owned cars', 'mallu vandi', 'buy used car', 'sell used car', 'used car dealership'],
};

async function getAppearanceSettings() {
    const supabase = createClient();
    const { data } = await supabase
        .from('config')
        .select('appearance')
        .eq('id', 'singleton')
        .single();
    return data?.appearance as { logoUrl?: string; coverImageUrl?: string; aboutImageUrl?: string; googleAdsenseId?: string; } | null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearance = await getAppearanceSettings();

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { appearance });
    }
    return child;
  });

  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.className}>
      <head>
         {appearance?.googleAdsenseId && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${appearance.googleAdsenseId}`} crossOrigin="anonymous"></script>
        )}
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        <Providers>
          <AuthProvider>
            <SplashScreen />
            {childrenWithProps}
            <Toaster />
            <CookieConsent />
            <AiChatPopup />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
