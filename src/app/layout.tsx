
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { LogOut } from 'lucide-react';
import { ModulesProvider, useModules } from '@/context/modules-context';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const DashboardSidebarItems = dynamic(() => import('@/components/layout/dashboard-sidebar-items').then(mod => mod.DashboardSidebarItems), {
  ssr: false,
  loading: () => (
     <div className="p-2 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
     </div>
  ),
});


function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { companyProfile } = useModules();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
        </SidebarHeader>
        <SidebarContent>
          <DashboardSidebarItems />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
            <div className="flex w-full items-center">
                <div className="flex items-center gap-4 flex-1">
                    <SidebarTrigger className="md:hidden" />
                </div>
                
                <div className="flex items-center justify-center flex-1">
                   <div className="flex items-center gap-2">
                    {companyProfile?.logoUrl ? (
                        <Image src={companyProfile.logoUrl} alt={companyProfile.companyName} width={40} height={40} className="h-10 w-auto object-contain" data-ai-hint="logo company" />
                    ) : (
                       <Logo className="h-10 w-auto" />
                    )}
                   </div>
                </div>

                <div className="flex items-center gap-4 justify-end flex-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
                                <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">User Name</p>
                                    <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ModulesProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ModulesProvider>
        <Toaster />
      </body>
    </html>
  );
}
