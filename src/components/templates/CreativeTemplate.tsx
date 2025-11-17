
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
    <div ref={ref} className="w-full bg-white relative overflow-hidden font-sans text-sm">
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-24 -translate-x-12 sm:-translate-y-32 sm:translate-x-32 print:hidden"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full translate-y-16 -translate-x-16 sm:translate-y-24 sm:-translate-x-24 print:hidden"></div>

      <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {invoiceData.businessInfo.logo && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-1">
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
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                {invoiceData.businessInfo.name || "Business Name"}
              </h1>
              <div className="text-gray-500 text-xs mt-1 space-y-1">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <p>{invoiceData.businessInfo.email}</p>
                <p>{invoiceData.businessInfo.phone}</p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-400 uppercase">
              Invoice
            </h2>
            <p className="text-gray-500 mt-1 text-sm">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Bill To
            </h3>
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-gray-900 text-sm">
                {invoiceData.clientInfo.name}
              </div>
              <div className="text-gray-600">{invoiceData.clientInfo.email}</div>
              {invoiceData.clientInfo.address && (
                <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {invoiceData.clientInfo.address}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Invoice Details
            </h3>
            <div className="space-y-1 text-xs">
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

        {invoiceData.lineItems.length > 0 && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Items & Services</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="text-left p-2 sm:p-3 font-semibold text-gray-700">Description</th>
                    <th className="text-center p-2 sm:p-3 font-semibold text-gray-700">Qty</th>
                    <th className="text-right p-2 sm:p-3 font-semibold text-gray-700">Rate</th>
                    <th className="text-right p-2 sm:p-3 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}>
                      <td className="p-2 sm:p-3"><div className="whitespace-pre-line text-gray-800">{item.description}</div></td>
                      <td className="text-center p-2 sm:p-3 text-gray-700">{item.quantity}</td>
                      <td className="text-right p-2 sm:p-3 text-gray-700">{formatCurrency(item.rate)}</td>
                      <td className="text-right p-2 sm:p-3 font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4">
              <div className="flex justify-end">
                <div className="w-full max-w-[280px] space-y-2 text-xs">
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
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-base font-bold text-gray-900 bg-white p-2 rounded-lg shadow-sm">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(invoiceData.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {invoiceData.bankingInfo.bankName && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Banking Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <p><span className="font-medium text-gray-600">Bank:</span> <span className="font-medium text-gray-900">{invoiceData.bankingInfo.bankName}</span></p>
                <p><span className="font-medium text-gray-600">Account:</span> <span className="font-medium text-gray-900">{invoiceData.bankingInfo.accountNumber}</span></p>
                {invoiceData.bankingInfo.swiftCode && <p><span className="font-medium text-gray-600">SWIFT:</span> <span className="font-medium text-gray-900">{invoiceData.bankingInfo.swiftCode}</span></p>}
                {invoiceData.bankingInfo.iban && <p><span className="font-medium text-gray-600">IBAN:</span> <span className="font-medium text-gray-900">{invoiceData.bankingInfo.iban}</span></p>}
            </div>
          </div>
        )}

        {invoiceData.notes && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-yellow-100">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              Additional Notes
            </h3>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed text-xs">
              {invoiceData.notes}
            </div>
          </div>
        )}

        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-xl">
          <p className="font-semibold text-sm">Thank you for choosing our services!</p>
          <p className="text-blue-100 text-xs mt-1">
            We appreciate your business and look forward to working with you again.
          </p>
        </div>
      </div>
    </div>
  );
});

CreativeTemplate.displayName = "CreativeTemplate";
