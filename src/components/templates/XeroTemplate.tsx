import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface XeroTemplateProps {
  invoiceData: InvoiceData;
}

export const XeroTemplate = forwardRef<HTMLDivElement, XeroTemplateProps>(
  ({ invoiceData }, ref) => {
    const selectedCurrency = currencies.find(
      (c) => c.code === invoiceData.currency
    );
    const currencySymbol = selectedCurrency?.symbol || "$";

    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const formatCurrency = (amount: number) => {
      const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      return `${currencySymbol}${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <div
        ref={ref}
        className="w-full bg-white p-6 shadow-md font-sans text-sm print:p-0"
      >
        {/* Top header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-6">
          <div className="flex items-start gap-4">
            {invoiceData.businessInfo.logo && (
              <img
                src={
                  typeof invoiceData.businessInfo.logo === "string"
                    ? invoiceData.businessInfo.logo
                    : URL.createObjectURL(invoiceData.businessInfo.logo)
                }
                alt="Business logo"
                className="h-12 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {invoiceData.businessInfo.name || "Business Name"}
              </h1>
              <div className="text-xs text-gray-600 mt-1">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">{invoiceData.businessInfo.address}</div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right mt-4 sm:mt-0 text-xs text-gray-700">
            <div className="bg-gray-50 inline-block px-3 py-2 rounded-md border">
              <div className="font-semibold text-gray-900">INVOICE</div>
              <div className="text-sm">#{invoiceData.invoiceNumber}</div>
            </div>
            <div className="mt-3">
              <div>Date: {formatDate(invoiceData.date)}</div>
              <div>Due: {formatDate(invoiceData.dueDate)}</div>
              <div>Currency: {invoiceData.currency}</div>
            </div>
          </div>
        </div>

        {/* Bill To & From */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Invoice To</h3>
            <div className="text-sm text-gray-800 font-medium">{invoiceData.clientInfo.name}</div>
            {invoiceData.clientInfo.address && (
              <div className="text-xs text-gray-600 whitespace-pre-line mt-1">{invoiceData.clientInfo.address}</div>
            )}
            {invoiceData.clientInfo.email && (
              <div className="text-xs text-gray-600 mt-1">{invoiceData.clientInfo.email}</div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">From</h3>
            <div className="text-sm text-gray-800 font-medium">{invoiceData.businessInfo.name}</div>
            {invoiceData.businessInfo.phone && <div className="text-xs text-gray-600">Tel: {invoiceData.businessInfo.phone}</div>}
            {invoiceData.businessInfo.email && <div className="text-xs text-gray-600">Email: {invoiceData.businessInfo.email}</div>}
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase">
                <th className="text-left p-3">Description</th>
                <th className="text-center p-3">Qty</th>
                <th className="text-right p-3">Unit</th>
                <th className="text-right p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="p-3 align-top border-t border-gray-200">
                    <div className="font-medium text-gray-800">{item.description}</div>
                  </td>
                  <td className="p-3 text-center align-top border-t border-gray-200">{item.quantity}</td>
                  <td className="p-3 text-right align-top border-t border-gray-200">{formatCurrency(item.rate)}</td>
                  <td className="p-3 text-right align-top border-t border-gray-200 font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-[360px]">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-2">Subtotal</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(invoiceData.subtotal)}</td>
                </tr>
                {invoiceData.discountRate > 0 && (
                  <tr>
                    <td className="py-2">Discount ({invoiceData.discountRate}%)</td>
                    <td className="py-2 text-right text-red-600">-{formatCurrency(invoiceData.discountAmount)}</td>
                  </tr>
                )}
                {invoiceData.taxRate > 0 && (
                  <tr>
                    <td className="py-2">Tax ({invoiceData.taxRate}%)</td>
                    <td className="py-2 text-right">{formatCurrency(invoiceData.taxAmount)}</td>
                  </tr>
                )}
                <tr className="border-t pt-2">
                  <td className="py-3 font-semibold uppercase">Total</td>
                  <td className="py-3 text-right font-bold text-lg">{formatCurrency(invoiceData.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment instructions and notes */}
        <div className="mt-6 text-xs text-gray-700">
          {invoiceData.bankingInfo.bankName && (
            <div className="mb-3">
              <div className="font-semibold">Payment Details</div>
              <div className="text-gray-600">
                <div>Bank: {invoiceData.bankingInfo.bankName}</div>
                <div>Account: {invoiceData.bankingInfo.accountNumber}</div>
                {invoiceData.bankingInfo.swiftCode && <div>SWIFT: {invoiceData.bankingInfo.swiftCode}</div>}
                {invoiceData.bankingInfo.iban && <div>IBAN: {invoiceData.bankingInfo.iban}</div>}
              </div>
            </div>
          )}

          {invoiceData.notes && (
            <div>
              <div className="font-semibold">Notes</div>
              <div className="whitespace-pre-line text-gray-600 bg-gray-50 p-3 border rounded">{invoiceData.notes}</div>
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-xs text-gray-500">Professional invoice template</div>
      </div>
    );
  }
);

XeroTemplate.displayName = "XeroTemplate";
