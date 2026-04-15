"use client";

import { useEffect, useState } from "react";
import {
    Pie,
    PieChart,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    type PieLabelRenderProps,
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
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > ncx ? "start" : "end"}
            dominantBaseline="central"
        >
            {`${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
    );
};

export default function SimplePieChart({
    data,
    isAnimationActive = true,
}: SimplePieChartProps) {
    const resolved = useChartData(data);

    const [outerRadius, setOuterRadius] = useState(80);

    useEffect(() => {
        function updateRadius() {
            const width = window.innerWidth;

            if (width >= 1536) {
                setOuterRadius(130); // large desktop
            } else if (width >= 1280) {
                setOuterRadius(130); // desktop
            } else {
                setOuterRadius(130); // laptop + tablet + mobile
            }
        }

        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    const ordered = data
        .map((d) => resolved.find((r) => r.label === d.label))
        .filter(Boolean) as typeof resolved;

    const filtered = ordered.filter((e) => e.value > 0);

    const total = filtered.reduce((sum, e) => sum + e.value, 0);

    const pieData = filtered.map((e) => ({
        name: e.label,
        value: e.value,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={pieData}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    dataKey="value"
                    isAnimationActive={isAnimationActive}
                    outerRadius={outerRadius}
                >
                    {filtered.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>

                <Tooltip />

                <Legend
                    content={() => (
                        <div className="w-full mt-2 px-2">
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                                {filtered.map((entry) => (
                                    <div key={entry.label} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm shrink-0"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-sm text-white/80 whitespace-nowrap">
                                            {entry.label} {((entry.value / total) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}