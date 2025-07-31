
import { ProductsList } from "@/components/purchase/products-list";
import { getProducts as fetchProducts, getProductCategories as fetchProductCategories, getUnits as fetchUnits } from '@/lib/db';
import type { Product } from "@/components/purchase/products-list";
import type { ProductCategory } from "@/components/settings/product-preferences";
import type { Unit } from "@/components/settings/units-management";
import { unstable_noStore as noStore } from 'next/cache';
import { AddProductDialog } from "@/components/purchase/add-product-dialog";

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

async function getProductCategories(): Promise<ProductCategory[]> {
    noStore();
    try {
        const categories = await fetchProductCategories();
        return categories;
    } catch (error) {
        console.error('Failed to read database:', error);
        return [];
    }
}

async function getUnits(): Promise<Unit[]> {
    noStore();
    try {
        const units = await fetchUnits();
        return units;
    } catch (error) {
        console.error('Failed to read database:', error);
        return [];
    }
}

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getProductCategories();
  const units = await getUnits();

  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Products</h1>
      </div>
      <ProductsList data={products} addProductDialog={<AddProductDialog categories={categories} units={units} />} />
    </main>
  );
}
