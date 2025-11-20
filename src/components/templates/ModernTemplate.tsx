
import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceData, currencies } from "@/types/invoice";

interface ModernTemplateProps {
  invoiceData: InvoiceData;
}

export const ModernTemplate = forwardRef<HTMLDivElement, ModernTemplateProps>(
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
      const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <Card className="w-full font-sans text-sm" ref={ref}>
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-4 sm:pb-6 mb-4 sm:mb-6 border-b">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              {invoiceData.businessInfo.logo && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
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
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  INVOICE
                </h1>
                <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                  #{invoiceData.invoiceNumber}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                {invoiceData.businessInfo.name}
              </h2>
              {invoiceData.businessInfo.address && (
                <div className="text-xs text-gray-500 whitespace-pre-line mt-1">
                  {invoiceData.businessInfo.address}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {invoiceData.businessInfo.email && (
                  <p>{invoiceData.businessInfo.email}</p>
                )}
                {invoiceData.businessInfo.phone && (
                  <p className="mt-1 sm:mt-0">
                    {invoiceData.businessInfo.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client and Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Bill To
              </h3>
              <div className="text-gray-800">
                <p className="font-bold text-sm sm:text-base">
                  {invoiceData.clientInfo.name}
                </p>
                {invoiceData.clientInfo.email && (
                  <p className="text-xs">{invoiceData.clientInfo.email}</p>
                )}
                {invoiceData.clientInfo.address && (
                  <div className="text-xs whitespace-pre-line mt-1">
                    {invoiceData.clientInfo.address}
                  </div>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-xs font-semibold text-gray-500 uppercase pr-4 py-1">
                      Issue Date:
                    </td>
                    <td className="text-gray-800 text-xs text-right">
                      {formatDate(invoiceData.date)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs font-semibold text-gray-500 uppercase pr-4 py-1">
                      Due Date:
                    </td>
                    <td className="text-gray-800 text-xs text-right">
                      {formatDate(invoiceData.dueDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs font-semibold text-gray-500 uppercase pr-4 py-1">
                      Currency:
                    </td>
                    <td className="text-gray-800 text-xs text-right">
                      {invoiceData.currency}
                    </td>
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
              <table className="w-full text-left hidden sm:table">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-2 sm:p-3 font-semibold text-xs text-gray-600 uppercase">
                      Description
                    </th>
                    <th className="p-2 sm:p-3 font-semibold text-xs text-gray-600 uppercase text-right">
                      Qty
                    </th>
                    <th className="p-2 sm:p-3 font-semibold text-xs text-gray-600 uppercase text-right">
                      Rate
                    </th>
                    <th className="p-2 sm:p-3 font-semibold text-xs text-gray-600 uppercase text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 sm:p-3">
                        <div className="whitespace-pre-line text-xs text-gray-800">
                          {item.description}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-right text-xs text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="p-2 sm:p-3 text-right text-xs text-gray-600">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="p-2 sm:p-3 text-right text-xs font-semibold text-gray-800">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="w-full sm:max-w-[250px]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-1 sm:py-2 text-xs text-gray-500">Subtotal:</td>
                    <td className="py-1 sm:py-2 text-right text-xs text-gray-800">
                      {formatCurrency(invoiceData.subtotal)}
                    </td>
                  </tr>
                  {invoiceData.discountRate > 0 && (
                    <tr>
                      <td className="py-1 sm:py-2 text-xs text-gray-500">
                        Discount ({invoiceData.discountRate}%):
                      </td>
                      <td className="py-1 sm:py-2 text-right text-xs text-green-600">
                        -{formatCurrency(invoiceData.discountAmount)}
                      </td>
                    </tr>
                  )}
                  {invoiceData.taxRate > 0 && (
                    <tr>
                      <td className="py-1 sm:py-2 text-xs text-gray-500">
                        Tax ({invoiceData.taxRate}%):
                      </td>
                      <td className="py-1 sm:py-2 text-right text-xs text-gray-800">
                        {formatCurrency(invoiceData.taxAmount)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2">
                    <td className="pt-2 sm:pt-3 font-bold text-sm sm:text-base text-gray-800">
                      Total:
                    </td>
                    <td className="pt-2 sm:pt-3 text-right font-bold text-sm sm:text-base text-blue-600">
                      {formatCurrency(invoiceData.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Notes
              </h3>
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                {invoiceData.notes}
              </div>
            </div>
          )}

          {/* Banking Information */}
          {invoiceData.bankingInfo.bankName && (
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Banking Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div>
                  <p className="font-medium text-gray-600">Bank:</p>
                  <p className="font-semibold text-gray-800">
                    {invoiceData.bankingInfo.bankName}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">
                    Account Number:
                  </p>
                  <p className="font-semibold text-gray-800">
                    {invoiceData.bankingInfo.accountNumber}
                  </p>
                </div>
                {invoiceData.bankingInfo.swiftCode && (
                  <div>
                    <p className="font-medium text-gray-600">SWIFT Code:</p>
                    <p className="font-semibold text-gray-800">
                      {invoiceData.bankingInfo.swiftCode}
                    </p>
                  </div>
                )}
                {invoiceData.bankingInfo.iban && (
                  <div>
                    <p className="font-medium text-gray-600">IBAN:</p>
                    <p className="font-semibold text-gray-800">
                      {invoiceData.bankingInfo.iban}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 sm:pt-6 mt-4 sm:mt-6 border-t">
            <p className="text-xs text-gray-500">
              Thank you for your business!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ModernTemplate.displayName = "ModernTemplate";
