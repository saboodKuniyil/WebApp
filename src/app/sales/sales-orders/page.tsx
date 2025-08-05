

import { SalesOrdersList } from '@/components/sales/sales-orders-list';
import { getSalesOrders, getQuotations } from '@/lib/db';
import type { SalesOrder } from '@/lib/db';
import type { Quotation } from '@/components/sales/quotations-list';

async function fetchSalesOrders(): Promise<SalesOrder[]> {
    return getSalesOrders();
}

async function fetchQuotations(): Promise<Quotation[]> {
    return getQuotations();
}

export default async function SalesOrdersPage() {
  const salesOrders = await fetchSalesOrders();
  const quotations = await fetchQuotations();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Sales Orders</h1>
      </div>
      <SalesOrdersList data={salesOrders} quotations={quotations} />
    </main>
  );
}
