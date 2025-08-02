
import { QuotationsList } from "@/components/sales/quotations-list";
import { getQuotations, getEstimations, getProducts } from '@/lib/db';
import type { Quotation } from "@/components/sales/quotations-list";
import type { Estimation } from "@/components/sales/estimations-list";
import type { Product } from "@/components/purchase/products-list";

async function fetchQuotations(): Promise<Quotation[]> {
    return getQuotations();
}

async function fetchEstimations(): Promise<Estimation[]> {
    return getEstimations();
}

async function fetchProducts(): Promise<Product[]> {
    return getProducts();
}

export default async function QuotationsPage() {
  const quotations = await fetchQuotations();
  const estimations = await fetchEstimations();
  const products = await fetchProducts();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Quotations</h1>
      </div>
      <QuotationsList data={quotations} estimations={estimations} products={products} />
    </main>
  );
}
