"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    Download,
    Filter,
    RotateCcw,
    Search,
    Check,
} from "lucide-react";
import {
    type Transaction,
    type TransactionToolbarFilters,
    getDefaultTransactionToolbarFilters,
    getDisplayAccount,
    getDisplayCategory,
} from "@/lib/finance/transactionFilters";
import {
    exportTransactionsCsv,
    exportTransactionsPdf,
} from "@/lib/finance/transactionExport";

type TransactionToolbarProps = {
    transactions: Transaction[];
    filters: TransactionToolbarFilters;
    onChange: (next: TransactionToolbarFilters) => void;

    className?: string;
    exportTransactions?: Transaction[];
    searchPlaceholder?: string;
    allCategoriesLabel?: string;
    allAccountsLabel?: string;
    exportCsvFilename?: string;
    exportPdfFilename?: string;
    exportPdfTitle?: string;
};

function sortAlpha(values: string[]) {
    return [...values].sort((a, b) => a.localeCompare(b));
}

type ListboxOption = { value: string; label: string };

type ListboxProps = {
    value: string;
    options: ListboxOption[];
    onChange: (value: string) => void;
    placeholder?: string;
};

function Listbox({ value, options, onChange, placeholder }: ListboxProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedLabel =
        options.find((o) => o.value === value)?.label ?? placeholder ?? "";

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
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

    return (
        <div ref={ref} className="relative min-w-0 w-full">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="
                    flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10
                    bg-white/[0.03] px-4 py-3 text-white transition
                    hover:bg-white/[0.05] focus:outline-none focus:border-white/20
                "
            >
                <span className="min-w-0 truncate text-sm">
                    {value ? (
                        <span className="text-white">{selectedLabel}</span>
                    ) : (
                        <span className="text-white/45">{placeholder}</span>
                    )}
                </span>

                <ChevronDown
                    size={16}
                    className={`shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute left-0 top-[calc(100%+0.375rem)] z-50 w-full
                        overflow-hidden rounded-xl border border-white/10
                        bg-[#0f172a]/95 shadow-2xl backdrop-blur-lg
                    "
                >
                    <div className="max-h-52 overflow-y-auto">
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
                                        flex w-full items-center justify-between gap-2
                                        px-4 py-2.5 text-left text-sm transition
                                        hover:bg-white/[0.07]
                                        ${
                                            isSelected
                                                ? "bg-white/[0.06] text-white"
                                                : "text-white/70 hover:text-white"
                                        }
                                    `}
                                >
                                    <span className="min-w-0 truncate">{opt.label}</span>
                                    {isSelected && (
                                        <Check size={14} className="shrink-0 text-white/60" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TransactionToolbar({
    transactions,
    filters,
    onChange,
    className = "",
    exportTransactions: exportRows,
    searchPlaceholder = "Search transactions...",
    allCategoriesLabel = "All Categories",
    allAccountsLabel = "All Accounts",
    exportCsvFilename = "transactions-export.csv",
    exportPdfFilename = "transactions-export.pdf",
    exportPdfTitle = "Transactions Export",
}: TransactionToolbarProps) {
    const [exportOpen, setExportOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    const exportRef = useRef<HTMLDivElement | null>(null);
    const filterRef = useRef<HTMLDivElement | null>(null);

    const categoryOptions = useMemo(() => {
        const values = new Set<string>();
        for (const tx of transactions) values.add(getDisplayCategory(tx));
        return sortAlpha([...values]);
    }, [transactions]);

    const accountOptions = useMemo(() => {
        const values = new Set<string>();
        for (const tx of transactions) values.add(getDisplayAccount(tx));
        return sortAlpha([...values]);
    }, [transactions]);

    const rowsToExport = exportRows ?? transactions;

    const hasActiveFilters =
        filters.search !== "" ||
        filters.startDate !== "" ||
        filters.endDate !== "" ||
        filters.category !== "" ||
        filters.account !== "" ||
        filters.newestFirst !== true ||
        filters.minAmount !== "" ||
        filters.maxAmount !== "" ||
        filters.showIncome !== true;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            if (exportRef.current && !exportRef.current.contains(target)) {
                setExportOpen(false);
            }

            if (filterRef.current && !filterRef.current.contains(target)) {
                setFilterOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setExportOpen(false);
                setFilterOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function updateFilter<K extends keyof TransactionToolbarFilters>(
        key: K,
        value: TransactionToolbarFilters[K]
    ) {
        onChange({ ...filters, [key]: value });
    }

    function clearFilters() {
        onChange(getDefaultTransactionToolbarFilters());
    }

    function handleExportCsv() {
        exportTransactionsCsv(rowsToExport, exportCsvFilename);
        setExportOpen(false);
    }

    function handleExportPdf() {
        exportTransactionsPdf(rowsToExport, exportPdfFilename, exportPdfTitle);
        setExportOpen(false);
    }

    const categoryListboxOptions: ListboxOption[] = [
        { value: "", label: allCategoriesLabel },
        ...categoryOptions.map((c) => ({ value: c, label: c })),
    ];

    const accountListboxOptions: ListboxOption[] = [
        { value: "", label: allAccountsLabel },
        ...accountOptions.map((a) => ({ value: a, label: a })),
    ];

    const sortListboxOptions: ListboxOption[] = [
        { value: "newest", label: "Newest to Oldest" },
        { value: "oldest", label: "Oldest to Newest" },
    ];

    return (
        <div
            className={[
                "w-full min-w-0 rounded-2xl backdrop-blur-[0px]",
                "p-3 sm:p-4",
                className,
            ].join(" ")}
        >
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                    />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        placeholder={searchPlaceholder}
                        className="
                            w-full min-w-0 rounded-xl border border-white/10
                            bg-white/[0.03] py-3 pl-11 pr-4
                            text-white placeholder:text-white/45
                            outline-none transition
                            focus:border-white/20 focus:bg-white/[0.05]
                        "
                    />
                </div>

                <div className="grid min-w-0 grid-cols-2 gap-3 lg:flex lg:min-w-fit lg:flex-none lg:items-center">
                    <div ref={filterRef} className="relative min-w-0 lg:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setFilterOpen((prev) => !prev);
                                setExportOpen(false);
                            }}
                            className="
                                inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10
                                bg-white/[0.03] px-4 py-3 text-white transition
                                hover:bg-white/[0.05] lg:w-auto
                            "
                        >
                            <Filter size={16} className="shrink-0" />
                            <span className="truncate">Filter</span>
                            {hasActiveFilters && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" />
                            )}
                            <ChevronDown
                                size={16}
                                className={`shrink-0 transition ${filterOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {filterOpen && (
                            <div
                                className="
                                    fixed right-0 top-[calc(100%+0.5rem)] z-55 w-full rounded-2xl
                                    border border-white/10 bg-[#0f172a]/95 shadow-2xl backdrop-blur-lg
                                    lg:w-[720px] max-w-[calc(100vw-2rem)]
                                "
                            >
                                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-white">
                                            Transaction Filters
                                        </p>
                                        <p className="text-xs text-white/55">
                                            Refine what gets shown in the transactions list.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                        className="
                                            inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10
                                            bg-white/[0.03] px-3 py-2 text-sm text-white/80 transition
                                            hover:bg-white/[0.05] hover:text-white
                                            disabled:cursor-not-allowed disabled:opacity-40
                                        "
                                    >
                                        <RotateCcw size={14} />
                                        Clear
                                    </button>
                                </div>

                                <div className="grid gap-4 p-4 lg:grid-cols-2">
                                    <div className="lg:col-span-2">
                                        <p className="mb-2 text-sm font-medium text-white/90">
                                            Date Range
                                        </p>

                                        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                                            <div className="grid gap-0 sm:grid-cols-[1fr_auto_1fr]">
                                                <div className="min-w-0 px-4 py-3">
                                                    <label className="mb-2 block text-xs uppercase tracking-wide text-white/50">
                                                        Start
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDate}
                                                        onChange={(e) =>
                                                            updateFilter("startDate", e.target.value)
                                                        }
                                                        className="w-full min-w-0 bg-transparent text-white outline-none"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-center border-y border-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white/40 sm:border-x sm:border-y-0">
                                                    to
                                                </div>

                                                <div className="min-w-0 px-4 py-3">
                                                    <label className="mb-2 block text-xs uppercase tracking-wide text-white/50">
                                                        End
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDate}
                                                        onChange={(e) =>
                                                            updateFilter("endDate", e.target.value)
                                                        }
                                                        className="w-full min-w-0 bg-transparent text-white outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Category
                                        </label>
                                        <Listbox
                                            value={filters.category}
                                            options={categoryListboxOptions}
                                            onChange={(v) => updateFilter("category", v)}
                                            placeholder={allCategoriesLabel}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Bank Account
                                        </label>
                                        <Listbox
                                            value={filters.account}
                                            options={accountListboxOptions}
                                            onChange={(v) => updateFilter("account", v)}
                                            placeholder={allAccountsLabel}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Sort Order
                                        </label>
                                        <Listbox
                                            value={filters.newestFirst ? "newest" : "oldest"}
                                            options={sortListboxOptions}
                                            onChange={(v) =>
                                                updateFilter("newestFirst", v === "newest")
                                            }
                                            placeholder="Select order"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Income
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateFilter("showIncome", !filters.showIncome)
                                            }
                                            aria-pressed={filters.showIncome}
                                            className="
                                                flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10
                                                bg-white/[0.03] px-4 py-3 text-white transition
                                                hover:bg-white/[0.05]
                                            "
                                        >
                                            <span className="min-w-0 truncate text-sm sm:text-base">
                                                Show Income
                                            </span>

                                            <span
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                                                    filters.showIncome
                                                        ? "bg-white/80"
                                                        : "bg-white/15"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 rounded-full bg-[#0f172a] transition-transform ${
                                                        filters.showIncome
                                                            ? "translate-x-5"
                                                            : "translate-x-1"
                                                    }`}
                                                />
                                            </span>
                                        </button>
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Minimum Amount
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            step="0.01"
                                            value={filters.minAmount}
                                            onChange={(e) =>
                                                updateFilter("minAmount", e.target.value)
                                            }
                                            placeholder="Min amount"
                                            className="
                                                w-full min-w-0 rounded-xl border border-white/10
                                                bg-white/[0.03] px-4 py-3
                                                text-white placeholder:text-white/45
                                                outline-none transition
                                                focus:border-white/20 focus:bg-white/[0.05]
                                            "
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Maximum Amount
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            step="0.01"
                                            value={filters.maxAmount}
                                            onChange={(e) =>
                                                updateFilter("maxAmount", e.target.value)
                                            }
                                            placeholder="Max amount"
                                            className="
                                                w-full min-w-0 rounded-xl border border-white/10
                                                bg-white/[0.03] px-4 py-3
                                                text-white placeholder:text-white/45
                                                outline-none transition
                                                focus:border-white/20 focus:bg-white/[0.05]
                                            "
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={exportRef} className="relative min-w-0 lg:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setExportOpen((prev) => !prev);
                                setFilterOpen(false);
                            }}
                            className="
                                inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10
                                bg-white/[0.03] px-4 py-3 text-white transition
                                hover:bg-white/[0.05] lg:w-auto
                            "
                        >
                            <Download size={16} className="shrink-0" />
                            <span className="truncate">Export</span>
                            <ChevronDown
                                size={16}
                                className={`shrink-0 transition ${exportOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {exportOpen && (
                            <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 shadow-2xl backdrop-blur-lg">
                                <button
                                    type="button"
                                    onClick={handleExportCsv}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-white/85 transition hover:bg-white/[0.06] hover:text-white"
                                >
                                    <Download size={16} className="shrink-0" />
                                    <span className="truncate">Export CSV</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-3 text-left text-white/85 transition hover:bg-white/[0.06] hover:text-white"
                                >
                                    <Download size={16} className="shrink-0" />
                                    <span className="truncate">Export PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}