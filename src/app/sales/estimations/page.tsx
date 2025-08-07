
import { EstimationsList } from "@/components/sales/estimations-list";
import { getEstimations, getProducts, getCustomers } from '@/lib/db';
import type { Estimation } from "@/components/sales/estimations-list";
import type { Product } from "@/components/purchase/products-list";
import type { Customer } from "@/lib/db";

async function fetchEstimations(): Promise<Estimation[]> {
    return getEstimations();
}

async function fetchProducts(): Promise<Product[]> {
    return getProducts();
}

async function fetchCustomers(): Promise<Customer[]> {
    return getCustomers();
}


export default async function EstimationsPage() {
  const estimations = await fetchEstimations();
  const products = await fetchProducts();
  const customers = await fetchCustomers();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Estimations</h1>
      </div>
      <EstimationsList data={estimations} products={products} customers={customers} />
    </main>
  );
}
