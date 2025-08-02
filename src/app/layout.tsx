
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import * as React from 'react';
import { ModulesProvider } from '@/context/modules-context';
import { getAppSettings, getCompanyProfile, getCurrencies } from '@/lib/db';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [appSettings, allCurrencies, companyProfile] = await Promise.all([
    getAppSettings(),
    getCurrencies(),
    getCompanyProfile(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ModulesProvider 
          serverAppSettings={appSettings} 
          serverCurrencies={allCurrencies} 
          serverCompanyProfile={companyProfile}
        >
          <DashboardLayout companyProfile={companyProfile}>
            {children}
          </DashboardLayout>
        </ModulesProvider>
        <Toaster />
      </body>
    </html>
  );
}
