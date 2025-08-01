
import { DashboardPreferences } from "@/components/settings/dashboard-preferences";
import { getAppSettings, getCurrencies } from '@/lib/db';
import type { AppSettings } from "@/lib/db";
import { unstable_noStore as noStore } from 'next/cache';

async function fetchAppSettings(): Promise<AppSettings> {
  noStore();
  return getAppSettings();
}

export default async function DashboardPreferencePage() {
  const appSettings = await fetchAppSettings();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard Preferences</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <DashboardPreferences settings={appSettings} />
      </div>
    </main>
  );
}
