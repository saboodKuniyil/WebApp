
import { ChartOfAccountsList } from "@/components/accounting/chart-of-accounts-list";
import { getAccounts } from '@/lib/db';
import type { Account } from "@/lib/db";

async function fetchAccounts(): Promise<Account[]> {
    return getAccounts();
}

export default async function ChartOfAccountsPage() {
  const accounts = await fetchAccounts();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Chart of Accounts</h1>
      </div>
      <ChartOfAccountsList data={accounts} />
    </main>
  );
}
