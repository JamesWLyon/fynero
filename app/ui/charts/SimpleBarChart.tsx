"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartData, type ChartDataEntry } from "@/app/config/useChartData";
import type { LegendProps } from "recharts";

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
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend
                    verticalAlign="bottom"
                    height={1}
                    content={() => (
                        <div className="w-full px-2">
                             <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                                {ordered.map((entry) => (
                                    <div key={entry.label} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm shrink-0"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-sm text-white/80">
                                            {entry.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                />
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
    );
};

export default SimpleBarChart;