"use server"

import { createClient } from "@/lib/supabase/server"

export type EmployeeDashboardData = {
    user: {
        id: string
        full_name: string | null
        job_title: string | null
        avatar_url: string | null
    }
    leaveBalance: number
    recentLeaveRequests: Array<{
        id: string
        leave_type: string
        start_date: string
        end_date: string
        status: string
        days_requested: number
    }>
    recentAttendance: Array<{
        id: string
        date: string
        clock_in: string | null
        clock_out: string | null
        status: string | null
    }>
    performanceOverview: {
        slaScore: number | null
        reviewScore: number | null
        workQualityScore: number | null
        quarter: string
    }
    activeProjects: Array<{
        id: string
        name: string
        status: string
        quarter_id: string
        end_date: string
        sla_percentage: number
        quality_achieved: number
        quality_total: number
    }>
    upcomingReviews: Array<{
        cycle_id: string
        cycle_name: string
        end_date: string
        has_submitted: boolean
    }>
    competencyScores: {
        leadership: number
        quality: number
        reliability: number
        communication: number
        initiative: number
    } | null
}

export async function getEmployeeDashboardData(): Promise<{
    success: boolean
    data?: EmployeeDashboardData
    error?: string
}> {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: "Unauthorized" }
        }

        // Get user profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, job_title, avatar_url")
            .eq("id", user.id)
            .single()

        if (!profile) {
            return { success: false, error: "Profile not found" }
        }

        // Current quarter (default to 2025-Q1 for now, can be dynamic)
        const currentQuarter = "2025-Q1"

        // Parallel fetch all data
        const [
            leaveBalanceResult,
            recentLeaveResult,
            recentAttendanceResult,
            reviewSummaryResult,
            projectAssignmentsResult,
            reviewCyclesResult,
        ] = await Promise.all([
            // Leave balance
            supabase
                .from("leave_balances")
                .select("remaining")
                .eq("user_id", user.id)
                .single(),

            // Recent leave requests (last 5)
            supabase
                .from("leave_requests")
                .select("id, leave_type, start_date, end_date, status, days_requested")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5),

            // Recent attendance (last 7 days)
            supabase
                .from("attendance_logs")
                .select("id, date, clock_in, clock_out, status")
                .eq("user_id", user.id)
                .order("date", { ascending: false })
                .limit(7),

            // Performance overview from review_summary
            supabase
                .from("review_summary")
                .select("overall_percentage")
                .eq("employee_id", user.id)
                .eq("cycle_id", currentQuarter)
                .maybeSingle(),

            // Active projects with scores
            supabase
                .from("project_assignments")
                .select(`
                    id,
                    projects!inner (
                        id,
                        name,
                        status,
                        quarter_id,
                        end_date
                    ),
                    project_sla_scores (
                        score_achieved,
                        weight_percentage
                    ),
                    project_work_quality_scores (
                        is_achieved
                    )
                `)
                .eq("user_id", user.id)
                .eq("projects.status", "Active")
                .limit(10),

            // Upcoming review cycles
            supabase
                .from("review_cycles")
                .select("id, name, end_date, is_active")
                .gte("end_date", new Date().toISOString())
                .order("end_date", { ascending: true })
                .limit(3),
        ])

        // Get competency scores from latest review
        const { data: latestReview } = await supabase
            .from("performance_reviews")
            .select(`
                score_leadership,
                score_quality,
                score_reliability,
                score_communication,
                score_initiative,
                peer_reviews!inner (
                    score_leadership,
                    score_quality,
                    score_reliability,
                    score_communication,
                    score_initiative
                )
            `)
            .eq("employee_id", user.id)
            .not("self_score", "is", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        // Calculate competency scores
        let competencyScores = null
        if (latestReview) {
            const peerReviews = latestReview.peer_reviews || []
            const totalReviewers = peerReviews.length + 1 // peers + self

            const calcAvg = (selfScore: number, peerScores: number[]) => {
                const total = selfScore + peerScores.reduce((sum, score) => sum + score, 0)
                return ((total / totalReviewers) / 5) * 100
            }

            competencyScores = {
                leadership: calcAvg(
                    latestReview.score_leadership,
                    peerReviews.map((p: any) => p.score_leadership)
                ),
                quality: calcAvg(
                    latestReview.score_quality,
                    peerReviews.map((p: any) => p.score_quality)
                ),
                reliability: calcAvg(
                    latestReview.score_reliability,
                    peerReviews.map((p: any) => p.score_reliability)
                ),
                communication: calcAvg(
                    latestReview.score_communication,
                    peerReviews.map((p: any) => p.score_communication)
                ),
                initiative: calcAvg(
                    latestReview.score_initiative,
                    peerReviews.map((p: any) => p.score_initiative)
                ),
            }
        }

        // Check which review cycles user has submitted
        const reviewCycles = reviewCyclesResult.data || []
        const { data: submittedReviews } = await supabase
            .from("performance_reviews")
            .select("cycle_id")
            .eq("employee_id", user.id)
            .not("self_score", "is", null)
            .in("cycle_id", reviewCycles.map(c => c.id))

        const submittedCycleIds = new Set(submittedReviews?.map(r => r.cycle_id) || [])

        // Format active projects with calculated scores
        const activeProjects = (projectAssignmentsResult.data || []).map((assignment: any) => {
            const slaScores = assignment.project_sla_scores || []
            const qualityScores = assignment.project_work_quality_scores || []

            const realAchieve = slaScores.reduce((sum: number, s: any) => sum + s.score_achieved, 0)
            const bestAchieve = slaScores.reduce((sum: number, s: any) => sum + (s.weight_percentage * 120), 0)
            const slaPercentage = bestAchieve > 0 ? (realAchieve / bestAchieve) * 100 : 0

            const qualityAchieved = qualityScores.filter((q: any) => q.is_achieved).length
            const qualityTotal = qualityScores.length

            return {
                id: assignment.projects.id,
                name: assignment.projects.name,
                status: assignment.projects.status,
                quarter_id: assignment.projects.quarter_id,
                end_date: assignment.projects.end_date,
                sla_percentage: Math.round(slaPercentage * 10) / 10,
                quality_achieved: qualityAchieved,
                quality_total: qualityTotal,
            }
        })

        // Build dashboard data
        const dashboardData: EmployeeDashboardData = {
            user: profile,
            leaveBalance: leaveBalanceResult.data?.remaining || 0,
            recentLeaveRequests: recentLeaveResult.data || [],
            recentAttendance: recentAttendanceResult.data || [],
            performanceOverview: {
                slaScore: null, // Will be calculated from projects
                reviewScore: reviewSummaryResult.data?.overall_percentage || null,
                workQualityScore: null, // Will be calculated from projects
                quarter: currentQuarter,
            },
            activeProjects,
            upcomingReviews: reviewCycles.map(cycle => ({
                cycle_id: cycle.id,
                cycle_name: cycle.name,
                end_date: cycle.end_date,
                has_submitted: submittedCycleIds.has(cycle.id),
            })),
            competencyScores,
        }

        // Calculate average SLA and work quality from active projects
        if (activeProjects.length > 0) {
            const avgSLA = activeProjects.reduce((sum, p) => sum + p.sla_percentage, 0) / activeProjects.length
            const totalQuality = activeProjects.reduce((sum, p) => sum + p.quality_total, 0)
            const achievedQuality = activeProjects.reduce((sum, p) => sum + p.quality_achieved, 0)
            const avgQuality = totalQuality > 0 ? (achievedQuality / totalQuality) * 100 : 0

            dashboardData.performanceOverview.slaScore = Math.round(avgSLA * 10) / 10
            dashboardData.performanceOverview.workQualityScore = Math.round(avgQuality * 10) / 10
        }

        return { success: true, data: dashboardData }
    } catch (error) {
        console.error("Error fetching employee dashboard data:", error)
        return { success: false, error: "Failed to fetch dashboard data" }
    }
}
