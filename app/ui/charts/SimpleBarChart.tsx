"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useChartData, type ChartDataEntry } from "@/app/config/useChartData";

interface SimpleBarChartProps {
    data: ChartDataEntry[];
}

const SimpleBarChart = ({ data }: SimpleBarChartProps) => {
    const resolved = useChartData(data);

    const chartData = [{
        name: "Summary",
        ...Object.fromEntries(resolved.map((e) => [e.label, e.value]))
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
                <Legend />
                {resolved.map((entry) => (
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