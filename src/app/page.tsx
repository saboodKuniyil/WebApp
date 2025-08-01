
'use client';

import { FinancialStats } from '@/components/dashboard/financial-stats';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { SalesAnalysis } from '@/components/dashboard/sales-analysis';
import { ProjectManagementStats } from '@/components/dashboard/project-management-stats';
import { CrmStats } from '@/components/dashboard/crm-stats';
import { PurchaseStats } from '@/components/dashboard/purchase-stats';
import { useModules } from '@/context/modules-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { appSettings, isProjectManagementEnabled, isCrmEnabled, isPurchaseModuleEnabled } = useModules();

  if (!appSettings) {
    return (
        <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-64" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4"><Skeleton className="h-80 w-full" /></div>
                <div className="lg:col-span-3"><Skeleton className="h-80 w-full" /></div>
            </div>
        </main>
    )
  }

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appSettings.dashboard?.showFinancialStats && <FinancialStats />}
        {isProjectManagementEnabled && appSettings.dashboard?.showProjectManagementStats && <ProjectManagementStats />}
        {isCrmEnabled && appSettings.dashboard?.showCrmStats && <CrmStats />}
        {isPurchaseModuleEnabled && appSettings.dashboard?.showPurchaseStats && <PurchaseStats />}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {appSettings.dashboard?.showRevenueChart && (
            <div className="lg:col-span-4">
            <RevenueChart />
            </div>
        )}
        {appSettings.dashboard?.showSalesAnalysis && (
            <div className="lg:col-span-3">
            <SalesAnalysis />
            </div>
        )}
      </div>
    </main>
  );
}
