
import { getSalesOrderById } from '@/lib/db';
import type { SalesOrder } from "@/lib/db";
import { notFound } from 'next/navigation';
import { SalesOrderDetailView } from '@/components/sales/sales-order-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getSalesOrder(id: string): Promise<SalesOrder | undefined> {
  return await getSalesOrderById(id);
}

export default async function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const salesOrder = await getSalesOrder(params.id);
  
  if (!salesOrder) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/sales/sales-orders">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Sales Orders
            </Link>
        </Button>
      </div>
      <SalesOrderDetailView salesOrder={salesOrder} />
    </main>
  );
}
