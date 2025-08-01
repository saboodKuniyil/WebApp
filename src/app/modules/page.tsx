
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Briefcase, ShoppingCart, Heart, Wallet } from 'lucide-react';
import { useModules } from '@/context/modules-context';

export default function ModulesPage() {
  const { 
    isProjectManagementEnabled, 
    setIsProjectManagementEnabled, 
    isPurchaseModuleEnabled, 
    setIsPurchaseModuleEnabled,
    isCrmEnabled,
    setIsCrmEnabled,
    isPayrollEnabled,
    setIsPayrollEnabled,
  } = useModules();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Modules</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl flex items-center">
                <Briefcase className="mr-3 h-6 w-6 text-primary" />
                Project Management
              </CardTitle>
              <CardDescription>
                Organize, track, and manage your team's projects.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="project-management-switch" className="font-medium">
                {isProjectManagementEnabled ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="project-management-switch"
                checked={isProjectManagementEnabled}
                onCheckedChange={setIsProjectManagementEnabled}
                aria-label="Toggle Project Management Module"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl flex items-center">
                <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
                Purchase
              </CardTitle>
              <CardDescription>
                Manage vendors, products, and purchase orders.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="purchase-switch" className="font-medium">
                {isPurchaseModuleEnabled ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="purchase-switch"
                checked={isPurchaseModuleEnabled}
                onCheckedChange={setIsPurchaseModuleEnabled}
                aria-label="Toggle Purchase Module"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl flex items-center">
                <Heart className="mr-3 h-6 w-6 text-primary" />
                CRM
              </CardTitle>
              <CardDescription>
                Manage customer relationships and calendars.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="crm-switch" className="font-medium">
                {isCrmEnabled ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="crm-switch"
                checked={isCrmEnabled}
                onCheckedChange={setIsCrmEnabled}
                aria-label="Toggle CRM Module"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl flex items-center">
                <Wallet className="mr-3 h-6 w-6 text-primary" />
                Payroll
              </CardTitle>
              <CardDescription>
                Manage employees, positions, and payroll entries.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="payroll-switch" className="font-medium">
                {isPayrollEnabled ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="payroll-switch"
                checked={isPayrollEnabled}
                onCheckedChange={setIsPayrollEnabled}
                aria-label="Toggle Payroll Module"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
