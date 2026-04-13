import { useMemo } from "react";
import { resolveColor } from "./chartColors";

export interface ChartDataEntry {
    label: string;
    value: number;
    colorKey?: string;
}

export interface ResolvedChartEntry {
    label: string;
    value: number;
    color: string;
}

export function useChartData(entries: ChartDataEntry[]): ResolvedChartEntry[] {
    return useMemo(
        () =>
            entries.map((entry) => ({
                label: entry.label,
                value: entry.value,
                color: resolveColor(
                    entry.colorKey ?? entry.label.split(" ").pop()!.toLowerCase()
                ),
            })),
        [JSON.stringify(entries)]
    );
}