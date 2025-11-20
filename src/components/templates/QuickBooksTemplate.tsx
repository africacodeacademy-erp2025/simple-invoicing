import React from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface QuickBooksTemplateProps {
  invoiceData: InvoiceData;
}

// QuickBooks-Inspired: clean, business-focused, well-structured
export default function QuickBooksTemplate({ invoiceData }: QuickBooksTemplateProps) {
  const selectedCurrency = currencies.find((c) => c.code === invoiceData.currency);
  const currencyCode = invoiceData.currency || "USD";
  const currencySymbol = selectedCurrency?.symbol || "";

  // Helper to format currency using currency code when available
  const formatCurrency = (value: number | undefined | null) => {
    const n = typeof value === "number" && !isNaN(value) ? value : 0;
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    } catch (e) {
      // fallback when currency code invalid
      return `${currencySymbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Normalize line items so template works with different shapes
  const items = (invoiceData.lineItems || []).map((it) => ({
    description: (it as any).description || "",
    quantity: Number((it as any).quantity ?? (it as any).qty ?? 1),
    unitPrice: Number((it as any).rate ?? (it as any).unitPrice ?? 0),
  }));

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const taxRate = Number(invoiceData.taxRate ?? invoiceData?.discountRate ?? 0) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="p-10 bg-white text-gray-800 font-sans w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
          <p className="mt-2 text-sm">Invoice No: {invoiceData.invoiceNumber || "#0001"}</p>
          <p className="text-sm">Date Issued: {formatDate(invoiceData.date)}</p>
          <p className="text-sm">Due Date: {formatDate(invoiceData.dueDate)}</p>
        </div>

        <div className="text-right">
          <h2 className="text-xl font-semibold">{invoiceData.businessInfo?.name}</h2>
          {invoiceData.businessInfo?.address && (
            <p className="text-sm whitespace-pre-line">{invoiceData.businessInfo.address}</p>
          )}
          {invoiceData.businessInfo?.email && <p className="text-sm">{invoiceData.businessInfo.email}</p>}
          {invoiceData.businessInfo?.phone && <p className="text-sm">{invoiceData.businessInfo.phone}</p>}
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10">
        <h3 className="font-semibold text-lg mb-2">Bill To</h3>
        <p className="text-sm font-medium">{invoiceData.clientInfo?.name}</p>
        {invoiceData.clientInfo?.address && (
          <p className="text-sm whitespace-pre-line">{invoiceData.clientInfo.address}</p>
        )}
        {invoiceData.clientInfo?.email && <p className="text-sm">{invoiceData.clientInfo.email}</p>}
        {invoiceData.clientInfo?.phone && <p className="text-sm">{invoiceData.clientInfo.phone}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-10 border-t border-b border-gray-300">
        <thead>
          <tr className="border-b border-gray-300 bg-gray-50">
            <th className="py-3 text-left">Description</th>
            <th className="py-3 text-right">Qty</th>
            <th className="py-3 text-right">Rate</th>
            <th className="py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-3">{item.description}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="w-full flex justify-end mb-10">
        <div className="w-64 text-sm">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Tax ({(taxRate).toFixed(2)}%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold text-base border-t pt-2 mt-2">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mt-10 text-sm">
          <h3 className="font-semibold mb-1">Notes</h3>
          <p className="whitespace-pre-line text-gray-700">{invoiceData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-16">Thank you for your business.</p>
    </div>
  );
}
