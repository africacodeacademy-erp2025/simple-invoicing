import React from "react";
import { InvoiceData } from "@/types/invoice";

interface InvoiceHomeCreativeTemplateProps {
  invoiceData: InvoiceData;
}

const currencyFormatter = (currencyCode: string | undefined) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (e) {
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

export default function InvoiceHomeCreativeTemplate({ invoiceData }: InvoiceHomeCreativeTemplateProps) {
  const fmt = currencyFormatter(invoiceData.currency);

  const items = (invoiceData.lineItems || []).map((it: any) => ({
    description: it.description || "",
    quantity: Number(it.quantity ?? it.qty ?? 1),
    unitPrice: Number(it.rate ?? it.unitPrice ?? 0),
  }));

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const taxRate = Number(invoiceData.taxRate ?? 0) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="p-10 bg-white font-serif text-gray-900 border-8 border-dotted border-blue-400 rounded-2xl shadow-xl w-full">
      {/* Decorative Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-widest text-blue-600 drop-shadow">INVOICE</h1>
        <div className="mt-2 text-sm text-gray-600">Bright • Fun • Creative</div>
      </div>

      {/* Info Row */}
      <div className="flex justify-between mb-10">
        <div>
          <p className="font-bold text-lg">Invoice Number: {invoiceData.invoiceNumber || "#0001"}</p>
          <p className="text-sm">Date Issued: {formatDate(invoiceData.date)}</p>
          <p className="text-sm">Due Date: {formatDate(invoiceData.dueDate)}</p>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-700">{invoiceData.businessInfo?.name}</h2>
          {invoiceData.businessInfo?.address && (
            <p className="text-sm whitespace-pre-line">{invoiceData.businessInfo.address}</p>
          )}
          {invoiceData.businessInfo?.email && <p className="text-sm">{invoiceData.businessInfo.email}</p>}
          {invoiceData.businessInfo?.phone && <p className="text-sm">{invoiceData.businessInfo.phone}</p>}
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10 bg-blue-50 p-5 rounded-xl border border-blue-200">
        <h3 className="font-bold text-lg mb-1 text-blue-700">Bill To</h3>
        <p className="text-sm font-medium">{invoiceData.clientInfo?.name}</p>
        {invoiceData.clientInfo?.address && (
          <p className="text-sm whitespace-pre-line">{invoiceData.clientInfo.address}</p>
        )}
        {invoiceData.clientInfo?.email && <p className="text-sm">{invoiceData.clientInfo.email}</p>}
        {invoiceData.clientInfo?.phone && <p className="text-sm">{invoiceData.clientInfo.phone}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-10 border-4 border-blue-300 rounded-xl overflow-hidden">
        <thead className="bg-blue-200">
          <tr>
            <th className="py-3 px-2 text-left">Description</th>
            <th className="py-3 px-2 text-right">Qty</th>
            <th className="py-3 px-2 text-right">Rate</th>
            <th className="py-3 px-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-blue-50 border-b border-blue-200">
              <td className="py-3 px-2">{item.description}</td>
              <td className="py-3 px-2 text-right">{item.quantity}</td>
              <td className="py-3 px-2 text-right">{fmt.format(item.unitPrice)}</td>
              <td className="py-3 px-2 text-right">{fmt.format(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64 text-sm bg-blue-50 p-5 rounded-xl border border-blue-200">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>{fmt.format(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Tax ({taxRate.toFixed(2)}%):</span>
            <span>{fmt.format(taxAmount)}</span>
          </div>
          <div className="flex justify-between py-1 mt-2 pt-2 border-t border-blue-300 font-bold text-base">
            <span>Total:</span>
            <span>{fmt.format(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mt-10 text-sm bg-yellow-50 border border-yellow-300 p-5 rounded-xl">
          <h3 className="font-bold mb-1 text-yellow-700">Notes</h3>
          <p className="whitespace-pre-line">{invoiceData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-16 italic">Designed with creativity — InvoiceHome Style</p>
    </div>
  );
}
