
import { ProductsList } from "@/components/purchase/products-list";
import { getProducts as fetchProducts } from '@/lib/db';
import type { Product } from "@/components/purchase/products-list";
import { unstable_noStore as noStore } from 'next/cache';

async function getProducts(): Promise<Product[]> {
  noStore();
  try {
    const products = await fetchProducts();
    return products;
  } catch (error) {
    console.error('Failed to read database:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Products</h1>
      </div>
      <ProductsList data={products} />
    </main>
  );
}
