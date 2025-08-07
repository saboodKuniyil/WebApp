
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVendors } from '@/lib/db';
import type { Vendor } from '@/lib/db';
import { VendorsList } from '@/components/purchase/vendors-list';

async function fetchVendors(): Promise<Vendor[]> {
    return getVendors();
}

export default async function VendorsPage() {
    const vendors = await fetchVendors();
  return (
    <main className="flex-1 space-y-4 p-2 md:p-4 pt-4">
        <Card>
            <CardHeader>
                <CardTitle>Vendors</CardTitle>
                <CardDescription>Manage your organization's vendors.</CardDescription>
            </CardHeader>
            <CardContent>
                <VendorsList data={vendors} />
            </CardContent>
        </Card>
    </main>
  );
}
