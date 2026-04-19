"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartData, type ChartDataEntry } from "@/app/config/useChartData";

interface SimpleBarChartProps {
    data: ChartDataEntry[];
}

const SimpleBarChart = ({ data }: SimpleBarChartProps) => {
    const resolved = useChartData(data);
    const ordered = data
        .map(d => resolved.find(r => r.label === d.label))
        .filter(Boolean) as typeof resolved;

    const chartData = [{
        name: "Summary",
        ...Object.fromEntries(ordered.map((e) => [e.label, e.value]))
    }];

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        {ordered.map((entry) => (
                            <Bar
                                key={entry.label}
                                dataKey={entry.label}
                                fill={entry.color}
                                radius={[10, 10, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Sepperate legend content */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2 shrink-0">
                {ordered.map((entry) => (
                    <div key={entry.label} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-white/80">{entry.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleBarChart;