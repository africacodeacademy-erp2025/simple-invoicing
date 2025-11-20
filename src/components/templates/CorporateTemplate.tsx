
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
    const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div ref={ref} className="w-full bg-white font-serif text-sm">
      <div className="h-2 bg-gray-800"></div>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start pb-4 sm:pb-6 mb-4 sm:mb-6 border-b-2 border-gray-800">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {invoiceData.businessInfo.logo && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border p-1 flex-shrink-0">
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
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-wider">
                {invoiceData.businessInfo.name || "Company Name"}
              </h1>
              <div className="text-xs text-gray-600 mt-1 space-y-1">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <p>Tel: {invoiceData.businessInfo.phone}</p>
                <p>Email: {invoiceData.businessInfo.email}</p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 uppercase">
              Invoice
            </h2>
            <p className="text-gray-600 text-sm">#{invoiceData.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <div className="text-gray-800 text-xs space-y-1">
              <p className="font-bold text-sm sm:text-base">
                {invoiceData.clientInfo.name}
              </p>
              <p>{invoiceData.clientInfo.email}</p>
              {invoiceData.clientInfo.address && (
                <div className="whitespace-pre-line mt-1">
                  {invoiceData.clientInfo.address}
                </div>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
             <table className="w-full sm:w-auto sm:ml-auto">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold text-gray-600">Issue Date:</td>
                  <td className="py-1 pl-4 text-right">{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-gray-600">Due Date:</td>
                  <td className="py-1 pl-4 text-right">{formatDate(invoiceData.dueDate)}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-gray-600">Currency:</td>
                  <td className="py-1 pl-4 text-right">{invoiceData.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {invoiceData.lineItems.length > 0 && (
          <div className="mb-6 sm:mb-8">
            {/* Mobile View */}
            <div className="sm:hidden space-y-4">
              {invoiceData.lineItems.map((item) => (
                <div key={item.id} className="border-b pb-4">
                  <div className="font-semibold text-gray-800 mb-2">{item.description}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="text-gray-500">Quantity</div>
                    <div className="text-right text-gray-800">{item.quantity}</div>
                    <div className="text-gray-500">Rate</div>
                    <div className="text-right text-gray-800">{formatCurrency(item.rate)}</div>
                    <div className="text-gray-500 font-semibold">Amount</div>
                    <div className="text-right font-semibold text-gray-800">{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b-2 border-gray-800">
                  <tr>
                    <th className="p-2 font-bold text-gray-800 uppercase tracking-wider">Description</th>
                    <th className="p-2 font-bold text-gray-800 uppercase tracking-wider text-center">Qty</th>
                    <th className="p-2 font-bold text-gray-800 uppercase tracking-wider text-right">Rate</th>
                    <th className="p-2 font-bold text-gray-800 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2"><div className="whitespace-pre-line">{item.description}</div></td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.rate)}</td>
                      <td className="p-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-6 sm:mb-8">
          <div className="w-full max-w-[280px]">
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="py-1 sm:py-2 text-gray-600">Subtotal:</td>
                  <td className="py-1 sm:py-2 text-right">{formatCurrency(invoiceData.subtotal)}</td>
                </tr>
                {invoiceData.discountRate > 0 && (
                  <tr>
                    <td className="py-1 sm:py-2 text-gray-600">Discount ({invoiceData.discountRate}%):</td>
                    <td className="py-1 sm:py-2 text-right text-green-600">-{formatCurrency(invoiceData.discountAmount)}</td>
                  </tr>
                )}
                {invoiceData.taxRate > 0 && (
                  <tr>
                    <td className="py-1 sm:py-2 text-gray-600">Tax ({invoiceData.taxRate}%):</td>
                    <td className="py-1 sm:py-2 text-right">{formatCurrency(invoiceData.taxAmount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-800">
                  <td className="pt-2 sm:pt-3 font-bold text-sm sm:text-base text-gray-800">Total:</td>
                  <td className="pt-2 sm:pt-3 text-right font-bold text-sm sm:text-base text-gray-800">{formatCurrency(invoiceData.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {invoiceData.notes && (
            <div>
              <h3 className="font-bold text-gray-600 uppercase tracking-wider mb-2">Notes</h3>
              <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 border">{invoiceData.notes}</div>
            </div>
          )}
          {invoiceData.bankingInfo.bankName && (
            <div>
              <h3 className="font-bold text-gray-600 uppercase tracking-wider mb-2">Banking Information</h3>
              <div className="text-gray-700 space-y-1">
                <p><span className="font-semibold">Bank:</span> {invoiceData.bankingInfo.bankName}</p>
                <p><span className="font-semibold">Account:</span> {invoiceData.bankingInfo.accountNumber}</p>
                {invoiceData.bankingInfo.swiftCode && <p><span className="font-semibold">SWIFT:</span> {invoiceData.bankingInfo.swiftCode}</p>}
                {invoiceData.bankingInfo.iban && <p><span className="font-semibold">IBAN:</span> {invoiceData.bankingInfo.iban}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-500 text-xs mt-8 pt-6 border-t-2 border-gray-800">
          <p>Thank you for your business!</p>
        </div>
      </div>

      <div className="h-2 bg-gray-800"></div>
    </div>
  );
});

CorporateTemplate.displayName = "CorporateTemplate";
