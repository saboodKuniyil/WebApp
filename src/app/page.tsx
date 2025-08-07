
import { getAppSettings, getProjects, getTasks, getIssues, getProducts } from '@/lib/db';
import { DashboardClientPage } from '@/components/dashboard/dashboard-client-page';

export default async function DashboardPage() {
  const appSettings = await getAppSettings();
  const projects = await getProjects();
  const tasks = await getTasks();
  const issues = await getIssues();
  const products = await getProducts();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      <DashboardClientPage 
        appSettings={appSettings} 
        projects={projects} 
        tasks={tasks} 
        issues={issues} 
        products={products} 
      />
    </main>
  );
}
