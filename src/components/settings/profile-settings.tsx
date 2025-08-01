
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CompanyProfile } from '@/lib/db';
import { saveProfileSettings } from '@/app/settings/profile/actions';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { Separator } from '../ui/separator';

const initialState = { message: '', errors: {} };

interface ProfileSettingsProps {
  profile: CompanyProfile;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [state, dispatch] = useActionState(saveProfileSettings, initialState);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = React.useState(profile.logoUrl || null);
  const [logoData, setLogoData] = React.useState(profile.logoUrl || null);

  React.useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Error updating profile',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success',
          description: state.message,
        });
      }
    }
  }, [state, toast]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoPreview(dataUrl);
        setLogoData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>Manage your company's information and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" defaultValue={profile.companyName} />
                {state.errors?.companyName && <p className="text-red-500 text-xs">{state.errors.companyName[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trnNumber">TRN Number</Label>
                <Input id="trnNumber" name="trnNumber" defaultValue={profile.trnNumber} />
                 {state.errors?.trnNumber && <p className="text-red-500 text-xs">{state.errors.trnNumber[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div 
                className="aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden bg-muted"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <Image src={logoPreview} alt="Company Logo" layout="fill" className="object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <Upload className="mx-auto h-8 w-8" />
                    <p className="text-xs mt-2">Click to upload a logo</p>
                  </div>
                )}
              </div>
              <input type="hidden" name="logoUrl" value={logoData || ''} />
              <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
            </div>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={profile.address} rows={3} />
               {state.errors?.address && <p className="text-red-500 text-xs">{state.errors.address[0]}</p>}
            </div>

          <Separator />

            <div>
                <h3 className="text-lg font-medium">Bank Details</h3>
                 <p className="text-sm text-muted-foreground">This information will be used for invoices and payments.</p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" defaultValue={profile.bankName} />
                    {state.errors?.bankName && <p className="text-red-500 text-xs">{state.errors.bankName[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" defaultValue={profile.accountNumber} />
                    {state.errors?.accountNumber && <p className="text-red-500 text-xs">{state.errors.accountNumber[0]}</p>}
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" name="iban" defaultValue={profile.iban} />
                {state.errors?.iban && <p className="text-red-500 text-xs">{state.errors.iban[0]}</p>}
            </div>


          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
