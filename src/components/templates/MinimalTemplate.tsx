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
        className="w-[800px] bg-white p-10 font-sans text-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          {/* Business Info & Logo */}
          <div className="flex items-center gap-4">
            {invoiceData.businessInfo.logo && (
              <div className="w-16 h-16 flex items-center justify-center">
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
              <h2 className="text-2xl font-bold text-gray-900">
                {invoiceData.businessInfo.name}
              </h2>
              <div className="text-sm text-gray-500 whitespace-pre-line">
                {invoiceData.businessInfo.address}
              </div>
            </div>
          </div>
          {/* Invoice Title */}
          <div className="text-right">
            <h1 className="text-4xl font-bold uppercase text-gray-400">
              Invoice
            </h1>
            <p className="text-gray-500 mt-1">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Client Info & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Bill To
            </h3>
            <p className="font-bold text-lg">{invoiceData.clientInfo.name}</p>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {invoiceData.clientInfo.address}
            </div>
            <p className="text-sm text-gray-600">
              {invoiceData.clientInfo.email}
            </p>
          </div>
          <div className="text-right">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 font-semibold text-gray-600">
                    Issue Date:
                  </td>
                  <td className="py-1">{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-semibold text-gray-600">
                    Due Date:
                  </td>
                  <td className="py-1">{formatDate(invoiceData.dueDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="mb-10">
            <table className="w-full text-left">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="pb-2 font-semibold text-gray-600 uppercase text-sm">
                    Description
                  </th>
                  <th className="pb-2 font-semibold text-gray-600 uppercase text-sm text-right w-20">
                    Qty
                  </th>
                  <th className="pb-2 font-semibold text-gray-600 uppercase text-sm text-right w-28">
                    Rate
                  </th>
                  <th className="pb-2 font-semibold text-gray-600 uppercase text-sm text-right w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      <div className="whitespace-pre-line">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-full max-w-sm">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600">Subtotal:</td>
                  <td className="py-2 text-right">
                    {formatCurrency(invoiceData.subtotal)}
                  </td>
                </tr>
                {invoiceData.discountRate > 0 && (
                  <tr>
                    <td className="py-2 text-gray-600">
                      Discount ({invoiceData.discountRate}%):
                    </td>
                    <td className="py-2 text-right text-green-600">
                      -{formatCurrency(invoiceData.discountAmount)}
                    </td>
                  </tr>
                )}
                {invoiceData.taxRate > 0 && (
                  <tr>
                    <td className="py-2 text-gray-600">
                      Tax ({invoiceData.taxRate}%):
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(invoiceData.taxAmount)}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-300">
                  <td className="pt-3 font-bold text-lg">Total:</td>
                  <td className="pt-3 text-right font-bold text-lg">
                    {formatCurrency(invoiceData.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Banking Info */}
        <div className="grid grid-cols-2 gap-8">
          {invoiceData.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Notes
              </h3>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {invoiceData.notes}
              </div>
            </div>
          )}
          {invoiceData.bankingInfo.bankName && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Banking Information
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Bank:</span>{" "}
                  {invoiceData.bankingInfo.bankName}
                </p>
                <p>
                  <span className="font-semibold">Account Number:</span>{" "}
                  {invoiceData.bankingInfo.accountNumber}
                </p>
                {invoiceData.bankingInfo.swiftCode && (
                  <p>
                    <span className="font-semibold">SWIFT Code:</span>{" "}
                    {invoiceData.bankingInfo.swiftCode}
                  </p>
                )}
                {invoiceData.bankingInfo.iban && (
                  <p>
                    <span className="font-semibold">IBAN:</span>{" "}
                    {invoiceData.bankingInfo.iban}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs mt-10 pt-4 border-t">
          <p>Thank you for your business!</p>
        </div>
      </div>
    );
  }
);

MinimalTemplate.displayName = "MinimalTemplate";
