
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';
import { getDbJsonContent, restoreDbFromJsonContent } from '@/app/settings/backup/actions';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

export function BackupSettings() {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    setIsDownloading(true);
    try {
      const result = await getDbJsonContent();
      if (result.error || !result.content) {
        throw new Error(result.error || 'Backup content is empty.');
      }

      const blob = new Blob([result.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Database backup downloaded successfully.',
      });
    } catch (error) {
      console.error('Failed to download backup:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download database backup.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please select a valid .json file.',
      });
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
        toast({ variant: 'destructive', title: 'No File Selected', description: 'Please select a backup file to restore.' });
        return;
    }

    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            const result = await restoreDbFromJsonContent(content);
            if (result.error) {
                 throw new Error(result.error);
            }
            toast({ title: 'Success', description: 'Database restored successfully. Please refresh the page to see the changes.' });
            setSelectedFile(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Restore Failed',
                description: error.message || 'An unknown error occurred.',
            });
        } finally {
            setIsRestoring(false);
        }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Backup</CardTitle>
          <CardDescription>
            Download a full backup of your application's database. Keep this file in a safe place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-medium">Download Database</h3>
              <p className="text-sm text-muted-foreground">
                Click the button to download the `db.json` file.
              </p>
            </div>
            <Button
              onClick={handleDownloadBackup}
              disabled={isDownloading}
              className="mt-2 sm:mt-0"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Preparing...' : 'Download Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Restore from Backup</CardTitle>
          <CardDescription>
            Restore your application's data from a previously downloaded backup file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                   Restoring from a backup will permanently overwrite all current data. This action cannot be undone.
                </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                    <Label htmlFor="backup-file">Select Backup File (.json)</Label>
                    <Input id="backup-file" type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} className="mt-1" />
                </div>
                <Button
                    onClick={handleRestoreBackup}
                    disabled={isRestoring || !selectedFile}
                    className="mt-2 sm:mt-0 sm:ml-4"
                    variant="destructive"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {isRestoring ? 'Restoring...' : 'Restore Backup'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
