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
        className="w-[800px] bg-white p-10 shadow-lg"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-gray-800 pb-6 mb-8">
          {/* Logo */}
          {invoiceData.businessInfo.logo && (
            <div className="w-1/4">
              <img
                src={
                  typeof invoiceData.businessInfo.logo === "string"
                    ? invoiceData.businessInfo.logo
                    : URL.createObjectURL(invoiceData.businessInfo.logo)
                }
                alt="Business logo"
                className="max-w-full h-auto max-h-24 object-contain"
              />
            </div>
          )}

          {/* Business Info */}
          <div className="w-3/4 text-right">
            <h1 className="text-5xl font-bold text-gray-800 uppercase tracking-wider">
              {invoiceData.businessInfo.name || "Business Name"}
            </h1>
            <div className="text-sm text-gray-600 mt-2">
              {invoiceData.businessInfo.address && (
                <div className="whitespace-pre-line">
                  {invoiceData.businessInfo.address}
                </div>
              )}
              <div className="flex justify-end gap-4 mt-1">
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

        {/* Invoice Details & Client Info */}
        <div className="flex justify-between items-start mb-8">
          {/* Bill To */}
          <div className="w-1/2">
            <h3 className="text-lg font-bold text-gray-800 uppercase mb-2 border-b-2 border-gray-200 pb-1">
              Bill To:
            </h3>
            <div className="text-gray-700">
              <p className="font-semibold text-lg">
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

          {/* Invoice Info */}
          <div className="w-1/2 text-right">
            <h2 className="text-4xl font-bold text-gray-800 uppercase">
              Invoice
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              #{invoiceData.invoiceNumber}
            </p>
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <td className="font-bold pr-4">Date:</td>
                  <td>{formatDate(invoiceData.date)}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4">Due Date:</td>
                  <td>{formatDate(invoiceData.dueDate)}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-4">Currency:</td>
                  <td>{invoiceData.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="mb-8">
            <table className="w-full border-collapse border-2 border-gray-800">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="text-left p-3 font-bold uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center p-3 font-bold uppercase tracking-wider w-20">
                    Qty
                  </th>
                  <th className="text-right p-3 font-bold uppercase tracking-wider w-24">
                    Rate
                  </th>
                  <th className="text-right p-3 font-bold uppercase tracking-wider w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 border-r border-gray-200">
                      <div className="whitespace-pre-line">
                        {item.description}
                      </div>
                    </td>
                    <td className="text-center p-3 border-r border-gray-200">
                      {item.quantity}
                    </td>
                    <td className="text-right p-3 border-r border-gray-200">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="text-right p-3 font-semibold">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-80">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-3 font-semibold">Subtotal:</td>
                      <td className="text-right p-3">
                        {formatCurrency(invoiceData.subtotal)}
                      </td>
                    </tr>

                    {invoiceData.discountRate > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="p-3 font-semibold">
                          Discount ({invoiceData.discountRate}%):
                        </td>
                        <td className="text-right p-3 text-red-600">
                          -{formatCurrency(invoiceData.discountAmount)}
                        </td>
                      </tr>
                    )}

                    {invoiceData.taxRate > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="p-3 font-semibold">
                          Tax ({invoiceData.taxRate}%):
                        </td>
                        <td className="text-right p-3">
                          {formatCurrency(invoiceData.taxAmount)}
                        </td>
                      </tr>
                    )}

                    <tr className="bg-gray-800 text-white">
                      <td className="p-3 font-bold text-lg uppercase">
                        Total:
                      </td>
                      <td className="text-right p-3 font-bold text-lg">
                        {formatCurrency(invoiceData.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Banking Information */}
        {invoiceData.bankingInfo.bankName && (
          <div className="border-t-2 border-gray-200 pt-4 mb-8">
            <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">
              Banking Information:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold text-gray-700">Bank:</span>
                <p className="text-gray-800">
                  {invoiceData.bankingInfo.bankName}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-700">Account Number:</span>
                <p className="text-gray-800">
                  {invoiceData.bankingInfo.accountNumber}
                </p>
              </div>
              {invoiceData.bankingInfo.swiftCode && (
                <div>
                  <span className="font-bold text-gray-700">SWIFT Code:</span>
                  <p className="text-gray-800">
                    {invoiceData.bankingInfo.swiftCode}
                  </p>
                </div>
              )}
              {invoiceData.bankingInfo.iban && (
                <div>
                  <span className="font-bold text-gray-700">IBAN:</span>
                  <p className="text-gray-800">
                    {invoiceData.bankingInfo.iban}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div className="border-t-2 border-gray-200 pt-4 mb-8">
            <h3 className="text-lg font-bold text-gray-800 uppercase mb-2">
              Notes:
            </h3>
            <div className="text-gray-700 whitespace-pre-line italic">
              {invoiceData.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center border-t-4 border-gray-800 pt-6">
          <p className="text-gray-600 font-semibold uppercase tracking-wide">
            Thank you for your business
          </p>
        </div>
      </div>
    );
  }
);

ClassicTemplate.displayName = "ClassicTemplate";
