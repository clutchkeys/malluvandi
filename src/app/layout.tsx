import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { GeistSans } from 'geist/font/sans';
import { CookieConsent } from '@/components/cookie-consent';
import { SplashScreen } from '@/components/splash-screen';
import { AiChatPopup } from '@/components/ai-chat-popup';


export const metadata: Metadata = {
  title: 'Mallu Vandi - AI-Powered Used Car Sales',
  description: 'Buy and sell pre-owned cars with Mallu Vandi.',
  icons: {
    icon: 'https://ik.imagekit.io/qctc8ch4l/malluvandinew_tSKcC79Yr?updatedAt=1751042574078',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.className}>
      <head />
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        <Providers>
          <SplashScreen />
          {children}
          <Toaster />
          <CookieConsent />
          <AiChatPopup />
        </Providers>
      </body>
    </html>
  );
}
