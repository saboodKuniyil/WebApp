
import { getEstimationById, getProducts } from '@/lib/db';
import type { Estimation } from "@/components/sales/estimations-list";
import type { Product } from '@/components/purchase/products-list';
import { notFound } from 'next/navigation';
import { EstimationDetailView } from '@/components/sales/estimation-detail-view';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

async function getEstimation(id: string): Promise<Estimation | undefined> {
  return await getEstimationById(id);
}

async function fetchProducts(): Promise<Product[]> {
    return getProducts();
}


export default async function EstimationDetailPage({ params }: { params: { id: string } }) {
  const estimation = await getEstimation(params.id);
  
  if (!estimation) {
    notFound();
  }
  
  const products = await fetchProducts();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
         <Button asChild variant="outline" size="sm">
            <Link href="/sales/estimations">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Estimations
            </Link>
        </Button>
      </div>
      <EstimationDetailView estimation={estimation} products={products} />
    </main>
  );
}
