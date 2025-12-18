"use client"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { StatsCard } from "@/components/StatsCard"
import {
    RiCalendarCheckLine,
    RiCalendarLine,
    RiCheckboxCircleLine,
    RiTimeLine
} from "@remixicon/react"
import { format } from "date-fns"
import Link from "next/link"

interface AttendanceLog {
    id: string
    date: string
    clock_in: string | null
    clock_out: string | null
    status: string | null
}

interface LeaveRequest {
    id: string
    leave_type: string
    start_date: string
    end_date: string
    status: string
    days_requested: number
}

interface EmployeeAttendanceWidgetProps {
    leaveBalance: number
    recentAttendance: AttendanceLog[]
    recentLeaveRequests: LeaveRequest[]
}

export function EmployeeAttendanceWidget({
    leaveBalance,
    recentAttendance,
    recentLeaveRequests,
}: EmployeeAttendanceWidgetProps) {
    const onTimeCount = recentAttendance.filter(
        (log) => !log.status || log.status === "On Time"
    ).length
    const lateCount = recentAttendance.filter((log) => log.status === "Late").length
    const attendanceRate = recentAttendance.length > 0
        ? Math.round((onTimeCount / recentAttendance.length) * 100)
        : 100

    const pendingLeave = recentLeaveRequests.find((req) => req.status === "pending")
    const approvedLeave = recentLeaveRequests.filter((req) => req.status === "approved")

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Leave Balance Card */}
            <Link href="/leave">
                <StatsCard
                    title="Leave Balance"
                    value={`${leaveBalance} days`}
                    icon={<RiCalendarLine className="size-5" />}
                    className="transition-all hover:shadow-md"
                />
            </Link>

            {/* Attendance Rate Card */}
            <Link href="/attendance">
                <StatsCard
                    title="Attendance (Last 7 Days)"
                    value={`${attendanceRate}%`}
                    icon={<RiCheckboxCircleLine className="size-5" />}
                    className="transition-all hover:shadow-md"
                />
            </Link>

            {/* Recent Leave Status */}
            <Card className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-content mb-4">Leave Status</h3>

                {pendingLeave && (
                    <div className="mb-4 p-3 rounded-lg border border-warning/20 bg-warning/5">
                        <div className="flex items-center gap-2 mb-2">
                            <RiTimeLine className="size-4 text-warning" />
                            <span className="text-sm font-medium text-content">Pending Approval</span>
                        </div>
                        <div className="text-sm text-content-subtle">
                            <span className="font-medium">{pendingLeave.leave_type}</span>
                            {" • "}
                            {format(new Date(pendingLeave.start_date), "MMM d")} -{" "}
                            {format(new Date(pendingLeave.end_date), "MMM d, yyyy")}
                            {" • "}
                            {pendingLeave.days_requested} days
                        </div>
                    </div>
                )}

                {approvedLeave.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-content-subtle mb-2">
                            Recent Approved Leave
                        </h4>
                        <div className="space-y-2">
                            {approvedLeave.slice(0, 2).map((leave) => (
                                <div
                                    key={leave.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-surface-secondary"
                                >
                                    <div className="flex items-center gap-2">
                                        <RiCalendarCheckLine className="size-4 text-success" />
                                        <span className="text-sm text-content">
                                            {leave.leave_type}
                                        </span>
                                    </div>
                                    <span className="text-xs text-content-subtle">
                                        {format(new Date(leave.start_date), "MMM d")} -{" "}
                                        {format(new Date(leave.end_date), "MMM d")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!pendingLeave && approvedLeave.length === 0 && (
                    <div className="text-center py-4">
                        <p className="text-sm text-content-subtle">No recent leave requests</p>
                        <Link href="/leave">
                            <Badge variant="info" className="mt-2">Request Leave</Badge>
                        </Link>
                    </div>
                )}

                {/* Recent Attendance Summary */}
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-content-subtle mb-3">
                        Last 7 Days Attendance
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full bg-success" />
                            <span className="text-content-subtle">On Time: {onTimeCount}</span>
                        </div>
                        {lateCount > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-warning" />
                                <span className="text-content-subtle">Late: {lateCount}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
