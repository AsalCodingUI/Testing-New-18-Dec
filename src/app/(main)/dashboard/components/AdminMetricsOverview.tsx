"use client"

import { StatsCard } from "@/components/StatsCard"
import {
    RiCheckboxCircleLine,
    RiFileTextLine,
    RiGroupLine,
    RiStarLine,
    RiTimeLine
} from "@remixicon/react"
import Link from "next/link"

interface AdminMetricsOverviewProps {
    totalEmployees: number
    pendingReviews: number
    pendingLeaveApprovals: number
    todayAttendanceRate: number
    avgTeamPerformance: number | null
}

export function AdminMetricsOverview({
    totalEmployees,
    pendingReviews,
    pendingLeaveApprovals,
    todayAttendanceRate,
    avgTeamPerformance,
}: AdminMetricsOverviewProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/teams">
                <StatsCard
                    title="Total Employees"
                    value={totalEmployees}
                    icon={<RiGroupLine className="size-5" />}
                    className="transition-all hover:shadow-md"
                />
            </Link>

            <Link href="/performance?tab=360review">
                <StatsCard
                    title="Pending Reviews"
                    value={pendingReviews}
                    icon={<RiFileTextLine className="size-5" />}
                    className="transition-all hover:shadow-md"
                />
            </Link>

            <Link href="/leave">
                <StatsCard
                    title="Leave Approvals"
                    value={pendingLeaveApprovals}
                    icon={<RiTimeLine className="size-5" />}
                    className="transition-all hover:shadow-md"
                />
            </Link>

            <Link href="/attendance">
                <StatsCard
                    title="Attendance Today"
                    value={`${todayAttendanceRate}%`}
                    icon={<RiCheckboxCircleLine className="size-5" />}
                    className="transition-all hover:shadow-md"
                />
            </Link>

            <StatsCard
                title="Avg Team Score"
                value={avgTeamPerformance !== null ? `${avgTeamPerformance}%` : "—"}
                icon={<RiStarLine className="size-5" />}
            />
        </div>
    )
}
