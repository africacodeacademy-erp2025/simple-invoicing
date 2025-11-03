import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface CreativeTemplateProps {
  invoiceData: InvoiceData;
}

export const CreativeTemplate = forwardRef<
  HTMLDivElement,
  CreativeTemplateProps
>(({ invoiceData }, ref) => {
  const selectedCurrency = currencies.find(
    (c) => c.code === invoiceData.currency
  );
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
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <div ref={ref} className="w-[800px] bg-white relative overflow-hidden print:shadow-none print:p-0 print:m-0">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-32 translate-x-32 print:hidden"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full translate-y-24 -translate-x-24 print:hidden"></div>

      <div className="relative p-8 space-y-8 print:p-4 print:space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 print:mb-6">
          {/* Logo and Business Name */}
          <div className="flex items-center gap-4">
            {invoiceData.businessInfo.logo && (
              <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg print:w-16 print:h-16 print:rounded-md">
                <img
                  src={
                    typeof invoiceData.businessInfo.logo === "string"
                      ? invoiceData.businessInfo.logo
                      : URL.createObjectURL(invoiceData.businessInfo.logo)
                  }
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 print:text-2xl print:text-gray-900">
                {invoiceData.businessInfo.name || "Business Name"}
              </h1>
              <div className="text-gray-500 text-sm mt-1 print:text-xs print:text-gray-700">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <div className="flex gap-4 print:text-xs print:text-gray-700">
                  {invoiceData.businessInfo.email && (
                    <span>{invoiceData.businessInfo.email}</span>
                  )}
                  {invoiceData.businessInfo.phone && (
                    <span>{invoiceData.businessInfo.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-400 uppercase print:text-3xl print:text-gray-500">
              Invoice
            </h2>
            <p className="text-gray-500 mt-1 print:text-sm print:text-gray-700">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl print:bg-gray-100 print:p-4 print:rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center print:text-base print:mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 print:hidden"></div>
              Bill To
            </h3>
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 print:text-base">
                {invoiceData.clientInfo.name}
              </div>
              {invoiceData.clientInfo.email && (
                <div className="text-gray-600 print:text-xs print:text-gray-700">
                  {invoiceData.clientInfo.email}
                </div>
              )}
              {invoiceData.clientInfo.address && (
                <div className="text-gray-600 whitespace-pre-line text-sm leading-relaxed print:text-xs print:leading-normal">
                  {invoiceData.clientInfo.address}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl print:bg-gradient-to-br print:from-blue-100 print:to-purple-100 print:p-4 print:rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center print:text-base print:mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 print:hidden"></div>
              Invoice Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 print:text-xs print:text-gray-700">Issue Date:</span>
                <span className="font-medium print:text-xs">
                  {formatDate(invoiceData.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 print:text-xs print:text-gray-700">Due Date:</span>
                <span className="font-medium print:text-xs">
                  {formatDate(invoiceData.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 print:text-xs print:text-gray-700">Currency:</span>
                <span className="font-medium print:text-xs">{invoiceData.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden print:border-gray-300 print:rounded-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 print:px-4 print:py-3 print:border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800 print:text-base print:text-gray-800">
                Items & Services
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50 print:bg-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 print:text-sm print:p-2 print:text-gray-800">
                      Description
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 w-20 print:text-sm print:p-2 print:w-16 print:text-gray-800">
                      Qty
                    </th>
                    <th className="text-right p-4 font-semibold text-gray-700 w-24 print:text-sm print:p-2 print:w-20 print:text-gray-800">
                      Rate
                    </th>
                    <th className="text-right p-4 font-semibold text-gray-700 w-32 print:text-sm print:p-2 print:w-28 print:text-gray-800">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } print:border-gray-300`}
                    >
                      <td className="p-4 print:p-2">
                        <div className="whitespace-pre-line text-gray-800 print:text-gray-900">
                          {item.description}
                        </div>
                      </td>
                      <td className="text-center p-4 text-gray-700 print:p-2 print:text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="text-right p-4 text-gray-700 print:p-2 print:text-gray-800">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="text-right p-4 font-semibold text-gray-900 print:p-2 print:text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 print:bg-gray-100 print:p-4">
              <div className="flex justify-end">
                <div className="w-80 space-y-3 print:w-full print:max-w-sm">
                  <div className="flex justify-between text-gray-700 print:text-sm print:text-gray-700">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoiceData.subtotal)}</span>
                  </div>

                  {invoiceData.discountRate > 0 && (
                    <div className="flex justify-between text-green-600 print:text-green-700">
                      <span>Discount ({invoiceData.discountRate}%):</span>
                      <span>-{formatCurrency(invoiceData.discountAmount)}</span>
                    </div>
                  )}

                  {invoiceData.taxRate > 0 && (
                    <div className="flex justify-between text-gray-700 print:text-sm print:text-gray-700">
                      <span>Tax ({invoiceData.taxRate}%):</span>
                      <span>{formatCurrency(invoiceData.taxAmount)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3 print:border-gray-300 print:pt-2">
                    <div className="flex justify-between text-xl font-bold text-gray-900 bg-white p-3 rounded-lg shadow-sm print:text-lg print:font-bold print:text-gray-900 print:bg-gray-100 print:p-2 print:rounded-md">
                      <span>Total:</span>
                      <span className="text-blue-600 print:text-blue-700">
                        {formatCurrency(invoiceData.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banking Information */}
        {invoiceData.bankingInfo.bankName && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 print:bg-blue-100 print:p-4 print:rounded-lg print:border-blue-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center print:text-base print:mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 print:hidden"></div>
              Banking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm print:text-xs">
              <div>
                <span className="font-medium text-gray-600 print:text-gray-700">Bank:</span>
                <p className="font-medium text-gray-900 print:text-gray-900">
                  {invoiceData.bankingInfo.bankName}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600 print:text-gray-700">
                  Account Number:
                </span>
                <p className="font-medium text-gray-900 print:text-gray-900">
                  {invoiceData.bankingInfo.accountNumber}
                </p>
              </div>
              {invoiceData.bankingInfo.swiftCode && (
                <div>
                  <span className="font-medium text-gray-600 print:text-gray-700">SWIFT Code:</span>
                  <p className="font-medium text-gray-900 print:text-gray-900">
                    {invoiceData.bankingInfo.swiftCode}
                  </p>
                </div>
              )}
              {invoiceData.bankingInfo.iban && (
                <div>
                  <span className="font-medium text-gray-600 print:text-gray-700">IBAN:</span>
                  <p className="font-medium text-gray-900 print:text-gray-900">
                    {invoiceData.bankingInfo.iban}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200 print:bg-yellow-100 print:p-4 print:rounded-lg print:border-yellow-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center print:text-base print:mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 print:hidden"></div>
              Additional Notes
            </h3>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed print:text-sm print:leading-normal">
              {invoiceData.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl print:bg-gray-800 print:p-4 print:rounded-lg">
          <p className="font-semibold print:text-sm">Thank you for choosing our services!</p>
          <p className="text-blue-100 text-sm mt-1 print:text-xs print:text-blue-50">
            We appreciate your business and look forward to working with you
            again.
          </p>
        </div>
      </div>
    </div>
  );
});

CreativeTemplate.displayName = "CreativeTemplate";
