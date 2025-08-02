

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings } from '@/lib/db';
import { useModules } from '@/context/modules-context';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useActionState } from 'react';
import { updateQuotationSettings } from '@/app/settings/preferences/quotation/actions';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

const initialState = { message: '', errors: {} };

interface QuotationPreferencesProps {
  settings: AppSettings;
}

export function QuotationPreferences({ settings }: QuotationPreferencesProps) {
    const [state, dispatch] = useActionState(updateQuotationSettings, initialState);
    const { toast } = useToast();
    const { setAppSettings } = useModules();

    React.useEffect(() => {
        if (state.message) {
            if (state.errors) {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            } else {
                toast({ title: 'Success', description: state.message });
                // We need to update the global context if the save was successful
                // This assumes the action returns the full updated settings object on success.
                if (state.updatedSettings) {
                    setAppSettings(state.updatedSettings);
                }
            }
        }
    }, [state, toast, setAppSettings]);


  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Quotation Settings</CardTitle>
          <CardDescription>Configure the default content and values for your quotations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
              <Textarea id="termsAndConditions" name="termsAndConditions" defaultValue={settings.quotationSettings?.termsAndConditions} rows={5} />
               {state.errors?.termsAndConditions && <p className="text-red-500 text-xs">{state.errors.termsAndConditions[0]}</p>}
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-medium">Bank Details</h3>
                 <p className="text-sm text-muted-foreground">This information will be displayed on the quotation document.</p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" defaultValue={settings.quotationSettings?.bankName} />
                    {state.errors?.bankName && <p className="text-red-500 text-xs">{state.errors.bankName[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" defaultValue={settings.quotationSettings?.accountNumber} />
                     {state.errors?.accountNumber && <p className="text-red-500 text-xs">{state.errors.accountNumber[0]}</p>}
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" name="iban" defaultValue={settings.quotationSettings?.iban} />
                {state.errors?.iban && <p className="text-red-500 text-xs">{state.errors.iban[0]}</p>}
            </div>

             <Separator />

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                    <Input id="taxPercentage" name="taxPercentage" type="number" step="0.01" defaultValue={settings.quotationSettings?.taxPercentage} />
                    {state.errors?.taxPercentage && <p className="text-red-500 text-xs">{state.errors.taxPercentage[0]}</p>}
                </div>
            </div>


          <div className="flex justify-end">
            <Button type="submit">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
