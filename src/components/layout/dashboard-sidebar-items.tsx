
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
import { Box, Calendar, LayoutDashboard, Briefcase, ShoppingCart, Home, Package, FileText, Landmark, Truck, CheckSquare, AlertTriangle, ClipboardList, Settings, ChevronsRight, CircleDollarSign, Heart, Wallet, User, ClipboardSignature, PenSquare, Building, Users as UsersIcon, ShieldCheck, DollarSign, FileSignature, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useModules } from '@/context/modules-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export function DashboardSidebarItems() {
  const pathname = usePathname();
  const { isProjectManagementEnabled, isPurchaseModuleEnabled, isCrmEnabled, isPayrollEnabled, isUserManagementEnabled, isSalesModuleEnabled } = useModules();
  const [isPurchaseOpen, setIsPurchaseOpen] = React.useState(true);
  const [isProjectManagementOpen, setIsProjectManagementOpen] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(true);
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(true);
  const [isCrmOpen, setIsCrmOpen] = React.useState(true);
  const [isPayrollOpen, setIsPayrollOpen] = React.useState(true);
  const [isSalesOpen, setIsSalesOpen] = React.useState(true);
  const [isUserManagementOpen, setIsUserManagementOpen] = React.useState(false);


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

      {isSalesModuleEnabled && (
         <SidebarMenuItem>
            <Collapsible open={isSalesOpen} onOpenChange={setIsSalesOpen}>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-2">
                          <DollarSign />
                          Sales
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isSalesOpen ? 'rotate-180' : ''}`} />
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/sales/dashboard'}>
                      <Link href="/sales/dashboard"><Home />Dashboard</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/sales/estimations'}>
                      <Link href="/sales/estimations"><FileSignature />Estimations</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/sales/quotations'}>
                      <Link href="/sales/quotations"><ClipboardList />Quotations</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/sales/sales-orders'}>
                      <Link href="/sales/sales-orders"><ShoppingBag />Sales Orders</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/sales/invoices'}>
                      <Link href="/sales/invoices"><FileText />Invoices</Link>
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
                    <Link href="/purchase/vendors"><UsersIcon />Vendors</Link>
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

      {isPayrollEnabled && (
         <SidebarMenuItem>
            <Collapsible open={isPayrollOpen} onOpenChange={setIsPayrollOpen}>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center gap-2">
                          <Wallet />
                          Payroll
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isPayrollOpen ? 'rotate-180' : ''}`} />
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/payroll/dashboard'}>
                      <Link href="/payroll/dashboard"><Home />Dashboard</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/payroll/employees'}>
                      <Link href="/payroll/employees"><User />Employees</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/payroll/positions'}>
                      <Link href="/payroll/positions"><ClipboardSignature />Positions</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/payroll/daily-entry'}>
                      <Link href="/payroll/daily-entry"><PenSquare />Daily Entry</Link>
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
                            <SidebarMenuSubButton asChild isActive={pathname.startsWith('/settings/profile')}>
                                <Link href="/settings/profile">
                                    <Building />
                                    Profile
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuItem>
                        {isUserManagementEnabled && (
                          <SidebarMenuItem>
                             <Collapsible open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon />
                                            User Management
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isUserManagementOpen ? 'rotate-180' : ''}`} />
                                    </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuItem>
                                            <SidebarMenuSubButton asChild isActive={pathname === '/settings/user-management'}>
                                                <Link href="/settings/user-management"><UsersIcon />Users</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuSubButton asChild isActive={pathname === '/settings/user-management/roles'}>
                                                <Link href="/settings/user-management/roles"><ShieldCheck />Roles &amp; Permissions</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        )}
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
                                            <SidebarMenuSubButton asChild isActive={pathname === '/settings/preferences/dashboard'}>
                                                <Link href="/settings/preferences/dashboard"><LayoutDashboard />Dashboard</Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuItem>
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
