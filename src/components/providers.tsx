'use client';

import React from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <AuthProvider>{children}</AuthProvider>
    </NextThemesProvider>
  )
}
