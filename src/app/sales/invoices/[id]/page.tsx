
import { getInvoiceById, getSalesOrderById } from '@/lib/db';
import type { Invoice, SalesOrder } from "@/lib/db";
import { notFound } from 'next/navigation';
import { InvoiceDetailView } from '@/components/sales/invoice-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getInvoice(id: string): Promise<Invoice | undefined> {
  return await getInvoiceById(id);
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  
  if (!invoice) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/sales/invoices">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Invoices
            </Link>
        </Button>
      </div>
      <InvoiceDetailView invoice={invoice} />
    </main>
  );
}
