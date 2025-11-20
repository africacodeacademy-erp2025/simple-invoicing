import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface BilledAppTemplateProps {
  invoiceData: InvoiceData;
}

export const BilledAppTemplate = forwardRef<HTMLDivElement, BilledAppTemplateProps>(
  ({ invoiceData }, ref) => {
    const selectedCurrency = currencies.find((c) => c.code === invoiceData.currency);
    const currencySymbol = selectedCurrency?.symbol || "$";

    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const formatCurrency = (amount: number) => {
      const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <div ref={ref} className="w-full bg-white p-6 shadow-lg text-sm font-sans">
        {/* Header with bold accent */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {invoiceData.businessInfo.logo && (
              <img
                src={typeof invoiceData.businessInfo.logo === 'string' ? invoiceData.businessInfo.logo : URL.createObjectURL(invoiceData.businessInfo.logo)}
                alt="logo"
                className="h-14 w-auto object-contain rounded"
              />
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{invoiceData.businessInfo.name || 'Business Name'}</h1>
              <div className="text-xs text-gray-600">{invoiceData.businessInfo.tagline}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-md font-semibold">INVOICE</div>
            <div className="text-xs text-gray-700 mt-2">#{invoiceData.invoiceNumber}</div>
          </div>
        </div>

        {/* Grid: Bill To & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <h4 className="text-xs uppercase font-bold text-gray-700">Bill To</h4>
            <div className="font-medium text-gray-800">{invoiceData.clientInfo.name}</div>
            {invoiceData.clientInfo.address && <div className="text-xs text-gray-600 whitespace-pre-line">{invoiceData.clientInfo.address}</div>}
            {invoiceData.clientInfo.email && <div className="text-xs text-gray-600 mt-1">{invoiceData.clientInfo.email}</div>}
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <div className="text-sm text-right">
              <div>Date: {formatDate(invoiceData.date)}</div>
              <div>Due: {formatDate(invoiceData.dueDate)}</div>
              <div>Currency: {invoiceData.currency}</div>
            </div>
          </div>
        </div>

        {/* Items - spreadsheet friendly layout */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-600 uppercase">
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-3 align-top border-t border-gray-200">{item.description}</td>
                  <td className="p-3 text-center align-top border-t border-gray-200">{item.quantity}</td>
                  <td className="p-3 text-right align-top border-t border-gray-200">{formatCurrency(item.rate)}</td>
                  <td className="p-3 text-right align-top border-t border-gray-200 font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculator-style summary (spreadsheet friendly) */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-96 bg-gray-50 p-4 rounded border">
            <div className="flex justify-between text-sm mb-2"><div>Subtotal</div><div>{formatCurrency(invoiceData.subtotal)}</div></div>
            {invoiceData.discountRate > 0 && (
              <div className="flex justify-between text-sm mb-2"><div>Discount ({invoiceData.discountRate}%)</div><div>-{formatCurrency(invoiceData.discountAmount)}</div></div>
            )}
            {invoiceData.taxRate > 0 && (
              <div className="flex justify-between text-sm mb-2"><div>Tax ({invoiceData.taxRate}%)</div><div>{formatCurrency(invoiceData.taxAmount)}</div></div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2"><div>Total</div><div>{formatCurrency(invoiceData.total)}</div></div>
          </div>
        </div>

        {/* Footer with payment methods badges */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 gap-4">
          <div className="text-left">
            {invoiceData.bankingInfo.bankName && (
              <div className="whitespace-pre-line">Pay via {invoiceData.bankingInfo.bankName} — Account: {invoiceData.bankingInfo.accountNumber}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 border rounded text-xs">Bank Transfer</div>
            <div className="px-3 py-1 border rounded text-xs">Card</div>
            <div className="px-3 py-1 border rounded text-xs">PayPal</div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">Generated with Billed App-style template</div>
      </div>
    );
  }
);

BilledAppTemplate.displayName = "BilledAppTemplate";
