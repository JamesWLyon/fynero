"use client";

import { useMemo, useState } from "react";

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthYearValue = {
    month: number;
    year: number;
};

export default function MonthYearDropdown({
    className,
    onChange,
    linked = false,
    value,
}: {
    className?: string;
    onChange?: (date: MonthYearValue) => void;
    linked?: boolean;
    value?: MonthYearValue;
}) {
    const defaultValue = useMemo(() => ({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    }), []);

    const [localDate, setLocalDate] = useState<MonthYearValue>(defaultValue);

    const selectedDate = linked ? (value ?? defaultValue) : localDate;

    const years = Array.from(
        { length: 10 },
        (_, i) => new Date().getFullYear() - i
    );

    const selectBase =
        "bg-third/50 px-2.5 py-1.5 text-1 outline-none appearance-none cursor-pointer border border-secondary text-center";

    function updateDate(next: MonthYearValue) {
        if (!linked) {
            setLocalDate(next);
        }

        onChange?.(next);
    }

    return (
        <div className={`flex items-center w-fit ${className || ""}`}>
            <select
                value={selectedDate.month}
                onChange={(e) =>
                    updateDate({
                        month: Number(e.target.value),
                        year: selectedDate.year,
                    })
                }
                className={`${selectBase} rounded-l-lg border-r-0`}
            >
                {months.map((m, i) => (
                    <option key={m} value={i + 1}>
                        {m}
                    </option>
                ))}
            </select>

            <div className="w-px h-6 bg-secondary shrink-0 -mx-px z-10" />

            <select
                value={selectedDate.year}
                onChange={(e) =>
                    updateDate({
                        month: selectedDate.month,
                        year: Number(e.target.value),
                    })
                }
                className={`${selectBase} rounded-r-lg border-l-0`}
            >
                {years.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
}