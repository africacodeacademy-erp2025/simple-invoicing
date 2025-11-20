import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface StandardTemplateProps {
  invoiceData: InvoiceData;
}

export const StandardTemplate = forwardRef<HTMLDivElement, StandardTemplateProps>(
  ({ invoiceData }, ref) => {
    const selectedCurrency = currencies.find((c) => c.code === invoiceData.currency);
    const currencySymbol = selectedCurrency?.symbol || "$";

    const currencyFormatter = (value: number) => {
      const v = typeof value === "number" && !isNaN(value) ? value : 0;
      return `${currencySymbol}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const {
      invoiceNumber,
      date,
      dueDate,
      lineItems,
      taxRate,
      discountRate,
      subtotal,
      total,
      notes,
      businessInfo,
      clientInfo,
      bankingInfo,
    } = invoiceData;

    return (
      <div className="w-full max-w-[1000px] mx-auto p-8 bg-white text-gray-900" ref={ref}>
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-wide">INVOICE</h1>
            <p className="mt-2 text-sm">Invoice #: {invoiceNumber}</p>
            <p className="text-sm">Date: {date}</p>
            <p className="text-sm">Due Date: {dueDate}</p>
          </div>

          {businessInfo?.logo && (
            <img
              src={
                typeof businessInfo.logo === "string"
                  ? businessInfo.logo
                  : URL.createObjectURL(businessInfo.logo)
              }
              alt="Business Logo"
              className="h-20 object-contain"
            />
          )}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse text-sm mb-6">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length > 0 ? (
              lineItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2 w-1/2">{item.description}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{currencyFormatter(item.rate)}</td>
                  <td className="p-2 text-right">{currencyFormatter(item.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500 italic">
                  No items added
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary Totals */}
        <div className="flex justify-end">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span>Subtotal:</span>
              <span>{currencyFormatter(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Discount:</span>
              <span>{currencyFormatter(invoiceData.discountAmount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Tax ({taxRate}%):</span>
              <span>{currencyFormatter(invoiceData.taxAmount)}</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-base">
              <span>Total:</span>
              <span>{currencyFormatter(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
            <div className="text-sm whitespace-pre-line">{notes}</div>
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-gray-500">Thank you for your business.</footer>
      </div>
    );
  }
);

StandardTemplate.displayName = "StandardTemplate";
