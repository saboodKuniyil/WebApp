
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateAppSettings as updateDbAppSettings } from '@/lib/db';
import type { AppSettings } from '@/lib/db';
import { useModules } from '@/context/modules-context';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface DashboardPreferencesProps {
  settings: AppSettings;
}

export function DashboardPreferences({ settings }: DashboardPreferencesProps) {
  const [showFinancialStats, setShowFinancialStats] = React.useState(settings.dashboard?.showFinancialStats ?? true);
  const [showRevenueChart, setShowRevenueChart] = React.useState(settings.dashboard?.showRevenueChart ?? true);
  const [showSalesAnalysis, setShowSalesAnalysis] = React.useState(settings.dashboard?.showSalesAnalysis ?? true);
  const [showProjectManagementStats, setShowProjectManagementStats] = React.useState(settings.dashboard?.showProjectManagementStats ?? true);
  const [showCrmStats, setShowCrmStats] = React.useState(settings.dashboard?.showCrmStats ?? true);
  const [showPurchaseStats, setShowPurchaseStats] = React.useState(settings.dashboard?.showPurchaseStats ?? true);

  const [isPending, startTransition] = React.useTransition();
  
  const { toast } = useToast();
  const { appSettings, setAppSettings } = useModules();

  const handleSave = () => {
    startTransition(async () => {
      const newSettings: Partial<AppSettings> = {
        ...appSettings,
        dashboard: {
          showFinancialStats,
          showRevenueChart,
          showSalesAnalysis,
          showProjectManagementStats,
          showCrmStats,
          showPurchaseStats,
        },
      };

      const result = await updateDbAppSettings(newSettings);
      
      if (result.message.includes('success')) {
        setAppSettings(newSettings as AppSettings);
        toast({ title: 'Success', description: 'Dashboard preferences saved.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Components</CardTitle>
        <CardDescription>Choose which components to display on the main dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="financial-stats-switch" className="font-medium">
            Financial Stats
          </Label>
          <Switch
            id="financial-stats-switch"
            checked={showFinancialStats}
            onCheckedChange={setShowFinancialStats}
            aria-label="Toggle Financial Stats"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="revenue-chart-switch" className="font-medium">
            Revenue Chart
          </Label>
          <Switch
            id="revenue-chart-switch"
            checked={showRevenueChart}
            onCheckedChange={setShowRevenueChart}
            aria-label="Toggle Revenue Chart"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="sales-analysis-switch" className="font-medium">
            AI Sales Analysis
          </Label>
          <Switch
            id="sales-analysis-switch"
            checked={showSalesAnalysis}
            onCheckedChange={setShowSalesAnalysis}
            aria-label="Toggle Sales Analysis"
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="pm-stats-switch" className="font-medium">
            Project Management Stats
          </Label>
          <Switch
            id="pm-stats-switch"
            checked={showProjectManagementStats}
            onCheckedChange={setShowProjectManagementStats}
            aria-label="Toggle Project Management Stats"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="crm-stats-switch" className="font-medium">
            CRM Stats
          </Label>
          <Switch
            id="crm-stats-switch"
            checked={showCrmStats}
            onCheckedChange={setShowCrmStats}
            aria-label="Toggle CRM Stats"
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="purchase-stats-switch" className="font-medium">
            Purchase Stats
          </Label>
          <Switch
            id="purchase-stats-switch"
            checked={showPurchaseStats}
            onCheckedChange={setShowPurchaseStats}
            aria-label="Toggle Purchase Stats"
          />
        </div>

        <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
