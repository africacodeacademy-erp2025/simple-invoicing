
import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface MinimalTemplateProps {
  invoiceData: InvoiceData;
}

export const MinimalTemplate = forwardRef<HTMLDivElement, MinimalTemplateProps>(
  ({ invoiceData }, ref) => {
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
      return `${currencySymbol}${amount.toFixed(2)}`;
    };

    return (
      <div
        ref={ref}
        className="w-full bg-white p-4 sm:p-6 md:p-8 font-sans text-gray-800 text-sm"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {invoiceData.businessInfo.logo && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <img
                  src={
                    typeof invoiceData.businessInfo.logo === "string"
                      ? invoiceData.businessInfo.logo
                      : URL.createObjectURL(invoiceData.businessInfo.logo)
                  }
                  alt="Business logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {invoiceData.businessInfo.name}
              </h2>
              <div className="text-xs text-gray-500 whitespace-pre-line">
                {invoiceData.businessInfo.address}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold uppercase text-gray-400">
              Invoice
            </h1>
            <p className="text-gray-500 mt-1 text-xs">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Client Info & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Bill To
            </h3>
            <p className="font-bold text-sm sm:text-base">{invoiceData.clientInfo.name}</p>
            <div className="text-xs text-gray-600 space-y-1">
                <p className="whitespace-pre-line">{invoiceData.clientInfo.address}</p>
                <p>{invoiceData.clientInfo.email}</p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs">
            <table className="w-full sm:w-auto sm:ml-auto">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 font-semibold text-gray-600">Issue Date:</td>
                  <td className="py-1 text-right">{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-semibold text-gray-600">Due Date:</td>
                  <td className="py-1 text-right">{formatDate(invoiceData.dueDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="pb-2 pr-2 font-semibold text-gray-600 uppercase">Description</th>
                  <th className="pb-2 px-2 font-semibold text-gray-600 uppercase text-right">Qty</th>
                  <th className="pb-2 px-2 font-semibold text-gray-600 uppercase text-right">Rate</th>
                  <th className="pb-2 pl-2 font-semibold text-gray-600 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 pr-2"><div className="whitespace-pre-line">{item.description}</div></td>
                    <td className="py-2 px-2 text-right">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-2 pl-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-6 sm:mb-8">
          <div className="w-full max-w-[280px]">
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">Subtotal:</td>
                  <td className="py-1 text-right">{formatCurrency(invoiceData.subtotal)}</td>
                </tr>
                {invoiceData.discountRate > 0 && (
                  <tr>
                    <td className="py-1 text-gray-600">Discount ({invoiceData.discountRate}%):</td>
                    <td className="py-1 text-right text-green-600">-{formatCurrency(invoiceData.discountAmount)}</td>
                  </tr>
                )}
                {invoiceData.taxRate > 0 && (
                  <tr>
                    <td className="py-1 text-gray-600">Tax ({invoiceData.taxRate}%):</td>
                    <td className="py-1 text-right">{formatCurrency(invoiceData.taxAmount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-300">
                  <td className="pt-2 font-bold text-sm sm:text-base">Total:</td>
                  <td className="pt-2 text-right font-bold text-sm sm:text-base">{formatCurrency(invoiceData.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Banking Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
          {invoiceData.notes && (
            <div>
              <h3 className="font-semibold text-gray-500 uppercase mb-2">Notes</h3>
              <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-3 border">{invoiceData.notes}</div>
            </div>
          )}
          {invoiceData.bankingInfo.bankName && (
            <div>
              <h3 className="font-semibold text-gray-500 uppercase mb-2">Banking Information</h3>
              <div className="text-gray-600 space-y-1">
                <p><span className="font-semibold">Bank:</span> {invoiceData.bankingInfo.bankName}</p>
                <p><span className="font-semibold">Account:</span> {invoiceData.bankingInfo.accountNumber}</p>
                {invoiceData.bankingInfo.swiftCode && <p><span className="font-semibold">SWIFT:</span> {invoiceData.bankingInfo.swiftCode}</p>}
                {invoiceData.bankingInfo.iban && <p><span className="font-semibold">IBAN:</span> {invoiceData.bankingInfo.iban}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs mt-8 pt-4 border-t">
          <p>Thank you for your business!</p>
        </div>
      </div>
    );
  }
);

MinimalTemplate.displayName = "MinimalTemplate";
