"use server"

import { createClient } from "@/lib/supabase/server"

export type AdminDashboardData = {
    teamMetrics: {
        totalEmployees: number
        pendingReviews: number
        pendingLeaveApprovals: number
        todayAttendanceRate: number
        avgTeamPerformance: number | null
    }
    performanceDistribution: {
        outstanding: number
        aboveExpectation: number
        meetsExpectation: number
        belowExpectation: number
        needsImprovement: number
    }
    pendingReviewsList: Array<{
        employee_id: string
        employee_name: string | null
        employee_avatar: string | null
        employee_job_title: string | null
        cycle_id: string
        cycle_name: string
        reviewers_pending: number
        total_reviewers: number
    }>
    pendingLeaveApprovals: Array<{
        id: string
        user_id: string
        user_name: string | null
        user_avatar: string | null
        leave_type: string
        start_date: string
        end_date: string
        days_requested: number
        reason: string | null
        created_at: string
    }>
    attendanceOverview: {
        totalToday: number
        onTime: number
        late: number
        onLeave: number
        absent: number
    }
    recentActivities: Array<{
        id: string
        type: "review" | "leave_request" | "leave_approved" | "leave_rejected" | "project_assigned"
        user_name: string | null
        user_avatar: string | null
        description: string
        timestamp: string
    }>
    topPerformers: Array<{
        employee_id: string
        employee_name: string | null
        employee_avatar: string | null
        employee_job_title: string | null
        overall_percentage: number
    }>
    employeesNeedingAttention: Array<{
        employee_id: string
        employee_name: string | null
        employee_avatar: string | null
        employee_job_title: string | null
        overall_percentage: number
        reason: string
    }>
}

