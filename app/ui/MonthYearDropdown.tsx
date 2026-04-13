"use client";

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthYearDropdown({ className }: { className?: string }) {

    const currentTime = new Date();

    const dateObj = {
        month: currentTime.getMonth() + 1,
        year: currentTime.getFullYear()
    };

    const years = Array.from({ length: 10 }, (_, i) => dateObj.year - i);

    const selectBase = "bg-third px-3 py-2 outline-none appearance-none cursor-pointer border border-gray-300";

    return (
        <div className={`flex items-center w-fit ${className || ''}`}>

            {/* Month */}
            <select
                defaultValue={dateObj.month}
                className={`${selectBase} rounded-l-lg border-r-0`}
            >
                {months.map((month, i) => (
                    <option key={month} value={i + 1}>
                        {month}
                    </option>
                ))}
            </select>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 shrink-0 -mx-px z-10" />

            {/* Year */}
            <select
                defaultValue={dateObj.year}
                className={`${selectBase} rounded-r-lg border-l-0`}
            >
                {years.map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select>

        </div>
    );
}