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
    <div ref={ref} className="w-[800px] bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full translate-y-24 -translate-x-24"></div>

      <div className="relative p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          {/* Logo and Business Name */}
          <div className="flex items-center gap-4">
            {invoiceData.businessInfo.logo && (
              <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
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
              <h1 className="text-3xl font-bold text-gray-800">
                {invoiceData.businessInfo.name || "Business Name"}
              </h1>
              <div className="text-gray-500 text-sm mt-1">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <div className="flex gap-4">
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
            <h2 className="text-4xl font-bold text-gray-400 uppercase">
              Invoice
            </h2>
            <p className="text-gray-500 mt-1">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Bill To
            </h3>
            <div className="space-y-2">
              <div className="font-semibold text-gray-900">
                {invoiceData.clientInfo.name}
              </div>
              {invoiceData.clientInfo.email && (
                <div className="text-gray-600">
                  {invoiceData.clientInfo.email}
                </div>
              )}
              {invoiceData.clientInfo.address && (
                <div className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                  {invoiceData.clientInfo.address}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              Invoice Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="font-medium">
                  {formatDate(invoiceData.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">
                  {formatDate(invoiceData.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{invoiceData.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Items & Services
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 w-20">
                      Qty
                    </th>
                    <th className="text-right p-4 font-semibold text-gray-700 w-24">
                      Rate
                    </th>
                    <th className="text-right p-4 font-semibold text-gray-700 w-32">
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
                      }`}
                    >
                      <td className="p-4">
                        <div className="whitespace-pre-line text-gray-800">
                          {item.description}
                        </div>
                      </td>
                      <td className="text-center p-4 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="text-right p-4 text-gray-700">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="text-right p-4 font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoiceData.subtotal)}</span>
                  </div>

                  {invoiceData.discountRate > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({invoiceData.discountRate}%):</span>
                      <span>-{formatCurrency(invoiceData.discountAmount)}</span>
                    </div>
                  )}

                  {invoiceData.taxRate > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax ({invoiceData.taxRate}%):</span>
                      <span>{formatCurrency(invoiceData.taxAmount)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900 bg-white p-3 rounded-lg shadow-sm">
                      <span>Total:</span>
                      <span className="text-blue-600">
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Banking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Bank:</span>
                <p className="font-medium text-gray-900">
                  {invoiceData.bankingInfo.bankName}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Account Number:
                </span>
                <p className="font-medium text-gray-900">
                  {invoiceData.bankingInfo.accountNumber}
                </p>
              </div>
              {invoiceData.bankingInfo.swiftCode && (
                <div>
                  <span className="font-medium text-gray-600">SWIFT Code:</span>
                  <p className="font-medium text-gray-900">
                    {invoiceData.bankingInfo.swiftCode}
                  </p>
                </div>
              )}
              {invoiceData.bankingInfo.iban && (
                <div>
                  <span className="font-medium text-gray-600">IBAN:</span>
                  <p className="font-medium text-gray-900">
                    {invoiceData.bankingInfo.iban}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Additional Notes
            </h3>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {invoiceData.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl">
          <p className="font-semibold">Thank you for choosing our services!</p>
          <p className="text-blue-100 text-sm mt-1">
            We appreciate your business and look forward to working with you
            again.
          </p>
        </div>
      </div>
    </div>
  );
});

CreativeTemplate.displayName = "CreativeTemplate";
