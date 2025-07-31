
import { ProductPreferences } from "@/components/settings/product-preferences";
import { getProductCategories } from '@/lib/db';
import type { ProductCategory } from "@/components/settings/product-preferences";
import { unstable_noStore as noStore } from 'next/cache';

async function fetchProductCategories(): Promise<ProductCategory[]> {
  noStore();
  return getProductCategories();
}

export default async function ProductPreferencePage() {
  const categories = await fetchProductCategories();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Product Preferences</h1>
      </div>
      <ProductPreferences data={categories} />
    </main>
  );
}
