
'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "./tasks-list"
import type { Issue } from "./issues-list"
import { Button } from "../ui/button"
import { Pencil, Trash2, Briefcase, AlertTriangle } from "lucide-react"
import React from "react"
import Link from "next/link"

interface IssueDetailViewProps {
    issue: Issue
    task?: Task
}

const statusColors: Record<Issue['status'], string> = {
    'open': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'closed': 'bg-green-500/20 text-green-700 dark:text-green-300',
}

const typeColors: Record<Issue['type'], string> = {
    'bug': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'feature-request': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'documentation': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
}

const priorityColors: Record<Issue['priority'], string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
};

export function IssueDetailView({ issue, task }: IssueDetailViewProps) {
    // const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline">{issue.title}</CardTitle>
                            <CardDescription>{issue.id}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" disabled>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Issue</span>
                            </Button>
                            <Button variant="destructive" size="icon" disabled>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Issue</span>
                            </Button>
                            <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[issue.status]}`}>{issue.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        
                        <div>
                            <p className="font-semibold">Priority</p>
                            <p className={`capitalize font-medium ${priorityColors[issue.priority]}`}>{issue.priority}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Date Created</p>
                            <p>{formatDate(issue.created)}</p>
                        </div>
                         <div>
                            <p className="font-semibold">Type</p>
                             <Badge variant="outline" className={`capitalize border-0 ${typeColors[issue.type]}`}>{issue.type}</Badge>
                        </div>
                        {task && (
                             <div>
                                <p className="font-semibold">Related Task</p>
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href={`/project-management/tasks/${task.id}`} className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {task.title}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            {/* TODO: Add Edit/Delete Dialogs */}
        </div>
    )
}
