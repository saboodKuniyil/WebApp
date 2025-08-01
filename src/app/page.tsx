
import { FinancialStats } from '@/components/dashboard/financial-stats';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { SalesAnalysis } from '@/components/dashboard/sales-analysis';
import { ProjectManagementStats } from '@/components/dashboard/project-management-stats';
import { CrmStats } from '@/components/dashboard/crm-stats';
import { PurchaseStats } from '@/components/dashboard/purchase-stats';
import { getAppSettings, getProjects, getTasks, getIssues, getProducts } from '@/lib/db';

export default async function DashboardPage() {
  const appSettings = await getAppSettings();
  const projects = await getProjects();
  const tasks = await getTasks();
  const issues = await getIssues();
  const products = await getProducts();
  
  const isProjectManagementEnabled = appSettings.enabled_modules?.project_management ?? false;
  const isCrmEnabled = appSettings.enabled_modules?.crm ?? false;
  const isPurchaseModuleEnabled = appSettings.enabled_modules?.purchase ?? false;

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      
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
    </main>
  );
}
