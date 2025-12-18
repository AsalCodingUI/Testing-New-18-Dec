"use client"

import { Card } from "@/components/Card"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AdminPerformanceDistributionProps {
    distribution: {
        outstanding: number
        aboveExpectation: number
        meetsExpectation: number
        belowExpectation: number
        needsImprovement: number
    }
}

export function AdminPerformanceDistribution({ distribution }: AdminPerformanceDistributionProps) {
    const data = [
        {
            name: "Outstanding",
            count: distribution.outstanding,
            color: "hsl(var(--chart-1))",
        },
        {
            name: "Above Exp.",
            count: distribution.aboveExpectation,
            color: "hsl(var(--chart-2))",
        },
        {
            name: "Meets Exp.",
            count: distribution.meetsExpectation,
            color: "hsl(var(--chart-3))",
        },
        {
            name: "Below Exp.",
            count: distribution.belowExpectation,
            color: "hsl(var(--chart-4))",
        },
        {
            name: "Needs Imp.",
            count: distribution.needsImprovement,
            color: "hsl(var(--chart-5))",
        },
    ]

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)

    return (
        <Card>
            <h3 className="text-lg font-semibold text-content mb-4">
                Performance Distribution
            </h3>

            {total === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm text-content-subtle">No performance data available</p>
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--content-subtle))"
                                style={{ fontSize: "12px" }}
                            />
                            <YAxis
                                stroke="hsl(var(--content-subtle))"
                                style={{ fontSize: "12px" }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--surface))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "hsl(var(--content))" }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                        {data.map((item) => {
                            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                            return (
                                <div key={item.name} className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <div
                                            className="size-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm font-medium text-content">
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="text-xs text-content-subtle">{item.name}</div>
                                    <div className="text-xs text-content-placeholder">{percentage}%</div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </Card>
    )
}
