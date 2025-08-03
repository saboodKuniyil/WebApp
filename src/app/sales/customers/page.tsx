
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomers } from '@/lib/db';
import type { Customer } from '@/lib/db';
import { CustomersList } from '@/components/customers/customers-list';

async function fetchCustomers(): Promise<Customer[]> {
    return getCustomers();
}

export default async function CustomersPage() {
    const customers = await fetchCustomers();
    return (
        <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Customers</CardTitle>
                    <CardDescription>Manage your organization's customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomersList data={customers} />
                </CardContent>
            </Card>
        </main>
    );
}
