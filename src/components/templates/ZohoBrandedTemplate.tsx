import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface ZohoBrandedTemplateProps {
  invoiceData: InvoiceData;
}

// Clean, corporate, brand-customizable (Zoho‑style)
export const ZohoBrandedTemplate = forwardRef<
  HTMLDivElement,
  ZohoBrandedTemplateProps
>(({ invoiceData }, ref) => {
  const selectedCurrency = currencies.find(
    (c) => c.code === invoiceData.currency
  );
  const currencySymbol = selectedCurrency?.symbol || "$";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    const value = typeof amount === "number" && !isNaN(amount) ? amount : 0;
    return `${currencySymbol}${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div ref={ref} className="w-full p-8 bg-white text-sm text-gray-800">
      {/* Top Branding Bar */}
      <div className="w-full h-3 bg-blue-600 rounded-t-xl mb-6"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-10">
        <div>
          {invoiceData.businessInfo.logo && (
            <img
              src={
                typeof invoiceData.businessInfo.logo === "string"
                  ? invoiceData.businessInfo.logo
                  : URL.createObjectURL(invoiceData.businessInfo.logo)
              }
              alt="Business Logo"
              className="max-w-[140px] h-auto object-contain mb-3"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight">
            {invoiceData.businessInfo.name || "Business Name"}
          </h1>
          <p className="text-xs mt-1 whitespace-pre-line opacity-80">
            {invoiceData.businessInfo.address}
          </p>
        </div>

        {/* Invoice Info */}
        <div className="text-right text-sm mt-6 sm:mt-0">
          <h2 className="text-2xl font-semibold text-blue-700 uppercase">
            Invoice
          </h2>
          <p className="mt-1 font-semibold text-gray-700">
            #{invoiceData.invoiceNumber}
          </p>
          <p>Date: {formatDate(invoiceData.date)}</p>
          <p>Due Date: {formatDate(invoiceData.dueDate)}</p>
          <p>Currency: {invoiceData.currency}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-10">
        <h3 className="text-base font-bold uppercase mb-2 text-blue-700">
          Bill To:
        </h3>
        <p className="font-semibold text-sm">{invoiceData.clientInfo.name}</p>
        {invoiceData.clientInfo.email && <p>{invoiceData.clientInfo.email}</p>}
        {invoiceData.clientInfo.address && (
          <p className="whitespace-pre-line text-xs mt-1 opacity-80">
            {invoiceData.clientInfo.address}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.lineItems.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-2">{item.description}</td>
                <td className="text-center p-2">{item.quantity}</td>
                <td className="text-right p-2">{formatCurrency(item.rate)}</td>
                <td className="text-right p-2 font-semibold">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-full max-w-xs text-sm">
          <div className="flex justify-between py-1 border-b">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoiceData.subtotal)}</span>
          </div>

          {invoiceData.discountRate > 0 && (
            <div className="flex justify-between py-1 border-b text-red-600">
              <span>Discount ({invoiceData.discountRate}%):</span>
              <span>-{formatCurrency(invoiceData.discountAmount)}</span>
            </div>
          )}

          {invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-1 border-b">
              <span>Tax ({invoiceData.taxRate}%):</span>
              <span>{formatCurrency(invoiceData.taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 text-base font-bold text-blue-700 mt-2">
            <span>Total:</span>
            <span>{formatCurrency(invoiceData.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mb-10">
          <h3 className="text-base font-bold uppercase mb-2 text-blue-700">
            Notes:
          </h3>
          <p className="whitespace-pre-line italic text-sm opacity-90">
            {invoiceData.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        Thank you for your business.
      </div>

      {/* Bottom Branding Bar */}
      <div className="w-full h-2 bg-blue-600 rounded-b-xl mt-6"></div>
    </div>
  );
});

ZohoBrandedTemplate.displayName = "ZohoBrandedTemplate";
