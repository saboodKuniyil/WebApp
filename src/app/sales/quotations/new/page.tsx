

import { getProducts, getCustomers } from "@/lib/db";
import { CreateQuotationForm } from "@/components/sales/create-quotation-form";
import type { Product } from "@/components/purchase/products-list";
import type { Customer } from "@/lib/db";

async function getData() {
    const [products, customers] = await Promise.all([
        getProducts(),
        getCustomers()
    ]);
    return { products, customers };
}


export default async function NewQuotationPage() {
    const { products, customers } = await getData();
    return (
        <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
            <CreateQuotationForm products={products} customers={customers} />
        </main>
    )
}
