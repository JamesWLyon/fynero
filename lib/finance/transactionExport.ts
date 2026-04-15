import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Transaction,
    getDisplayAccount,
    getDisplayCategory,
    getDisplayName,
    getRawAmount,
    getTransactionDate,
    isRefundLike,
} from "./transactionFilters";

function formatDate(date: Date | null) {
    if (!date) return "";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatAmount(tx: Transaction) {
    const rawAmount = getRawAmount(tx);
    const refundLike = isRefundLike(tx);
    const prefix = refundLike ? "+" : "-";

    return `${prefix}$${Math.abs(rawAmount).toFixed(2)}`;
}

function escapeCsvValue(value: string) {
    const safe = value ?? "";

    if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
        return `"${safe.replace(/"/g, '""')}"`;
    }

    return safe;
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}

export function buildTransactionExportRows(transactions: Transaction[]) {
    return transactions.map((tx) => ({
        date: formatDate(getTransactionDate(tx)),
        name: getDisplayName(tx),
        category: getDisplayCategory(tx),
        account: getDisplayAccount(tx),
        amount: formatAmount(tx),
    }));
}

export function exportTransactionsCsv(
    transactions: Transaction[],
    filename = "transactions-export.csv"
) {
    const rows = buildTransactionExportRows(transactions);

    const headers = ["Date", "Transaction", "Category", "Account", "Amount"];

    const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
            [
                escapeCsvValue(row.date),
                escapeCsvValue(row.name),
                escapeCsvValue(row.category),
                escapeCsvValue(row.account),
                escapeCsvValue(row.amount),
            ].join(",")
        ),
    ];

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    downloadBlob(blob, filename);
}

export function exportTransactionsPdf(
    transactions: Transaction[],
    filename = "transactions-export.pdf",
    title = "Transactions Export"
) {
    const rows = buildTransactionExportRows(transactions);

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
    });

    doc.setFontSize(16);
    doc.text(title, 40, 40);

    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 40, 58);
    doc.text(`Total Transactions: ${transactions.length}`, 40, 72);

    autoTable(doc, {
        startY: 90,
        head: [["Date", "Transaction", "Category", "Account", "Amount"]],
        body: rows.map((row) => [
            row.date,
            row.name,
            row.category,
            row.account,
            row.amount,
        ]),
        styles: {
            fontSize: 9,
            cellPadding: 6,
            overflow: "linebreak",
            valign: "middle",
        },
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
        },
        columnStyles: {
            0: { cellWidth: 78 },
            1: { cellWidth: 170 },
            2: { cellWidth: 95 },
            3: { cellWidth: 110 },
            4: { cellWidth: 70, halign: "right" },
        },
        margin: {
            left: 40,
            right: 40,
        },
        didDrawPage: () => {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height;
            const pageWidth = pageSize.width;
            const pageNumber = doc.getNumberOfPages();

            doc.setFontSize(9);
            doc.text(
                `Page ${pageNumber}`,
                pageWidth - 70,
                pageHeight - 20
            );
        },
    });

    doc.save(filename);
}