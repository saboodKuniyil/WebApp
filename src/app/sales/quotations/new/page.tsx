

import { getCustomers } from "@/lib/db";
import { CreateQuotationForm } from "@/components/sales/create-quotation-form";
import type { Customer } from "@/lib/db";

async function getData() {
    const customers = await getCustomers();
    return { customers };
}


export default async function NewQuotationPage() {
    const { customers } = await getData();
    return (
        <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
            <CreateQuotationForm customers={customers} />
        </main>
    )
}
