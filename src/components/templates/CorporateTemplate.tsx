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
    <div ref={ref} className="w-[800px] bg-white font-serif">
      {/* Decorative Header Bar */}
      <div className="h-3 bg-gray-800"></div>

      <div className="p-10">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 mb-8 border-b-2 border-gray-800">
          {/* Logo & Business Info */}
          <div className="flex items-center gap-6">
            {invoiceData.businessInfo.logo && (
              <div className="w-24 h-24 flex items-center justify-center border-2 border-gray-200 p-1">
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
              <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wider">
                {invoiceData.businessInfo.name || "Company Name"}
              </h1>
              <div className="text-sm text-gray-600 mt-1">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <div className="flex gap-4 mt-1">
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
            <h2 className="text-5xl font-bold text-gray-800 uppercase">
              Invoice
            </h2>
            <p className="text-gray-600 mt-1">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Client & Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Bill To */}
          <div>
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
              Bill To
            </h3>
            <div className="text-gray-800">
              <p className="font-bold text-lg">
                {invoiceData.clientInfo.name}
              </p>
              {invoiceData.clientInfo.email && (
                <p className="text-sm">{invoiceData.clientInfo.email}</p>
              )}
              {invoiceData.clientInfo.address && (
                <div className="text-sm whitespace-pre-line mt-1">
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
                  <td className="py-1 font-semibold text-gray-600">
                    Issue Date:
                  </td>
                  <td className="py-1 pl-4">{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-gray-600">
                    Due Date:
                  </td>
                  <td className="py-1 pl-4">
                    {formatDate(invoiceData.dueDate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-gray-600">
                    Currency:
                  </td>
                  <td className="py-1 pl-4">{invoiceData.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead className="border-b-2 border-gray-800">
                <tr>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider">
                    Description
                  </th>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider text-center w-20">
                    Qty
                  </th>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider text-right w-28">
                    Rate
                  </th>
                  <th className="p-3 font-bold text-gray-800 uppercase text-sm tracking-wider text-right w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8">
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
                <tr className="border-t-2 border-gray-800">
                  <td className="pt-3 font-bold text-xl text-gray-800">
                    Total:
                  </td>
                  <td className="pt-3 text-right font-bold text-xl text-gray-800">
                    {formatCurrency(invoiceData.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Banking Info */}
        <div className="space-y-6">
          {invoiceData.notes && (
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                Notes
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {invoiceData.notes}
              </div>
            </div>
          )}
          {invoiceData.bankingInfo.bankName && (
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                Banking Information
              </h3>
              <div className="text-sm text-gray-700">
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
        <div className="text-center text-gray-500 text-xs mt-10 pt-6 border-t-2 border-gray-800">
          <p>Thank you for your business!</p>
        </div>
      </div>

      {/* Decorative Footer Bar */}
      <div className="h-3 bg-gray-800"></div>
    </div>
  );
});

CorporateTemplate.displayName = "CorporateTemplate";
