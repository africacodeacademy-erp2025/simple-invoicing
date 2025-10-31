import React, { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      return `${currencySymbol}${amount.toFixed(2)}`;
    };

    return (
      <Card className="w-[800px] shadow-lg font-sans" ref={ref}>
        <CardContent className="p-10">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 mb-8 border-b-2 border-gray-100">
            {/* Left Section: Logo and Invoice Title */}
            <div className="flex items-center gap-6">
              {invoiceData.businessInfo.logo && (
                <div className="w-24 h-24 flex items-center justify-center">
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
                <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
                <p className="text-gray-500 mt-1">
                  #{invoiceData.invoiceNumber}
                </p>
              </div>
            </div>

            {/* Right Section: Business Info */}
            <div className="text-right">
              <h2 className="text-2xl font-semibold text-gray-800">
                {invoiceData.businessInfo.name}
              </h2>
              {invoiceData.businessInfo.address && (
                <div className="text-sm text-gray-500 whitespace-pre-line mt-1">
                  {invoiceData.businessInfo.address}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                {invoiceData.businessInfo.email && (
                  <span>{invoiceData.businessInfo.email}</span>
                )}
                {invoiceData.businessInfo.phone && (
                  <span className="ml-4">
                    {invoiceData.businessInfo.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client and Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
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

            {/* Invoice Info */}
            <div className="text-right">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-sm font-semibold text-gray-500 uppercase pr-4">
                      Issue Date:
                    </td>
                    <td className="text-gray-800">
                      {formatDate(invoiceData.date)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm font-semibold text-gray-500 uppercase pr-4">
                      Due Date:
                    </td>
                    <td className="text-gray-800">
                      {formatDate(invoiceData.dueDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm font-semibold text-gray-500 uppercase pr-4">
                      Currency:
                    </td>
                    <td className="text-gray-800">{invoiceData.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Items */}
          {invoiceData.lineItems.length > 0 && (
            <div className="mb-8">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600 uppercase">
                      Description
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-right w-24">
                      Qty
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-right w-32">
                      Rate
                    </th>
                    <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-right w-40">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="p-4">
                        <div className="whitespace-pre-line text-gray-800">
                          {item.description}
                        </div>
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="p-4 text-right font-semibold text-gray-800">
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
            <div className="w-full max-w-xs">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-500">Subtotal:</td>
                    <td className="py-2 text-right text-gray-800">
                      {formatCurrency(invoiceData.subtotal)}
                    </td>
                  </tr>
                  {invoiceData.discountRate > 0 && (
                    <tr>
                      <td className="py-2 text-gray-500">
                        Discount ({invoiceData.discountRate}%):
                      </td>
                      <td className="py-2 text-right text-green-600">
                        -{formatCurrency(invoiceData.discountAmount)}
                      </td>
                    </tr>
                  )}
                  {invoiceData.taxRate > 0 && (
                    <tr>
                      <td className="py-2 text-gray-500">
                        Tax ({invoiceData.taxRate}%):
                      </td>
                      <td className="py-2 text-right text-gray-800">
                        {formatCurrency(invoiceData.taxAmount)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-200">
                    <td className="pt-4 font-bold text-lg text-gray-800">
                      Total:
                    </td>
                    <td className="pt-4 text-right font-bold text-lg text-blue-600">
                      {formatCurrency(invoiceData.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Notes
              </h3>
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                {invoiceData.notes}
              </div>
            </div>
          )}

          {/* Banking Information */}
          {invoiceData.bankingInfo.bankName && (
            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Banking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Bank:</span>
                  <p className="font-semibold text-gray-800">
                    {invoiceData.bankingInfo.bankName}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Account Number:
                  </span>
                  <p className="font-semibold text-gray-800">
                    {invoiceData.bankingInfo.accountNumber}
                  </p>
                </div>
                {invoiceData.bankingInfo.swiftCode && (
                  <div>
                    <span className="font-medium text-gray-600">SWIFT Code:</span>
                    <p className="font-semibold text-gray-800">
                      {invoiceData.bankingInfo.swiftCode}
                    </p>
                  </div>
                )}
                {invoiceData.bankingInfo.iban && (
                  <div>
                    <span className="font-medium text-gray-600">IBAN:</span>
                    <p className="font-semibold text-gray-800">
                      {invoiceData.bankingInfo.iban}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-8 mt-8 border-t-2 border-gray-100">
            <p className="text-sm text-gray-500">
              Thank you for your business!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ModernTemplate.displayName = "ModernTemplate";
