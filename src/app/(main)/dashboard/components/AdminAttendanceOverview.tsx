"use client"

import { Card } from "@/components/Card"
import { RiCheckboxCircleLine, RiTimeLine, RiUserLine } from "@remixicon/react"

interface AdminAttendanceOverviewProps {
    totalToday: number
    onTime: number
    late: number
    onLeave: number
    absent: number
}

export function AdminAttendanceOverview({
    totalToday,
    onTime,
    late,
    onLeave,
    absent,
}: AdminAttendanceOverviewProps) {
    const total = totalToday + onLeave + absent
    const onTimePercentage = total > 0 ? Math.round((onTime / total) * 100) : 0

    return (
        <Card>
            <h3 className="text-lg font-semibold text-content mb-4">
                Today&apos;s Attendance Overview
            </h3>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-success/10">
                    <RiCheckboxCircleLine className="size-6 text-success mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-content">{onTime}</div>
                    <div className="text-xs text-content-subtle mt-1">On Time</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-warning/10">
                    <RiTimeLine className="size-6 text-warning mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-content">{late}</div>
                    <div className="text-xs text-content-subtle mt-1">Late</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-info/10">
                    <RiUserLine className="size-6 text-info mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-content">{onLeave}</div>
                    <div className="text-xs text-content-subtle mt-1">On Leave</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-danger/10">
                    <RiUserLine className="size-6 text-danger mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-content">{absent}</div>
                    <div className="text-xs text-content-subtle mt-1">Absent</div>
                </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg border border-border bg-surface-secondary">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-content-subtle">Overall Attendance Rate</div>
                        <div className="text-2xl font-semibold text-content mt-1">
                            {onTimePercentage}%
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-content-subtle">Present Today</div>
                        <div className="text-lg font-medium text-content mt-1">
                            {totalToday} / {total}
                        </div>
                    </div>
                </div>

                {/* Visual breakdown */}
                <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden">
                    {total > 0 && (
                        <>
                            <div
                                className="bg-success"
                                style={{ width: `${(onTime / total) * 100}%` }}
                            />
                            <div
                                className="bg-warning"
                                style={{ width: `${(late / total) * 100}%` }}
                            />
                            <div
                                className="bg-info"
                                style={{ width: `${(onLeave / total) * 100}%` }}
                            />
                            <div
                                className="bg-danger"
                                style={{ width: `${(absent / total) * 100}%` }}
                            />
                        </>
                    )}
                </div>
            </div>
        </Card>
    )
}
