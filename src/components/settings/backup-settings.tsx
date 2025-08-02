
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';
import { getDbJsonContent } from '@/app/settings/backup/actions';

export function BackupSettings() {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();

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

  return (
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
  );
}
