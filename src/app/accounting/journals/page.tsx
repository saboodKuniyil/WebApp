
import { JournalsList } from "@/components/accounting/journals-list";
import { getJournals, getAccounts } from '@/lib/db';
import type { Journal, Account } from "@/lib/db";

async function fetchJournals(): Promise<Journal[]> {
    return getJournals();
}

async function fetchAccounts(): Promise<Account[]> {
    return getAccounts();
}


export default async function JournalsPage() {
  const journals = await fetchJournals();
  const accounts = await fetchAccounts();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manual Journals</h1>
      </div>
      <JournalsList data={journals} accounts={accounts} />
    </main>
  );
}
