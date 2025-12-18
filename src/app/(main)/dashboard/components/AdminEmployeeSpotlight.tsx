"use client"

import { Avatar } from "@/components/Avatar"
import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { RiArrowDownLine, RiArrowUpLine, RiStarLine } from "@remixicon/react"
import Link from "next/link"

interface Employee {
    employee_id: string
    employee_name: string | null
    employee_avatar: string | null
    employee_job_title: string | null
    overall_percentage: number
}

interface AdminEmployeeSpotlightProps {
    topPerformers: Employee[]
    employeesNeedingAttention: Employee[]
}

export function AdminEmployeeSpotlight({
    topPerformers,
    employeesNeedingAttention,
}: AdminEmployeeSpotlightProps) {
    const getRatingBadge = (score: number) => {
        if (score >= 95) return { variant: "success" as const, label: "Outstanding" }
        if (score >= 85) return { variant: "success" as const, label: "Above Exp." }
        if (score >= 75) return { variant: "info" as const, label: "Meets Exp." }
        if (score >= 60) return { variant: "warning" as const, label: "Below Exp." }
        return { variant: "error" as const, label: "Needs Imp." }
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Performers */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <RiStarLine className="size-5 text-chart-1" />
                    <h3 className="text-lg font-semibold text-content">Top Performers</h3>
                </div>

                {topPerformers.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-content-subtle">No performance data available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {topPerformers.map((employee) => {
                            const badge = getRatingBadge(employee.overall_percentage)
                            return (
                                <Link
                                    key={employee.employee_id}
                                    href={`/performance/employee/${employee.employee_id}`}
                                >
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-secondary transition-all hover:border-success hover:shadow-sm">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                                            <RiArrowUpLine className="size-4 text-success" />
                                        </div>
                                        <Avatar
                                            size="sm"
                                            initials={employee.employee_name?.[0] || "?"}
                                            src={employee.employee_avatar || undefined}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-content text-sm truncate">
                                                {employee.employee_name}
                                            </h4>
                                            <p className="text-xs text-content-subtle truncate">
                                                {employee.employee_job_title}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-lg font-semibold text-content">
                                                {employee.overall_percentage}%
                                            </div>
                                            <Badge variant={badge.variant} className="text-xs mt-1">
                                                {badge.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </Card>

            {/* Employees Needing Attention */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <RiArrowDownLine className="size-5 text-danger" />
                    <h3 className="text-lg font-semibold text-content">Needs Attention</h3>
                </div>

                {employeesNeedingAttention.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-content-subtle">All employees performing well! 🎉</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {employeesNeedingAttention.map((employee) => {
                            const badge = getRatingBadge(employee.overall_percentage)
                            return (
                                <Link
                                    key={employee.employee_id}
                                    href={`/performance/employee/${employee.employee_id}`}
                                >
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-secondary transition-all hover:border-warning hover:shadow-sm">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                                            <RiArrowDownLine className="size-4 text-warning" />
                                        </div>
                                        <Avatar
                                            size="sm"
                                            initials={employee.employee_name?.[0] || "?"}
                                            src={employee.employee_avatar || undefined}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-content text-sm truncate">
                                                {employee.employee_name}
                                            </h4>
                                            <p className="text-xs text-content-subtle truncate">
                                                {employee.employee_job_title}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-lg font-semibold text-content">
                                                {employee.overall_percentage}%
                                            </div>
                                            <Badge variant={badge.variant} className="text-xs mt-1">
                                                {badge.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </Card>
        </div>
    )
}
