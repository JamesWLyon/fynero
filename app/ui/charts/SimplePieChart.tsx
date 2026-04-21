"use client";

import { useEffect, useMemo, useState } from "react";
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
    smallSlicePercentThreshold?: number; // default = 1 (%)
}

type ResolvedEntry = {
    label: string;
    value: number;
    color: string;
};

type DisplayPieEntry = {
    name: string;
    value: number;
    color: string;
    isGroupedSmall?: boolean;
};

const RADIAN = Math.PI / 180;
const DEFAULT_SMALL_THRESHOLD = 1;
const GROUPED_SMALL_LABEL = "Other Small Categories";
const GROUPED_SMALL_COLOR = "#64748b";

function formatPercent(percent: number) {
    if (percent <= 0) return "0.000%";
    if (percent < 1) return `~ ${percent.toFixed(3)}%`;
    return `${percent.toFixed(0)}%`;
}

const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: PieLabelRenderProps) => {
    if (
        cx == null ||
        cy == null ||
        innerRadius == null ||
        outerRadius == null ||
        percent == null ||
        percent <= 0 ||
        percent < 0.01
    ) {
        return null;
    }

    const radius =
        Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
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
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function SimplePieChart({
    data,
    isAnimationActive = true,
    smallSlicePercentThreshold = DEFAULT_SMALL_THRESHOLD,
}: SimplePieChartProps) {
    const resolved = useChartData(data);
    const [outerRadius, setOuterRadius] = useState(80);
    const [showSmallBreakdown, setShowSmallBreakdown] = useState(false);

    useEffect(() => {
        function updateRadius() {
            const width = window.innerWidth;

            if (width >= 1536) {
                setOuterRadius(130);
            } else if (width >= 1280) {
                setOuterRadius(130);
            } else {
                setOuterRadius(130);
            }
        }

        updateRadius();
        window.addEventListener("resize", updateRadius);
        return () => window.removeEventListener("resize", updateRadius);
    }, []);

    const positiveEntries = useMemo(() => {
        return resolved.filter(
            (entry): entry is ResolvedEntry => Number(entry.value) > 0
        );
    }, [resolved]);

    const total = useMemo(() => {
        return positiveEntries.reduce((sum, entry) => sum + entry.value, 0);
    }, [positiveEntries]);

    const {
        pieEntries,
        groupedSmallEntries,
        groupedSmallTotal,
    } = useMemo(() => {
        if (total <= 0) {
            return {
                pieEntries: [] as DisplayPieEntry[],
                groupedSmallEntries: [] as ResolvedEntry[],
                groupedSmallTotal: 0,
            };
        }

        const thresholdDecimal = smallSlicePercentThreshold / 100;

        const regularEntries: DisplayPieEntry[] = [];
        const smallEntries: ResolvedEntry[] = [];

        for (const entry of positiveEntries) {
            const percentOfTotal = entry.value / total;

            if (percentOfTotal < thresholdDecimal) {
                smallEntries.push(entry);
            } else {
                regularEntries.push({
                    name: entry.label,
                    value: entry.value,
                    color: entry.color,
                });
            }
        }

        const smallTotal = smallEntries.reduce((sum, entry) => sum + entry.value, 0);

        const finalEntries =
            smallEntries.length > 0
                ? [
                    ...regularEntries,
                    {
                        name: GROUPED_SMALL_LABEL,
                        value: smallTotal,
                        color: GROUPED_SMALL_COLOR,
                        isGroupedSmall: true,
                    },
                ]
                : regularEntries;

        return {
            pieEntries: finalEntries,
            groupedSmallEntries: smallEntries,
            groupedSmallTotal: smallTotal,
        };
    }, [positiveEntries, total, smallSlicePercentThreshold]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setShowSmallBreakdown(false);
            }
        }

        if (showSmallBreakdown) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showSmallBreakdown]);

    const pieData = useMemo(() => {
        return pieEntries.map((entry) => ({
            name: entry.name,
            value: entry.value,
        }));
    }, [pieEntries]);

    const openSmallBreakdown = () => {
        if (groupedSmallEntries.length > 0) {
            setShowSmallBreakdown(true);
        }
    };

    const closeSmallBreakdown = () => {
        setShowSmallBreakdown(false);
    };

    if (pieEntries.length === 0 || total <= 0) {
        return (
            <div className="flex h-full w-full items-center justify-center text-white/50">
                No data available
            </div>
        );
    }

    return (
        <>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        labelLine={false}
                        label={renderCustomizedLabel}
                        dataKey="value"
                        isAnimationActive={isAnimationActive}
                        outerRadius={outerRadius}
                        onClick={(_, index) => {
                            const clicked = pieEntries[index];
                            if (clicked?.isGroupedSmall) {
                                openSmallBreakdown();
                            }
                        }}
                    >
                        {pieEntries.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{
                                    cursor: entry.isGroupedSmall ? "pointer" : "default",
                                }}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value, name) => [
                            `$${Number(value).toFixed(2)}`,
                            String(name),
                        ]}
                    />

                    <Legend
                        content={() => (
                            <div className="mt-2 w-full px-2">
                                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                                    {pieEntries.map((entry) => {
                                        const percent =
                                            total > 0 ? (entry.value / total) * 100 : 0;

                                        const isClickable = !!entry.isGroupedSmall;

                                        return (
                                            <button
                                                key={entry.name}
                                                type="button"
                                                onClick={() => {
                                                    if (isClickable) {
                                                        openSmallBreakdown();
                                                    }
                                                }}
                                                className={`flex items-center gap-2 ${
                                                    isClickable
                                                        ? "cursor-pointer"
                                                        : "cursor-default"
                                                }`}
                                            >
                                                <div
                                                    className="h-3 w-3 shrink-0 rounded-sm"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="whitespace-nowrap text-sm text-white/80">
                                                    {entry.name} {formatPercent(percent)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {showSmallBreakdown && groupedSmallEntries.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={closeSmallBreakdown}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {GROUPED_SMALL_LABEL}
                                </h3>
                                <p className="mt-1 text-sm text-white/60">
                                    Categories under {smallSlicePercentThreshold}% of the chart
                                </p>
                                <p className="mt-1 text-sm text-white/80">
                                    Combined total: ${groupedSmallTotal.toFixed(2)} (
                                    {formatPercent((groupedSmallTotal / total) * 100)})
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeSmallBreakdown}
                                className="rounded-md px-2 py-1 text-white/60 hover:bg-white/10 hover:text-white"
                                aria-label="Close popup"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            <div className="space-y-2">
                                {groupedSmallEntries
                                    .slice()
                                    .sort((a, b) => b.value - a.value)
                                    .map((entry) => {
                                        const percent =
                                            total > 0 ? (entry.value / total) * 100 : 0;

                                        return (
                                            <div
                                                key={entry.label}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 shrink-0 rounded-sm"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <span className="truncate text-sm text-white/85">
                                                        {entry.label}
                                                    </span>
                                                </div>

                                                <div className="shrink-0 text-right text-sm text-white/70">
                                                    <div>${entry.value.toFixed(2)}</div>
                                                    <div>{formatPercent(percent)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}