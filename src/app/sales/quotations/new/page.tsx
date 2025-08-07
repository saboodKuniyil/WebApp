

import { getCustomers, getEstimations } from "@/lib/db";
import { CreateQuotationForm } from "@/components/sales/create-quotation-form";
import type { Customer } from "@/lib/db";
import type { Estimation } from "@/components/sales/estimations-list";

async function getData() {
    const [customers, estimations] = await Promise.all([
        getCustomers(),
        getEstimations()
    ]);
    return { customers, estimations };
}


export default async function NewQuotationPage() {
    const { customers, estimations } = await getData();
    return (
        <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
            <CreateQuotationForm customers={customers} estimations={estimations} />
        </main>
    )
}
