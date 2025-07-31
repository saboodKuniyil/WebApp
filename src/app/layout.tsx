
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Box, Calendar, LayoutDashboard, LogOut, Briefcase, ShoppingCart, Home, Package, Users, FileText, Landmark, Truck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ModulesProvider, useModules } from '@/context/modules-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';


function DashboardSidebarItems() {
  const pathname = usePathname();
  const { isProjectManagementEnabled, isPurchaseModuleEnabled } = useModules();
  const [isPurchaseOpen, setIsPurchaseOpen] = React.useState(true);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/'}>
          <Link href="/">
            <LayoutDashboard />
            Dashboard
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/calendar'}>
          <Link href="/calendar">
            <Calendar />
            Calendar
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/modules'}>
          <Link href="/modules">
            <Box />
            Modules
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {isProjectManagementEnabled && (
         <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/project-management')}>
              <Link href="/project-management">
                <Briefcase />
                Project Management
              </Link>
            </SidebarMenuButton>
         </SidebarMenuItem>
      )}
      {isPurchaseModuleEnabled && (
        <SidebarMenuItem>
          <Collapsible open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart />
                        Purchase
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isPurchaseOpen ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/purchase/dashboard'}>
                    <Link href="/purchase/dashboard"><Home />Dashboard</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/purchase/products'}>
                    <Link href="/purchase/products"><Package />Products</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/purchase/vendors'}>
                    <Link href="/purchase/vendors"><Users />Vendors</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/purchase/orders'}>
                    <Link href="/purchase/orders"><Truck />Purchase of products</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/purchase/bills'}>
                    <Link href="/purchase/bills"><FileText />Bills</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/purchase/payment'}>
                    <Link href="/purchase/payment"><Landmark />Payment</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <Logo className="h-10 w-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DashboardSidebarItems />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar>
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold">User Name</p>
              <p className="truncate text-xs text-muted-foreground">user@example.com</p>
            </div>
            {/* The form + logout action were removed, this button is now for display */}
            <Button variant="ghost" size="icon" aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
            <SidebarTrigger className="md:hidden" />
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
      <body className="font-body antialiased" suppressHydrationWarning>
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
