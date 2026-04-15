"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    Download,
    Filter,
    RotateCcw,
    Search,
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

        for (const tx of transactions) {
            values.add(getDisplayCategory(tx));
        }

        return sortAlpha([...values]);
    }, [transactions]);

    const accountOptions = useMemo(() => {
        const values = new Set<string>();

        for (const tx of transactions) {
            values.add(getDisplayAccount(tx));
        }

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
        filters.includeRefunds !== false;

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
        onChange({
            ...filters,
            [key]: value,
        });
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

    return (
        <div
            className={[
                "w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-[2.5px]",
                "p-3 sm:p-4",
                className,
            ].join(" ")}
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

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
                            bg-white/[0.03] pl-11 pr-4 py-3
                            text-white placeholder:text-white/45
                            outline-none transition
                            focus:border-white/20 focus:bg-white/[0.05]
                        "
                    />
                </div>

                <div className="flex gap-3">
                    <div
                        ref={filterRef}
                        className="relative w-full"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setFilterOpen((prev) => !prev);
                                setExportOpen(false);
                            }}
                            className="
                                inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10
                                bg-white/[0.03] px-4 py-3 text-white transition
                                hover:bg-white/[0.05] lg:w-auto
                            "
                        >
                            <Filter size={16} />
                            Filter
                            {hasActiveFilters && (
                                <span className="h-2 w-2 rounded-full bg-white/80" />
                            )}
                            <ChevronDown
                                size={16}
                                className={`transition ${filterOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {filterOpen && (
                            <div
                                className="
                                    fixed right-0 top-[calc(100%+0.5rem)] z-55 w-full overflow-hidden rounded-2xl
                                    border border-white/10 bg-[#0f172a]/95 shadow-2xl backdrop-blur-lg
                                    lg:w-[720px] max-w-[calc(100vw-2rem)]
                                "
                            >
                                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-white">
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
                                            inline-flex items-center gap-2 rounded-xl border border-white/10
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

                                        <div
                                            className="
                                                overflow-hidden rounded-xl border border-white/10
                                                bg-white/[0.03]
                                            "
                                        >
                                            <div className="grid gap-0 sm:grid-cols-[1fr_auto_1fr]">
                                                <div className="px-4 py-3">
                                                    <label className="mb-2 block text-xs uppercase tracking-wide text-white/50">
                                                        Start
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={filters.startDate}
                                                        onChange={(e) =>
                                                            updateFilter("startDate", e.target.value)
                                                        }
                                                        className="
                                                            w-full bg-transparent text-white outline-none
                                                        "
                                                    />
                                                </div>

                                                <div
                                                    className="
                                                        flex items-center justify-center border-y border-white/10 px-3 py-2
                                                        text-xs uppercase tracking-wide text-white/40
                                                        sm:border-x sm:border-y-0
                                                    "
                                                >
                                                    to
                                                </div>

                                                <div className="px-4 py-3">
                                                    <label className="mb-2 block text-xs uppercase tracking-wide text-white/50">
                                                        End
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={filters.endDate}
                                                        onChange={(e) =>
                                                            updateFilter("endDate", e.target.value)
                                                        }
                                                        className="
                                                            w-full bg-transparent text-white outline-none
                                                        "
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Category
                                        </label>
                                        <div className="relative min-w-0">
                                            <select
                                                value={filters.category}
                                                onChange={(e) =>
                                                    updateFilter("category", e.target.value)
                                                }
                                                className="
                                                    w-full appearance-none rounded-xl border border-white/10
                                                    bg-white/[0.03] px-4 py-3 pr-10
                                                    text-white outline-none transition
                                                    focus:border-white/20 focus:bg-white/[0.05]
                                                "
                                            >
                                                <option value="">{allCategoriesLabel}</option>
                                                {categoryOptions.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown
                                                size={18}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Bank Account
                                        </label>
                                        <div className="relative min-w-0">
                                            <select
                                                value={filters.account}
                                                onChange={(e) =>
                                                    updateFilter("account", e.target.value)
                                                }
                                                className="
                                                    w-full appearance-none rounded-xl border border-white/10
                                                    bg-white/[0.03] px-4 py-3 pr-10
                                                    text-white outline-none transition
                                                    focus:border-white/20 focus:bg-white/[0.05]
                                                "
                                            >
                                                <option value="">{allAccountsLabel}</option>
                                                {accountOptions.map((account) => (
                                                    <option key={account} value={account}>
                                                        {account}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown
                                                size={18}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Sort Order
                                        </label>
                                        <div className="relative min-w-0">
                                            <select
                                                value={filters.newestFirst ? "newest" : "oldest"}
                                                onChange={(e) =>
                                                    updateFilter(
                                                        "newestFirst",
                                                        e.target.value === "newest"
                                                    )
                                                }
                                                className="
                                                    w-full appearance-none rounded-xl border border-white/10
                                                    bg-white/[0.03] px-4 py-3 pr-10
                                                    text-white outline-none transition
                                                    focus:border-white/20 focus:bg-white/[0.05]
                                                "
                                            >
                                                <option value="newest">Newest to Oldest</option>
                                                <option value="oldest">Oldest to Newest</option>
                                            </select>

                                            <ChevronDown
                                                size={18}
                                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Refunds
                                        </label>
                                        <label
                                            className="
                                                inline-flex w-full items-center gap-3 rounded-xl border border-white/10
                                                bg-white/[0.03] px-4 py-3 text-white cursor-pointer
                                                transition hover:bg-white/[0.05]
                                            "
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.includeRefunds}
                                                onChange={(e) =>
                                                    updateFilter("includeRefunds", e.target.checked)
                                                }
                                                className="h-4 w-4 accent-white"
                                            />
                                            <span className="text-sm sm:text-base">
                                                Include Refunds
                                            </span>
                                        </label>
                                    </div>

                                    <div>
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
                                                w-full rounded-xl border border-white/10
                                                bg-white/[0.03] px-4 py-3
                                                text-white placeholder:text-white/45
                                                outline-none transition
                                                focus:border-white/20 focus:bg-white/[0.05]
                                            "
                                        />
                                    </div>

                                    <div>
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
                                                w-full rounded-xl border border-white/10
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
                    
                    <div
                        ref={exportRef}
                        className="relative w-full"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setExportOpen((prev) => !prev);
                                setFilterOpen(false);
                            }}
                            className="
                                inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10
                                bg-white/[0.03] px-4 py-3 text-white transition
                                hover:bg-white/[0.05] lg:w-auto
                            "
                        >
                            <Download size={16} />
                            Export
                            <ChevronDown
                                size={16}
                                className={`transition ${exportOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {exportOpen && (
                            <div
                                className="
                                    absolute left-0 top-[calc(100%+0.5rem)] z-30 min-w-full overflow-hidden rounded-xl
                                    border border-white/10 bg-[#0f172a]/95 shadow-2xl backdrop-blur-lg
                                "
                            >
                                <button
                                    type="button"
                                    onClick={handleExportCsv}
                                    className="
                                        flex w-full items-center gap-2 px-4 py-3 text-left text-white/85 transition
                                        hover:bg-white/[0.06] hover:text-white
                                    "
                                >
                                    <Download size={16} />
                                    Export CSV
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    className="
                                        flex w-full items-center gap-2 border-t border-white/10 px-4 py-3
                                        text-left text-white/85 transition hover:bg-white/[0.06] hover:text-white
                                    "
                                >
                                    <Download size={16} />
                                    Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}