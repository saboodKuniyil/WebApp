
'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Project } from "./projects-list"
import type { Task } from "./tasks-list"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { EditProjectDialog } from "./edit-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import React from "react"
import Link from 'next/link';
import { TaskBlueprint } from "./task-blueprints-list"

interface ProjectDetailViewProps {
    project: Project
    tasks: Task[]
    taskBlueprints: TaskBlueprint[]
}

const statusColors: Record<Project['status'], string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'completed': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'on-hold': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
};

const taskStatusColors: Record<Task['status'], string> = {
    'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    'done': 'bg-green-500/20 text-green-700 dark:text-green-300',
    'backlog': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
    'todo': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    'canceled': 'bg-red-500/20 text-red-700 dark:text-red-300',
}

const taskPriorityColors: Record<Task['priority'], string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600',
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00Z`);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
};

export function ProjectDetailView({ project, tasks, taskBlueprints }: ProjectDetailViewProps) {
    const totalTasks = tasks.length;
    const totalCompletion = tasks.reduce((sum, task) => sum + (task.completionPercentage ?? 0), 0);
    const overallProgress = totalTasks > 0 ? totalCompletion / totalTasks : 0;
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline">{project.title}</CardTitle>
                            <CardDescription>{project.id}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Project</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Project</span>
                            </Button>
                            <Badge variant="outline" className={`capitalize text-lg border-0 ${statusColors[project.status]}`}>{project.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                    {project.description && <p className="text-muted-foreground">{project.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Project Manager</p>
                            <p>{project.manager}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Customer</p>
                            <p>{project.customer}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Start Date</p>
                            <p>{formatDate(project.startDate)}</p>
                        </div>
                        <div>
                            <p className="font-semibold">End Date</p>
                            <p>{formatDate(project.endDate)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-sm mb-1">Overall Progress</p>
                        <div className="flex items-center gap-2">
                             <Progress value={overallProgress} className="h-2" />
                             <span className="text-sm font-medium text-muted-foreground">{Math.round(overallProgress)}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription>A list of tasks associated with this project.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-2">Task ID</TableHead>
                                <TableHead className="p-2">Title</TableHead>
                                <TableHead className="p-2">Status</TableHead>
                                <TableHead className="p-2">Priority</TableHead>
                                <TableHead className="p-2">Assignee</TableHead>
                                <TableHead className="text-right p-2">Completion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="p-2">{task.id}</TableCell>
                                    <TableCell className="font-medium max-w-xs truncate p-2">
                                        <Link href={`/project-management/tasks/${task.id}`} className="hover:underline">
                                            {task.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="p-2"><Badge variant="outline" className={`capitalize border-0 ${taskStatusColors[task.status]}`}>{task.status}</Badge></TableCell>
                                    <TableCell className="p-2"><div className={`capitalize font-medium ${taskPriorityColors[task.priority]}`}>{task.priority}</div></TableCell>
                                    <TableCell className="p-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={`https://placehold.co/100x100.png?text=${task.assignee.charAt(0)}`} />
                                                <AvatarFallback>{task.assignee.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {task.assignee}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right p-2">{task.completionPercentage ?? 0}%</TableCell>
                                </TableRow>
                            ))}
                            {tasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center p-2">No tasks for this project.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <EditProjectDialog project={project} taskBlueprints={taskBlueprints} isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} />
            <DeleteProjectDialog project={project} isOpen={isDeleteDialogOpen} setIsOpen={setIsDeleteDialogOpen} />
        </div>
    )
}
