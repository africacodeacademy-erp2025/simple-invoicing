import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface CorporateTemplateProps {
  invoiceData: InvoiceData;
}

export const CorporateTemplate = forwardRef<
  HTMLDivElement,
  CorporateTemplateProps
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
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <div ref={ref} className="w-[800px] bg-white font-serif print:shadow-none print:p-0 print:m-0">
      {/* Decorative Header Bar */}
      <div className="h-3 bg-gray-800 print:hidden"></div>

      <div className="p-10 print:p-4">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 mb-8 border-b-2 border-gray-800 print:border-b-2 print:border-gray-800 print:pb-4 print:mb-6">
          {/* Logo & Business Info */}
          <div className="flex items-center gap-6">
            {invoiceData.businessInfo.logo && (
              <div className="w-24 h-24 flex items-center justify-center border-2 border-gray-200 p-1 print:w-16 print:h-16 print:border-gray-300 print:p-0.5">
                <img
                  src={
                    typeof invoiceData.businessInfo.logo === "string"
                      ? invoiceData.businessInfo.logo
                      : URL.createObjectURL(invoiceData.businessInfo.logo)
                  }
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wider print:text-2xl print:text-gray-900">
                {invoiceData.businessInfo.name || "Company Name"}
              </h1>
              <div className="text-sm text-gray-600 mt-1 print:text-xs print:text-gray-700">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <div className="flex gap-4 mt-1 print:text-xs print:text-gray-700">
                  {invoiceData.businessInfo.phone && (
                    <span>Tel: {invoiceData.businessInfo.phone}</span>
                  )}
                  {invoiceData.businessInfo.email && (
                    <span>Email: {invoiceData.businessInfo.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="text-right">
            <h2 className="text-5xl font-bold text-gray-800 uppercase print:text-3xl print:text-gray-900">
              Invoice
            </h2>
            <p className="text-gray-600 mt-1 print:text-sm print:text-gray-700">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Client & Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-6">
          {/* Bill To */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 print:text-xs print:text-gray-700">
              Bill To
            </h3>
            <div className="text-gray-800 print:text-gray-900">
              <p className="font-bold text-lg print:text-base">
                {invoiceData.clientInfo.name}
              </p>
              {invoiceData.clientInfo.email && (
                <p className="text-sm print:text-xs">{invoiceData.clientInfo.email}</p>
              )}
              {invoiceData.clientInfo.address && (
                <div className="text-sm whitespace-pre-line mt-1 print:text-xs print:leading-normal">
                  {invoiceData.clientInfo.address}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="text-right">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold text-gray-600 print:text-xs print:text-gray-700">
                    Issue Date:
                  </td>
                  <td className="py-1 pl-4 print:text-xs">{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-gray-600 print:text-xs print:text-gray-700">
                    Due Date:
                  </td>
                  <td className="py-1 pl-4 print:text-xs">
                    {formatDate(invoiceData.dueDate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-gray-600 print:text-xs print:text-gray-700">
                    Currency:
                  </td>
                  <td className="py-1 pl-4 print:text-xs">{invoiceData.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="mb-8 print:mb-6">
            <table className="w-full text-left border-collapse print:border-collapse print:border-1 print:border-gray-300">
              <thead className="border-b-2 border-gray-800 print:border-b-1 print:border-gray-300">
                <tr>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider print:text-xs print:p-2 print:text-gray-800">
                    Description
                  </th>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider text-center w-20 print:text-xs print:p-2 print:w-16 print:text-gray-800">
                    Qty
                  </th>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider text-right w-28 print:text-xs print:p-2 print:w-20 print:text-gray-800">
                    Rate
                  </th>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider text-right w-32 print:text-xs print:p-2 print:w-28 print:text-gray-800">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 print:border-b-1 print:border-gray-300">
                    <td className="p-3 print:p-2">
                      {item.description}
                    </td>
                    <td className="p-3 text-center print:p-2">{item.quantity}</td>
                    <td className="p-3 text-right print:p-2">{formatCurrency(item.rate)}</td>
                    <td className="p-3 text-right font-semibold print:p-2">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8 print:mb-6">
          <div className="w-full max-w-sm">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600 print:text-sm print:text-gray-700">Subtotal:</td>
                  <td className="py-2 text-right print:text-sm">{formatCurrency(invoiceData.subtotal)}</td>
                </tr>
                {invoiceData.discountRate > 0 && (
                  <tr>
                    <td className="py-2 text-gray-600 print:text-sm print:text-gray-700">
                      Discount ({invoiceData.discountRate}%):
                    </td>
                    <td className="py-2 text-right text-green-600 print:text-sm print:text-green-700">
                      -{formatCurrency(invoiceData.discountAmount)}
                    </td>
                  </tr>
                )}
                {invoiceData.taxRate > 0 && (
                  <tr>
                    <td className="py-2 text-gray-600 print:text-sm print:text-gray-700">
                      Tax ({invoiceData.taxRate}%):
                    </td>
                    <td className="py-2 text-right print:text-sm">{formatCurrency(invoiceData.taxAmount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-800 print:border-t-1 print:border-gray-300">
                  <td className="pt-3 font-bold text-xl text-gray-800 print:text-lg print:font-bold print:text-gray-900">
                    Total:
                  </td>
                  <td className="pt-3 text-right font-bold text-xl text-gray-800 print:text-lg print:font-bold print:text-gray-900">
                    {formatCurrency(invoiceData.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Banking Info */}
        <div className="space-y-6 print:space-y-4">
          {invoiceData.notes && (
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 print:text-xs print:text-gray-700">
                Notes
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line print:text-xs print:leading-normal">
                {invoiceData.notes}
              </div>
            </div>
          )}
          {invoiceData.bankingInfo.bankName && (
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2 print:text-xs print:text-gray-700">
                Banking Information
              </h3>
              <div className="text-sm text-gray-700 print:text-xs">
                <p>
                  <span className="font-semibold print:font-medium print:text-gray-700">Bank:</span>{" "}
                  {invoiceData.bankingInfo.bankName}
                </p>
                <p>
                  <span className="font-semibold print:font-medium print:text-gray-700">Account Number:</span>{" "}
                  {invoiceData.bankingInfo.accountNumber}
                </p>
                {invoiceData.bankingInfo.swiftCode && (
                  <p>
                    <span className="font-semibold print:font-medium print:text-gray-700">SWIFT Code:</span>{" "}
                    {invoiceData.bankingInfo.swiftCode}
                  </p>
                )}
                {invoiceData.bankingInfo.iban && (
                  <p>
                    <span className="font-semibold print:font-medium print:text-gray-700">IBAN:</span>{" "}
                    {invoiceData.bankingInfo.iban}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-10 pt-6 border-t-2 border-gray-800 print:text-xs print:mt-6 print:pt-4 print:border-t-1 print:border-gray-300">
          <p>Thank you for your business!</p>
        </div>
      </div>

      {/* Decorative Footer Bar */}
      <div className="h-3 bg-gray-800 print:hidden"></div>
    </div>
  );
});

CorporateTemplate.displayName = "CorporateTemplate";
