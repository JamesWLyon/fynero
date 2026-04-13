"use client";

import {
    Pie, PieChart, Cell, Tooltip, Legend,
    ResponsiveContainer, type PieLabelRenderProps,
} from "recharts";
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

    const pieData = resolved.map((e) => ({ name: e.label, value: e.value }));

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
                    {resolved.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}