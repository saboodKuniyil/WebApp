
import { getQuotationById, getProducts } from '@/lib/db';
import type { Quotation } from "@/components/sales/quotations-list";
import type { Product } from "@/components/purchase/products-list";
import { notFound } from 'next/navigation';
import { QuotationDetailView } from '@/components/sales/quotation-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getQuotation(id: string): Promise<Quotation | undefined> {
  return await getQuotationById(id);
}

async function fetchProducts(): Promise<Product[]> {
    return getProducts();
}


export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotation = await getQuotation(params.id);
  
  if (!quotation) {
    notFound();
  }
  
  const products = await fetchProducts();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/sales/quotations">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Quotations
            </Link>
        </Button>
      </div>
      <QuotationDetailView quotation={quotation} products={products} />
    </main>
  );
}
