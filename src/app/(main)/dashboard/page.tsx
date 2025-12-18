import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAdminDashboardData } from "./actions/dashboard-admin-actions"
import { getEmployeeDashboardData } from "./actions/dashboard-employee-actions"
import { AdminDashboard } from "./components/AdminDashboard"
import { EmployeeDashboard } from "./components/EmployeeDashboard"

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Get user profile to determine role
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-content-subtle">Profile not found</p>
            </div>
        )
    }

    const isAdminOrStakeholder = profile.role === 'admin' || profile.role === 'stakeholder'

    // Route to appropriate dashboard based on role
    if (isAdminOrStakeholder) {
        // Admin/Stakeholder Dashboard
        const result = await getAdminDashboardData()

        if (!result.success || !result.data) {
            return (
                <div className="text-center py-12">
                    <p className="text-content-subtle">
                        {result.error || "Failed to load dashboard data"}
                    </p>
                </div>
            )
        }

        return <AdminDashboard data={result.data} />
    } else {
        // Employee Dashboard
        const result = await getEmployeeDashboardData()

        if (!result.success || !result.data) {
            return (
                <div className="text-center py-12">
                    <p className="text-content-subtle">
                        {result.error || "Failed to load dashboard data"}
                    </p>
                </div>
            )
        }

        return <EmployeeDashboard data={result.data} />
    }
}