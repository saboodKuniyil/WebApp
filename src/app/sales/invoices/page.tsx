
import { InvoicesList } from "@/components/sales/invoices-list";
import { getInvoices, getSalesOrders } from '@/lib/db';
import type { Invoice, SalesOrder } from "@/lib/db";

async function fetchInvoices(): Promise<Invoice[]> {
    return getInvoices();
}

async function fetchSalesOrders(): Promise<SalesOrder[]> {
    return getSalesOrders();
}

export default async function InvoicesPage() {
  const invoices = await fetchInvoices();
  const salesOrders = await fetchSalesOrders();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Invoices</h1>
      </div>
      <InvoicesList data={invoices} salesOrders={salesOrders} />
    </main>
  );
}
