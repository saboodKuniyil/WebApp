
import { ProductPreferences } from "@/components/settings/product-preferences";
import { UnitsManagement } from "@/components/settings/units-management";
import { getProductCategories, getUnits } from '@/lib/db';
import type { ProductCategory } from "@/components/settings/product-preferences";
import type { Unit } from "@/components/settings/units-management";
import { unstable_noStore as noStore } from 'next/cache';

async function fetchProductCategories(): Promise<ProductCategory[]> {
  noStore();
  return getProductCategories();
}

async function fetchUnits(): Promise<Unit[]> {
  noStore();
  return getUnits();
}

export default async function ProductPreferencePage() {
  const categories = await fetchProductCategories();
  const units = await fetchUnits();
  
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Product Preferences</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductPreferences data={categories} />
        <UnitsManagement data={units} />
      </div>
    </main>
  );
}
