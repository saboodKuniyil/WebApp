
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const activities = [
    { user: 'Alice', action: 'completed a task:', task: 'Design new logo', time: '2h ago' },
    { user: 'Bob', action: 'added a new comment to', task: 'API Integration', time: '3h ago' },
    { user: 'Charlie', action: 'moved a task to In Progress:', task: 'Develop landing page', time: '5h ago' },
    { user: 'David', action: 'created a new project:', task: 'Q4 Financial Report', time: '1d ago' },
    { user: 'Eve', action: 'completed a task:', task: 'User authentication flow', time: '2d ago' },
];

export function TeamActivity() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
        <CardDescription>Recent updates from your team members.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-72">
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${activity.user.charAt(0)}`} />
                            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-sm">
                            <p>
                                <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-primary">{activity.task}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
