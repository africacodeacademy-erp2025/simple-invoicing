
import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface ClassicTemplateProps {
  invoiceData: InvoiceData;
}

export const ClassicTemplate = forwardRef<HTMLDivElement, ClassicTemplateProps>(
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
        className="w-full bg-white p-4 sm:p-6 md:p-8 shadow-lg font-serif text-sm"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-gray-800 pb-4 sm:pb-6 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto mb-4 sm:mb-0">
            {invoiceData.businessInfo.logo && (
              <img
                src={
                  typeof invoiceData.businessInfo.logo === "string"
                    ? invoiceData.businessInfo.logo
                    : URL.createObjectURL(invoiceData.businessInfo.logo)
                }
                alt="Business logo"
                className="max-w-[100px] sm:max-w-[120px] h-auto object-contain mb-4"
              />
            )}
             <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-wider">
              {invoiceData.businessInfo.name || "Business Name"}
            </h1>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right text-xs text-gray-600 space-y-1">
              {invoiceData.businessInfo.address && (
                <div className="whitespace-pre-line">
                  {invoiceData.businessInfo.address}
                </div>
              )}
                <p>Tel: {invoiceData.businessInfo.phone}</p>
                <p>Email: {invoiceData.businessInfo.email}</p>
          </div>
        </div>

        {/* Invoice Details & Client Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8">
          <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-800 uppercase mb-2 border-b pb-1">
              Bill To:
            </h3>
            <div className="text-gray-700 text-xs space-y-1">
              <p className="font-semibold text-sm sm:text-base">
                {invoiceData.clientInfo.name}
              </p>
              {invoiceData.clientInfo.email && (
                <p>{invoiceData.clientInfo.email}</p>
              )}
              {invoiceData.clientInfo.address && (
                <div className="whitespace-pre-line mt-1">
                  {invoiceData.clientInfo.address}
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 uppercase">
              Invoice
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">
              #{invoiceData.invoiceNumber}
            </p>
            <table className="text-xs w-full sm:w-auto">
              <tbody>
                <tr>
                  <td className="font-bold pr-4 py-1">Date:</td>
                  <td className="text-right">{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-1">Due Date:</td>
                  <td className="text-right">{formatDate(invoiceData.dueDate)}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4 py-1">Currency:</td>
                  <td className="text-right">{invoiceData.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
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
              <table className="w-full border-collapse border-2 border-gray-800 text-xs">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="text-left p-2 font-bold uppercase">Description</th>
                    <th className="text-center p-2 font-bold uppercase">Qty</th>
                    <th className="text-right p-2 font-bold uppercase">Rate</th>
                    <th className="text-right p-2 font-bold uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item, index) => (
                    <tr key={item.id} className={`${ index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="p-2 border border-gray-200"><div className="whitespace-pre-line">{item.description}</div></td>
                      <td className="text-center p-2 border border-gray-200">{item.quantity}</td>
                      <td className="text-right p-2 border border-gray-200">{formatCurrency(item.rate)}</td>
                      <td className="text-right p-2 border border-gray-200 font-semibold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex flex-col items-end mb-6 sm:mb-8">
            <div className="w-full max-w-[280px]">
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-semibold">Subtotal:</td>
                      <td className="text-right p-2">{formatCurrency(invoiceData.subtotal)}</td>
                    </tr>
                    {invoiceData.discountRate > 0 && (
                      <tr className="border-b border-gray-300">
                        <td className="p-2 font-semibold">Discount ({invoiceData.discountRate}%):</td>
                        <td className="text-right p-2 text-red-600">-{formatCurrency(invoiceData.discountAmount)}</td>
                      </tr>
                    )}
                    {invoiceData.taxRate > 0 && (
                      <tr className="border-b border-gray-300">
                        <td className="p-2 font-semibold">Tax ({invoiceData.taxRate}%):</td>
                        <td className="text-right p-2">{formatCurrency(invoiceData.taxAmount)}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-800 text-white text-base">
                      <td className="p-2 font-bold uppercase">Total:</td>
                      <td className="text-right p-2 font-bold">{formatCurrency(invoiceData.total)}</td>
                    </tr>
                  </tbody>
                </table>
            </div>
        </div>

        {/* Banking Information & Notes */}
        <div className="space-y-4 sm:space-y-6 text-xs border-t-2 border-gray-200 pt-4 sm:pt-6">
          {invoiceData.bankingInfo.bankName && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase mb-2">Banking Information:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                  <p><span className="font-bold">Bank:</span> {invoiceData.bankingInfo.bankName}</p>
                  <p><span className="font-bold">Account:</span> {invoiceData.bankingInfo.accountNumber}</p>
                  {invoiceData.bankingInfo.swiftCode && <p><span className="font-bold">SWIFT:</span> {invoiceData.bankingInfo.swiftCode}</p>}
                  {invoiceData.bankingInfo.iban && <p><span className="font-bold">IBAN:</span> {invoiceData.bankingInfo.iban}</p>}
              </div>
            </div>
          )}
          {invoiceData.notes && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase mb-2">Notes:</h3>
              <div className="text-gray-700 whitespace-pre-line italic bg-gray-50 p-3 border">
                {invoiceData.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center border-t-4 border-gray-800 pt-4 mt-6 sm:mt-8">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
            Thank you for your business
          </p>
        </div>
      </div>
    );
  }
);

ClassicTemplate.displayName = "ClassicTemplate";