export async function getAdminDashboardData(): Promise<{
    success: boolean
    data?: AdminDashboardData
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user and verify admin/stakeholder role
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: "Unauthorized" }
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!profile || (profile.role !== "admin" && profile.role !== "stakeholder")) {
            return { success: false, error: "Access denied" }
        }

        const todayStr = new Date().toISOString().split("T")[0]
        const currentQuarter = "2025-Q1"

        // Parallel fetch all data
        const [
            employeesResult,
            pendingReviewsResult,
            pendingLeavesResult,
            todayAttendanceResult,
            reviewSummaryResult,
            recentReviewsResult,
            recentLeavesResult,
        ] = await Promise.all([
            // Total employees count
            supabase
                .from("profiles")
                .select("id", { count: "exact", head: true }),

            // Pending reviews (self_score is null)
            supabase
                .from("performance_reviews")
                .select(`
                    employee_id,
                    cycle_id,
                    profiles!performance_reviews_employee_id_fkey (
                        full_name,
                        avatar_url,
                        job_title
                    ),
                    review_cycles!inner (
                        name
                    )
                `)
                .is("self_score", null)
                .limit(20),

            // Pending leave approvals
            supabase
                .from("leave_requests")
                .select(`
                    id,
                    user_id,
                    leave_type,
                    start_date,
                    end_date,
                    days_requested,
                    reason,
                    created_at,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(20),

            // Today's attendance
            supabase
                .from("attendance_logs")
                .select("id, clock_in, status")
                .eq("date", todayStr),

            // Performance summaries for distribution
            supabase
                .from("review_summary")
                .select("employee_id, overall_percentage, profiles (full_name, avatar_url, job_title)")
                .eq("cycle_id", currentQuarter),

            // Recent performance reviews (last 10)
            supabase
                .from("performance_reviews")
                .select(`
                    created_at,
                    employee_id,
                    profiles!performance_reviews_employee_id_fkey (
                        full_name,
                        avatar_url
                    )
                `)
                .not("self_score", "is", null)
                .order("created_at", { ascending: false })
                .limit(10),

            // Recent leave requests (last 10)
            supabase
                .from("leave_requests")
                .select(`
                    id,
                    created_at,
                    status,
                    leave_type,
                    user_id,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .order("created_at", { ascending: false })
                .limit(10),
        ])

        // Calculate team metrics
        const totalEmployees = employeesResult.count || 0
        const pendingReviews = pendingReviewsResult.data?.length || 0
        const pendingLeaveApprovals = pendingLeavesResult.data?.length || 0

        // Calculate attendance rate
        const attendanceLogs = todayAttendanceResult.data || []
        const onTime = attendanceLogs.filter(log => !log.status || log.status === "On Time").length
        const late = attendanceLogs.filter(log => log.status === "Late").length

        // Get employees on leave today
        const { count: onLeaveCount } = await supabase
            .from("leave_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved")
            .lte("start_date", todayStr)
            .gte("end_date", todayStr)

        const totalPresent = onTime + late
        const absent = totalEmployees - totalPresent - (onLeaveCount || 0)
        const attendanceRate = totalEmployees > 0 ? ((totalPresent + (onLeaveCount || 0)) / totalEmployees) * 100 : 0


        // Calculate performance distribution
        const reviewSummaries = reviewSummaryResult.data || []
        const distribution = {
            outstanding: 0,
            aboveExpectation: 0,
            meetsExpectation: 0,
            belowExpectation: 0,
            needsImprovement: 0,
        }

        let totalPerformance = 0
        reviewSummaries.forEach((summary: any) => {
            const percentage = summary.overall_percentage
            totalPerformance += percentage

            if (percentage >= 95) distribution.outstanding++
            else if (percentage >= 85) distribution.aboveExpectation++
            else if (percentage >= 75) distribution.meetsExpectation++
            else if (percentage >= 60) distribution.belowExpectation++
            else distribution.needsImprovement++
        })

        const avgTeamPerformance = reviewSummaries.length > 0
            ? Math.round((totalPerformance / reviewSummaries.length) * 10) / 10
            : null

        // Format pending reviews list
        const pendingReviewsList = (pendingReviewsResult.data || []).map((review: any) => ({
            employee_id: review.employee_id,
            employee_name: review.profiles?.full_name || null,
            employee_avatar: review.profiles?.avatar_url || null,
            employee_job_title: review.profiles?.job_title || null,
            cycle_id: review.cycle_id,
            cycle_name: review.review_cycles?.name || "",
            reviewers_pending: 0, // Can be enhanced later
            total_reviewers: 5, // Default assumption
        }))

        // Format pending leave approvals
        const pendingLeaveApprovalsFormatted = (pendingLeavesResult.data || []).map((leave: any) => ({
            id: leave.id,
            user_id: leave.user_id,
            user_name: leave.profiles?.full_name || null,
            user_avatar: leave.profiles?.avatar_url || null,
            leave_type: leave.leave_type,
            start_date: leave.start_date,
            end_date: leave.end_date,
            days_requested: leave.days_requested,
            reason: leave.reason || null,
            created_at: leave.created_at,
        }))

        // Build recent activities
        const recentActivities: AdminDashboardData["recentActivities"] = []

        // Add recent reviews
        recentReviewsResult.data?.forEach((review: any) => {
            recentActivities.push({
                id: `review-${review.employee_id}`,
                type: "review",
                user_name: review.profiles?.full_name || null,
                user_avatar: review.profiles?.avatar_url || null,
                description: "Submitted 360 review",
                timestamp: review.created_at,
            })
        })

        // Add recent leave requests
        recentLeavesResult.data?.forEach((leave: any) => {
            let activityType: "leave_request" | "leave_approved" | "leave_rejected" = "leave_request"
            let description = "Requested leave"

            if (leave.status === "approved") {
                activityType = "leave_approved"
                description = `Leave approved (${leave.leave_type})`
            } else if (leave.status === "rejected") {
                activityType = "leave_rejected"
                description = `Leave rejected (${leave.leave_type})`
            } else {
                description = `Requested ${leave.leave_type} leave`
            }

            recentActivities.push({
                id: `leave-${leave.id}`,
                type: activityType,
                user_name: leave.profiles?.full_name || null,
                user_avatar: leave.profiles?.avatar_url || null,
                description,
                timestamp: leave.created_at,
            })
        })

        // Sort activities by timestamp
        recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        // Get top performers and employees needing attention
        const sortedByPerformance = [...reviewSummaries].sort((a: any, b: any) =>
            b.overall_percentage - a.overall_percentage
        )

        const topPerformers = sortedByPerformance.slice(0, 5).map((summary: any) => ({
            employee_id: summary.employee_id,
            employee_name: summary.profiles?.full_name || null,
            employee_avatar: summary.profiles?.avatar_url || null,
            employee_job_title: summary.profiles?.job_title || null,
            overall_percentage: summary.overall_percentage,
        }))

        const employeesNeedingAttention = sortedByPerformance
            .filter((s: any) => s.overall_percentage < 75)
            .slice(0, 5)
            .map((summary: any) => ({
                employee_id: summary.employee_id,
                employee_name: summary.profiles?.full_name || null,
                employee_avatar: summary.profiles?.avatar_url || null,
                employee_job_title: summary.profiles?.job_title || null,
                overall_percentage: summary.overall_percentage,
                reason: summary.overall_percentage < 60
                    ? "Performance significantly below target"
                    : "Performance below expectation",
            }))

        // Build dashboard data
        const dashboardData: AdminDashboardData = {
            teamMetrics: {
                totalEmployees,
                pendingReviews,
                pendingLeaveApprovals,
                todayAttendanceRate: Math.round(attendanceRate * 10) / 10,
                avgTeamPerformance,
            },
            performanceDistribution: distribution,
            pendingReviewsList,
            pendingLeaveApprovals: pendingLeaveApprovalsFormatted,
            attendanceOverview: {
                totalToday: totalPresent,
                onTime,
                late,
                onLeave: onLeaveCount || 0,
                absent: Math.max(0, absent),
            },
            recentActivities: recentActivities.slice(0, 15),
            topPerformers,
            employeesNeedingAttention,
        }

        return { success: true, data: dashboardData }
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error)
        return { success: false, error: "Failed to fetch dashboard data" }
    }
}
