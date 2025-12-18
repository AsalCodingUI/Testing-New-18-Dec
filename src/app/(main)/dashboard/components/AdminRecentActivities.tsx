"use client"

import { Avatar } from "@/components/Avatar"
import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import {
    RiCalendarEventLine,
    RiCheckLine,
    RiCloseCircleLine,
    RiFileTextLine,
    RiFolderLine
} from "@remixicon/react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
    id: string
    type: "review" | "leave_request" | "leave_approved" | "leave_rejected" | "project_assigned"
    user_name: string | null
    user_avatar: string | null
    description: string
    timestamp: string
}

interface AdminRecentActivitiesProps {
    activities: Activity[]
}

export function AdminRecentActivities({ activities }: AdminRecentActivitiesProps) {
    const getActivityIcon = (type: Activity["type"]) => {
        switch (type) {
            case "review":
                return <RiFileTextLine className="size-4 text-primary" />
            case "leave_request":
                return <RiCalendarEventLine className="size-4 text-warning" />
            case "leave_approved":
                return <RiCheckLine className="size-4 text-success" />
            case "leave_rejected":
                return <RiCloseCircleLine className="size-4 text-danger" />
            case "project_assigned":
                return <RiFolderLine className="size-4 text-info" />
            default:
                return <RiFileTextLine className="size-4" />
        }
    }

    const getActivityBgColor = (type: Activity["type"]) => {
        switch (type) {
            case "review":
                return "bg-primary/10"
            case "leave_request":
                return "bg-warning/10"
            case "leave_approved":
                return "bg-success/10"
            case "leave_rejected":
                return "bg-danger/10"
            case "project_assigned":
                return "bg-info/10"
            default:
                return "bg-surface-secondary"
        }
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-content">Recent Activities</h3>
                <Badge variant="zinc">{activities.length}</Badge>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm text-content-subtle">No recent activities</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-secondary"
                        >
                            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${getActivityBgColor(activity.type)}`}>
                                {getActivityIcon(activity.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                    <Avatar
                                        size="xs"
                                        initials={activity.user_name?.[0] || "?"}
                                        src={activity.user_avatar || undefined}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-content">
                                            <span className="font-medium">{activity.user_name || "Unknown"}</span>
                                            {" "}
                                            <span className="text-content-subtle">{activity.description}</span>
                                        </p>
                                        <p className="text-xs text-content-placeholder mt-0.5">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
