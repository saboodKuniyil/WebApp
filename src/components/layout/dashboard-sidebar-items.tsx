
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Box, Calendar, LayoutDashboard, Briefcase, ShoppingCart, Home, Package, Users, FileText, Landmark, Truck, CheckSquare, AlertTriangle, ClipboardList, Settings, ChevronsRight, CircleDollarSign, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useModules } from '@/context/modules-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export function DashboardSidebarItems() {
  const pathname = usePathname();
  const { isProjectManagementEnabled, isPurchaseModuleEnabled, isCrmEnabled } = useModules();
  const [isPurchaseOpen, setIsPurchaseOpen] = React.useState(true);
  const [isProjectManagementOpen, setIsProjectManagementOpen] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(true);
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(true);
  const [isCrmOpen, setIsCrmOpen] = React.useState(true);

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
      
      {isCrmEnabled && (
         <SidebarMenuItem>
            <Collapsible open={isCrmOpen} onOpenChange={setIsCrmOpen}>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-2">
                          <Heart />
                          CRM
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCrmOpen ? 'rotate-180' : ''}`} />
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/crm/calendar'}>
                      <Link href="/crm/calendar">
                        <Calendar />
                        Calendar
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
         </SidebarMenuItem>
      )}

      {isProjectManagementEnabled && (
         <SidebarMenuItem>
            <Collapsible open={isProjectManagementOpen} onOpenChange={setIsProjectManagementOpen}>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-2">
                          <Briefcase />
                          Project Management
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isProjectManagementOpen ? 'rotate-180' : ''}`} />
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/project-management/dashboard'}>
                      <Link href="/project-management/dashboard"><Home />Dashboard</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/project-management/projects'}>
                      <Link href="/project-management/projects"><Briefcase />Projects</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/project-management/tasks'}>
                      <Link href="/project-management/tasks"><CheckSquare />Tasks</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/project-management/task-blueprints'}>
                      <Link href="/project-management/task-blueprints"><ClipboardList />Task Blueprints</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/project-management/issues'}>
                      <Link href="/project-management/issues"><AlertTriangle />Issues</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
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
                    <Link href="/purchase/orders"><Truck />Purchase Order</Link>
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
       <SidebarMenuItem>
            <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2">
                            <Settings />
                            Settings
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                         <SidebarMenuItem>
                            <SidebarMenuSubButton asChild isActive={pathname === '/modules'}>
                            <Link href="/modules">
                                <Box />
                                Modules
                            </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Collapsible open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            <ChevronsRight />
                                            Preferences
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isPreferencesOpen ? 'rotate-180' : ''}`} />
                                    </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuItem>
                                            <SidebarMenuSubButton asChild isActive={pathname === '/settings/preferences/product-preference'}>
                                                <Link href="/settings/preferences/product-preference"><Package />Product Preference</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuSubButton asChild isActive={pathname === '/settings/preferences/currency'}>
                                                <Link href="/settings/preferences/currency"><CircleDollarSign />Currency</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenuItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
       </SidebarMenuItem>
    </SidebarMenu>
  );
}
