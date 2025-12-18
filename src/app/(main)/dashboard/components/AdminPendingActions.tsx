"use client"

import { Avatar } from "@/components/Avatar"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { RiArrowRightLine, RiCalendarEventLine, RiFileTextLine } from "@remixicon/react"
import { format } from "date-fns"
import Link from "next/link"

interface PendingReview {
    employee_id: string
    employee_name: string | null
    employee_avatar: string | null
    employee_job_title: string | null
    cycle_id: string
    cycle_name: string
    reviewers_pending: number
    total_reviewers: number
}

interface PendingLeave {
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
}

interface AdminPendingActionsProps {
    pendingReviews: PendingReview[]
    pendingLeaveApprovals: PendingLeave[]
}

export function AdminPendingActions({
    pendingReviews,
    pendingLeaveApprovals
}: AdminPendingActionsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pending Reviews */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <RiFileTextLine className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold text-content">Pending Reviews</h3>
                    </div>
                    <Badge variant="warning">{pendingReviews.length}</Badge>
                </div>

                {pendingReviews.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-content-subtle">All reviews completed! 🎉</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {pendingReviews.slice(0, 5).map((review) => (
                                <Link
                                    key={`${review.employee_id}-${review.cycle_id}`}
                                    href={`/performance?tab=360review`}
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-secondary transition-all hover:border-primary hover:shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                size="sm"
                                                initials={review.employee_name?.[0] || "?"}
                                                src={review.employee_avatar || undefined}
                                            />
                                            <div>
                                                <h4 className="font-medium text-content text-sm">
                                                    {review.employee_name}
                                                </h4>
                                                <p className="text-xs text-content-subtle">
                                                    {review.employee_job_title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="info" className="text-xs">
                                                {review.cycle_name}
                                            </Badge>
                                            <RiArrowRightLine className="size-4 text-content-subtle" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {pendingReviews.length > 5 && (
                            <div className="mt-4">
                                <Link href="/performance?tab=360review">
                                    <Button variant="secondary" size="sm" className="w-full">
                                        View All {pendingReviews.length} Pending Reviews
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Pending Leave Approvals */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <RiCalendarEventLine className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold text-content">Leave Approvals</h3>
                    </div>
                    <Badge variant="warning">{pendingLeaveApprovals.length}</Badge>
                </div>

                {pendingLeaveApprovals.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-content-subtle">No pending leave requests</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {pendingLeaveApprovals.slice(0, 5).map((leave) => {
                                const daysAgo = Math.floor(
                                    (new Date().getTime() - new Date(leave.created_at).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )

                                return (
                                    <Link key={leave.id} href="/leave">
                                        <div className="p-3 rounded-lg border border-border bg-surface-secondary transition-all hover:border-primary hover:shadow-sm">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size="sm"
                                                        initials={leave.user_name?.[0] || "?"}
                                                        src={leave.user_avatar || undefined}
                                                    />
                                                    <div>
                                                        <h4 className="font-medium text-content text-sm">
                                                            {leave.user_name}
                                                        </h4>
                                                        <p className="text-xs text-content-subtle">
                                                            {leave.leave_type} • {leave.days_requested} days
                                                        </p>
                                                    </div>
                                                </div>
                                                {daysAgo <= 2 && (
                                                    <Badge variant="error" className="text-xs">New</Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-content-subtle ml-11">
                                                {format(new Date(leave.start_date), "MMM d")} -{" "}
                                                {format(new Date(leave.end_date), "MMM d, yyyy")}
                                            </div>
                                            {leave.reason && (
                                                <div className="text-xs text-content-subtle ml-11 mt-1 line-clamp-1">
                                                    {leave.reason}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {pendingLeaveApprovals.length > 5 && (
                            <div className="mt-4">
                                <Link href="/leave">
                                    <Button variant="secondary" size="sm" className="w-full">
                                        View All {pendingLeaveApprovals.length} Requests
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    )
}
