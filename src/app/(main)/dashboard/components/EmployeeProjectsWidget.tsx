"use client"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { RiCheckLine, RiFolderLine } from "@remixicon/react"
import { format } from "date-fns"
import Link from "next/link"

interface Project {
    id: string
    name: string
    status: string
    quarter_id: string
    end_date: string
    sla_percentage: number
    quality_achieved: number
    quality_total: number
}

interface EmployeeProjectsWidgetProps {
    projects: Project[]
    userId: string
}

export function EmployeeProjectsWidget({ projects, userId }: EmployeeProjectsWidgetProps) {
    if (projects.length === 0) {
        return (
            <Card>
                <h3 className="text-lg font-semibold text-content mb-4">Active Projects</h3>
                <div className="text-center py-8">
                    <RiFolderLine className="mx-auto size-12 text-content-placeholder" />
                    <p className="mt-2 text-sm text-content-subtle">No active projects assigned</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-content">Active Projects</h3>
                <Link href="/performance?tab=kpi">
                    <Badge variant="info">View All</Badge>
                </Link>
            </div>

            <div className="space-y-3">
                {projects.slice(0, 5).map((project) => {
                    const daysUntilDeadline = Math.ceil(
                        (new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )
                    const isOverdue = daysUntilDeadline < 0
                    const isUrgent = daysUntilDeadline >= 0 && daysUntilDeadline <= 7

                    return (
                        <Link
                            key={project.id}
                            href={`/performance/employee/${userId}/project/${project.id}`}
                            className="block"
                        >
                            <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface-secondary p-3 transition-all hover:border-primary hover:shadow-sm">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-content text-sm truncate">
                                            {project.name}
                                        </h4>
                                        <Badge variant="info" className="shrink-0 text-xs">
                                            {project.quarter_id}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-content-subtle">
                                        <div className="flex items-center gap-1">
                                            <span>SLA:</span>
                                            <span className="font-medium text-content">
                                                {project.sla_percentage}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <RiCheckLine className="size-3" />
                                            <span className="font-medium text-content">
                                                {project.quality_achieved}/{project.quality_total}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        {isOverdue ? (
                                            <Badge variant="error" className="text-xs">
                                                Overdue
                                            </Badge>
                                        ) : isUrgent ? (
                                            <Badge variant="warning" className="text-xs">
                                                Due in {daysUntilDeadline} days
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-content-placeholder">
                                                Due {format(new Date(project.end_date), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {projects.length > 5 && (
                <div className="mt-4 text-center">
                    <Link href="/performance?tab=kpi">
                        <span className="text-sm text-primary hover:underline">
                            +{projects.length - 5} more projects
                        </span>
                    </Link>
                </div>
            )}
        </Card>
    )
}
