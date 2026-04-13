interface DeltaBadgeProps {
    value: number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}

export default function DeltaBadge({ value, prefix, suffix }: DeltaBadgeProps) {
    const isPositive = value >= 0;

    return (
        <span className={`flex items-center gap-1`}>
            {prefix && <span>{prefix}</span>}
            <span><span className={`${isPositive ? "text-green-400" : "text-red-400"}`}>{isPositive ? "▲" : "▼"} ${Math.abs(value).toFixed(2)}</span>{suffix}</span>
        </span>
    );
}