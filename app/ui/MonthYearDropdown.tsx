"use client";

import { useState, useEffect } from "react";

const months = [
  "Jan","Feb","Mar","Apr","May","Jun", "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function MonthYearDropdown({
    className,
    onChange,
}: {
    className?: string;
    onChange?: (date: { month: number; year: number }) => void;
}) {
    const currentTime = new Date();

    const [month, setMonth] = useState(currentTime.getMonth() + 1);
    const [year, setYear] = useState(currentTime.getFullYear());

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    const selectBase =
        "bg-third/50 px-2.5 py-1.5 text-1 outline-none appearance-none cursor-pointer border border-secondary text-center";

    useEffect(() => {
        onChange?.({ month, year });
    }, [month, year]);

  return (
    <div className={`flex items-center w-fit ${className || ""}`}>

        {/* Month */}
        <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={`${selectBase} rounded-l-lg border-r-0`}
        >
            {months.map((m, i) => (
                <option key={m} value={i + 1}>
                    {m}
                </option>
            ))}
        </select>

        {/* Divider */}
        <div className="w-px h-6 bg-secondary shrink-0 -mx-px z-10" />

        {/* Year */}
        <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
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