import { FinancialStats } from '@/components/dashboard/financial-stats';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { SalesAnalysis } from '@/components/dashboard/sales-analysis';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FinancialStats />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <SalesAnalysis />
        </div>
      </div>
    </main>
  );
}
