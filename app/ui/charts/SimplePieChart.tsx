"use client";

import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer, type PieLabelRenderProps } from "recharts";
import { useChartData, type ChartDataEntry } from "@/app/config/useChartData";

interface SimplePieChartProps {
    data: ChartDataEntry[];
    isAnimationActive?: boolean;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
}: PieLabelRenderProps) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) return null;
    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
    const ncx = Number(cx);
    const ncy = Number(cy);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor={x > ncx ? "start" : "end"} dominantBaseline="central">
            {`${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
    );
};

export default function SimplePieChart({ data, isAnimationActive = true }: SimplePieChartProps) {
    const resolved = useChartData(data);

    const ordered = data
        .map(d => resolved.find(r => r.label === d.label))
        .filter(Boolean) as typeof resolved;

    const pieData = ordered.map((e) => ({ name: e.label, value: e.value }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={pieData}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    dataKey="value"
                    isAnimationActive={isAnimationActive}
                >
                    {ordered.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend
                    content={() => (
                        <div className="flex gap-4 justify-center mt-2">
                            {ordered.map((entry) => (
                                <div key={entry.label} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm text-white/80">
                                        {entry.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}