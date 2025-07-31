
'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Project } from "./projects-list"
import type { Task } from "./tasks-list"
import type { Issue } from "./issues-list"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Pencil, Trash2, Briefcase, AlertTriangle, PlusCircle } from "lucide-react"
import React from "react"
import Link from "next/link"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { AddIssueDialog } from "./add-issue-dialog"

interface TaskDetailViewProps {
    task: Task
    project?: Project
    issues: Issue[]
    projects: Project[]
}

const statusColors: Record<Task['status'], string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'done': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'backlog': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'todo': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
};

const issueStatusColors: Record<Issue['status'], string> = {
    'open': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'closed': 'bg-green-500/20 text-green-700 dark:text-green-300',
}

const priorityColors: Record<Task['priority'], string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
};

const labelColors: Record<Task['label'], string> = {
    'bug': 'bg-red-500/20 text-red-700 dark:text-red-300',
    'feature': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'documentation': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
};

export function TaskDetailView({ task, project, issues, projects }: TaskDetailViewProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline">{task.title}</CardTitle>
                            <CardDescription>{task.id}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Task</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Task</span>
                            </Button>
                            <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[task.status]}`}>{task.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                    {task.description && <p className="text-muted-foreground">{task.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Assignee</p>
                             <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={`https://placehold.co/100x100.png?text=${task.assignee.charAt(0)}`} />
                                    <AvatarFallback>{task.assignee.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {task.assignee}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Priority</p>
                            <p className={`capitalize font-medium ${priorityColors[task.priority]}`}>{task.priority}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Start Date</p>
                            <p>{formatDate(task.startDate)}</p>
                        </div>
                        <div>
                            <p className="font-semibold">End Date</p>
                            <p>{formatDate(task.endDate)}</p>
                        </div>
                         <div>
                            <p className="font-semibold">Label</p>
                             <Badge variant="outline" className={`capitalize border-0 ${labelColors[task.label]}`}>{task.label}</Badge>
                        </div>
                        {project && (
                             <div>
                                <p className="font-semibold">Project</p>
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href={`/project-management/projects/${project.id}`} className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {project.title}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-sm mb-1">Completion</p>
                        <div className="flex items-center gap-2">
                             <Progress value={task.completionPercentage} className="h-2" />
                             <span className="text-sm font-medium text-muted-foreground">{task.completionPercentage}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5" />Related Issues</CardTitle>
                            <CardDescription>A list of issues associated with this task.</CardDescription>
                        </div>
                        <AddIssueDialog 
                            tasks={[task]} 
                            defaultTaskId={task.id}
                            trigger={
                                <Button size="sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Issue
                                </Button>
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-2">Issue ID</TableHead>
                                <TableHead className="p-2">Title</TableHead>
                                <TableHead className="p-2">Status</TableHead>
                                <TableHead className="p-2">Priority</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.map((issue) => (
                                <TableRow key={issue.id}>
                                    <TableCell className="p-2">
                                         <Link href={`/project-management/issues/${issue.id}`} className="hover:underline font-medium">
                                            {issue.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate p-2">
                                        <Link href={`/project-management/issues/${issue.id}`} className="hover:underline">
                                            {issue.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="p-2"><Badge variant="outline" className={`capitalize border-0 ${issueStatusColors[issue.status]}`}>{issue.status}</Badge></TableCell>
                                    <TableCell className="p-2"><div className={`capitalize font-medium ${priorityColors[issue.priority as keyof typeof priorityColors]}`}>{issue.priority}</div></TableCell>
                                </TableRow>
                            ))}
                            {issues.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center p-2">No issues for this task.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <EditTaskDialog task={task} projects={projects} isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} />
            <DeleteTaskDialog task={task} isOpen={isDeleteDialogOpen} setIsOpen={setIsDeleteDialogOpen} />
        </div>
    )
}
