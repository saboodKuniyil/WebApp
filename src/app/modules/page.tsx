
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Briefcase, ShoppingCart, Heart, Wallet, Users, DollarSign } from 'lucide-react';
import { useModules } from '@/context/modules-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateModuleSettings } from './actions';

export default function ModulesPage() {
  const { 
    appSettings,
    setAppSettings,
    isInitialLoad,
  } = useModules();

  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const [modules, setModules] = React.useState(appSettings?.enabled_modules);

  React.useEffect(() => {
    setModules(appSettings?.enabled_modules);
  }, [appSettings]);

  const handleSwitchChange = (moduleName: keyof typeof modules, checked: boolean) => {
    setModules(prev => prev ? { ...prev, [moduleName]: checked } : null);
  }

  const handleSaveChanges = () => {
    if (!modules) return;
    
    startTransition(async () => {
      const result = await updateModuleSettings(modules);
       if (result.message.includes('success')) {
        if(appSettings) {
           setAppSettings({ ...appSettings, enabled_modules: modules });
        }
        toast({ title: 'Success', description: 'Module settings updated.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  }
  
  if (isInitialLoad || !modules) {
    return (
        <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-48" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    )
  }

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Modules</h1>
         <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Settings'}
        </Button>
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
                {modules.project_management ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="project-management-switch"
                checked={modules.project_management}
                onCheckedChange={(checked) => handleSwitchChange('project_management', checked)}
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
                {modules.purchase ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="purchase-switch"
                checked={modules.purchase}
                onCheckedChange={(checked) => handleSwitchChange('purchase', checked)}
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
                {modules.crm ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="crm-switch"
                checked={modules.crm}
                onCheckedChange={(checked) => handleSwitchChange('crm', checked)}
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
                {modules.payroll ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="payroll-switch"
                checked={modules.payroll}
                onCheckedChange={(checked) => handleSwitchChange('payroll', checked)}
                aria-label="Toggle Payroll Module"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl flex items-center">
                <DollarSign className="mr-3 h-6 w-6 text-primary" />
                Sales
              </CardTitle>
              <CardDescription>
                Manage invoices, quotations, and sales analytics.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="sales-switch" className="font-medium">
                {modules.sales ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="sales-switch"
                checked={modules.sales}
                onCheckedChange={(checked) => handleSwitchChange('sales', checked)}
                aria-label="Toggle Sales Module"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl flex items-center">
                <Users className="mr-3 h-6 w-6 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and permissions.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="user-management-switch" className="font-medium">
                {modules.user_management ? 'Module Active' : 'Module Inactive'}
              </Label>
              <Switch
                id="user-management-switch"
                checked={modules.user_management}
                onCheckedChange={(checked) => handleSwitchChange('user_management', checked)}
                aria-label="Toggle User Management Module"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
