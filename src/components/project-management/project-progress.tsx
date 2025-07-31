
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const projects = [
    { name: 'Website Redesign', progress: 75, status: 'On Track' },
    { name: 'Mobile App Launch', progress: 50, status: 'At Risk' },
    { name: 'API Integration', progress: 90, status: 'On Track' },
    { name: 'Marketing Campaign', progress: 30, status: 'Needs Attention' },
];

export function ProjectProgress() {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Track': return 'text-green-500';
            case 'At Risk': return 'text-yellow-500';
            case 'Needs Attention': return 'text-red-500';
            default: return 'text-muted-foreground';
        }
    };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>An overview of current project statuses.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-6">
            {projects.map(project => (
                <div key={project.name}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{project.name}</span>
                        <span className={`text-xs font-semibold ${getStatusColor(project.status)}`}>{project.status}</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
