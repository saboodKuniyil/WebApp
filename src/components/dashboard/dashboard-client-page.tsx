
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialStats } from '@/components/dashboard/financial-stats';
import { SalesAnalysis } from '@/components/dashboard/sales-analysis';
import { ProjectManagementStats } from '@/components/dashboard/project-management-stats';
import { CrmStats } from '@/components/dashboard/crm-stats';
import { PurchaseStats } from '@/components/dashboard/purchase-stats';
import type { AppSettings, Project, Task, Issue, Product } from '@/lib/db';

const RevenueChart = dynamic(() => import('@/components/dashboard/revenue-chart').then(mod => mod.RevenueChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});

interface DashboardClientPageProps {
    appSettings: AppSettings;
    projects: Project[];
    tasks: Task[];
    issues: Issue[];
    products: Product[];
}

export function DashboardClientPage({ appSettings, projects, tasks, issues, products }: DashboardClientPageProps) {
  const isProjectManagementEnabled = appSettings.enabled_modules?.project_management ?? false;
  const isCrmEnabled = appSettings.enabled_modules?.crm ?? false;
  const isPurchaseModuleEnabled = appSettings.enabled_modules?.purchase ?? false;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appSettings.dashboard?.showFinancialStats && <FinancialStats />}
        {isProjectManagementEnabled && appSettings.dashboard?.showProjectManagementStats && <ProjectManagementStats projects={projects} tasks={tasks} issues={issues} />}
        {isCrmEnabled && appSettings.dashboard?.showCrmStats && <CrmStats />}
        {isPurchaseModuleEnabled && appSettings.dashboard?.showPurchaseStats && <PurchaseStats products={products} />}
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
    </>
  );
}
