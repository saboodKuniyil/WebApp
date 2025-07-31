
import { CurrencyManagement } from "@/components/settings/currency-management";
import { getCurrencies, getAppSettings } from '@/lib/db';
import type { Currency } from "@/components/settings/currency-management";
import { unstable_noStore as noStore } from 'next/cache';

async function fetchCurrencies(): Promise<Currency[]> {
  noStore();
  return getCurrencies();
}

async function fetchDefaultCurrency(): Promise<string> {
    noStore();
    const settings = await getAppSettings();
    return settings.currency;
}

export default async function CurrencyPreferencePage() {
  const currencies = await fetchCurrencies();
  const defaultCurrency = await fetchDefaultCurrency();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Currency Preferences</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <CurrencyManagement data={currencies} defaultCurrency={defaultCurrency} />
      </div>
    </main>
  );
}
