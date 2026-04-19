"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthYearValue = {
    month: number;
    year: number;
};

type ListboxOption = { value: string; label: string };

// Hidden element used to measure text width
function measureTextWidth(text: string, fontSize = "14px"): number {
    if (typeof document === "undefined") return 100;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 100;
    ctx.font = `${fontSize} Inter, ui-sans-serif, system-ui, sans-serif`;
    return ctx.measureText(text).width;
}

function Listbox({ value, options, onChange, placeholder }: {
    value: string;
    options: ListboxOption[];
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);

    const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? "";

    // Compute exact width needed: widest label + px-3 both sides (24px) + gap (12px) + checkmark (13px)
    const dropdownWidth = useMemo(() => {
        const widest = options.reduce((max, opt) => {
            const w = measureTextWidth(opt.label);
            return w > max ? w : max;
        }, 0);
        return Math.ceil(widest) + 24 + 12 + 13 + 24; // left pad + gap + icon + right pad
    }, [options]);

    // Button width: selected label + px-3 both sides + gap (8px) + chevron (14px)
    const buttonWidth = useMemo(() => {
        const w = measureTextWidth(selectedLabel);
        return Math.ceil(w) + 24 + 8 + 14 + 24;
    }, [selectedLabel]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (!ref.current?.contains(target) && !dropdownRef.current?.contains(target)) {
                setOpen(false);
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function handleOpen() {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 6,
                left: rect.left,
                width: Math.max(dropdownWidth, rect.width),
                zIndex: 9999,
            });
        }
        setOpen((p) => !p);
    }

    const dropdown = open && (
        <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 shadow-2xl backdrop-blur-lg"
        >
            <div className="overflow-y-auto max-h-[240px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {options.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`
                                flex w-full items-center justify-between gap-3
                                px-3 py-1.5 text-left text-sm transition whitespace-nowrap
                                hover:bg-white/[0.07]
                                ${isSelected
                                    ? "bg-white/[0.06] text-white"
                                    : "text-white/70 hover:text-white"
                                }
                            `}
                        >
                            <span>{opt.label}</span>
                            {isSelected
                                ? <Check size={13} className="shrink-0 text-white/60" />
                                : <span className="w-[13px] shrink-0" />
                            }
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div ref={ref} style={{ width: buttonWidth }} className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleOpen}
                className="
                    w-full flex items-center justify-between gap-2 rounded-xl border border-white/10
                    bg-white/[0.03] px-3 py-2 text-white transition
                    hover:bg-white/[0.05] focus:outline-none focus:border-white/20
                "
            >
                <span className="text-sm whitespace-nowrap">{selectedLabel}</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {mounted && createPortal(dropdown, document.body)}
        </div>
    );
}

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

    const monthOptions: ListboxOption[] = MONTHS.map((m, i) => ({
        value: String(i + 1),
        label: m,
    }));

    const yearOptions: ListboxOption[] = Array.from(
        { length: 10 },
        (_, i) => new Date().getFullYear() - i
    ).map((y) => ({ value: String(y), label: String(y) }));

    function updateDate(next: MonthYearValue) {
        if (!linked) setLocalDate(next);
        onChange?.(next);
    }

    return (
        <div className={`flex items-center gap-2 w-fit ${className ?? ""}`}>
            <Listbox
                value={String(selectedDate.month)}
                options={monthOptions}
                onChange={(v) => updateDate({ month: Number(v), year: selectedDate.year })}
            />
            <Listbox
                value={String(selectedDate.year)}
                options={yearOptions}
                onChange={(v) => updateDate({ month: selectedDate.month, year: Number(v) })}
            />
        </div>
    );
}