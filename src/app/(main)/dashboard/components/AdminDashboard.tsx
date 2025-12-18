"use client"

import type { AdminDashboardData } from "../actions/dashboard-admin-actions"
import { AdminAttendanceOverview } from "./AdminAttendanceOverview"
import { AdminEmployeeSpotlight } from "./AdminEmployeeSpotlight"
import { AdminMetricsOverview } from "./AdminMetricsOverview"
import { AdminPendingActions } from "./AdminPendingActions"
import { AdminPerformanceDistribution } from "./AdminPerformanceDistribution"
import { AdminRecentActivities } from "./AdminRecentActivities"

interface AdminDashboardProps {
    data: AdminDashboardData
}

export function AdminDashboard({ data }: AdminDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-content">
                    Dashboard Overview 📊
                </h1>
                <p className="mt-1 text-sm text-content-subtle">
                    Team performance, pending actions, and recent activities
                </p>
            </div>

            {/* Key Metrics */}
            <div>
                <h2 className="text-lg font-semibold text-content mb-4">Key Metrics</h2>
                <AdminMetricsOverview
                    totalEmployees={data.teamMetrics.totalEmployees}
                    pendingReviews={data.teamMetrics.pendingReviews}
                    pendingLeaveApprovals={data.teamMetrics.pendingLeaveApprovals}
                    todayAttendanceRate={data.teamMetrics.todayAttendanceRate}
                    avgTeamPerformance={data.teamMetrics.avgTeamPerformance}
                />
            </div>

            {/* Pending Actions */}
            <div>
                <h2 className="text-lg font-semibold text-content mb-4">Pending Actions</h2>
                <AdminPendingActions
                    pendingReviews={data.pendingReviewsList}
                    pendingLeaveApprovals={data.pendingLeaveApprovals}
                />
            </div>

            {/* Two Column Layout for Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Performance Distribution */}
                <AdminPerformanceDistribution
                    distribution={data.performanceDistribution}
                />

                {/* Attendance Overview */}
                <AdminAttendanceOverview
                    totalToday={data.attendanceOverview.totalToday}
                    onTime={data.attendanceOverview.onTime}
                    late={data.attendanceOverview.late}
                    onLeave={data.attendanceOverview.onLeave}
                    absent={data.attendanceOverview.absent}
                />
            </div>

            {/* Employee Spotlight */}
            <div>
                <h2 className="text-lg font-semibold text-content mb-4">Employee Spotlight</h2>
                <AdminEmployeeSpotlight
                    topPerformers={data.topPerformers}
                    employeesNeedingAttention={data.employeesNeedingAttention}
                />
            </div>

            {/* Recent Activities */}
            <div>
                <h2 className="text-lg font-semibold text-content mb-4">Recent Activities</h2>
                <AdminRecentActivities activities={data.recentActivities} />
            </div>
        </div>
    )
}
