
import { QuotationPreferences } from "@/components/settings/quotation-preferences";
import { getAppSettings } from '@/lib/db';
import type { AppSettings } from "@/lib/db";

async function fetchAppSettings(): Promise<AppSettings> {
  return getAppSettings();
}

export default async function QuotationPreferencePage() {
  const appSettings = await fetchAppSettings();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Quotation Preferences</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <QuotationPreferences settings={appSettings} />
      </div>
    </main>
  );
}
