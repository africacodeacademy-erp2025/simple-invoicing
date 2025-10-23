import React, { forwardRef, useState } from "react";
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
        className="w-[800px] bg-white p-8 space-y-6 border-2 border-gray-900"
        style={{ fontFamily: "serif" }}
      >
        {/* Letterhead */}
        <div className="text-center border-b-4 border-gray-900 pb-6">
          {invoiceData.businessInfo.logo && (
            <div className="flex justify-center mb-4">
              <img
                src={
                  typeof invoiceData.businessInfo.logo === "string"
                    ? invoiceData.businessInfo.logo
                    : URL.createObjectURL(invoiceData.businessInfo.logo)
                }
                alt="Business logo"
                className="max-h-16 object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">
            {invoiceData.businessInfo.name || "Business Name"}
          </h1>
          <div className="text-sm text-gray-600 mt-2">
            {invoiceData.businessInfo.address && (
              <div className="whitespace-pre-line">
                {invoiceData.businessInfo.address}
              </div>
            )}
            <div className="flex justify-center gap-4 mt-1">
              {invoiceData.businessInfo.phone && (
                <span>Tel: {invoiceData.businessInfo.phone}</span>
              )}
              {invoiceData.businessInfo.email && (
                <span>Email: {invoiceData.businessInfo.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 uppercase">
              Invoice
            </h2>
            <p className="text-lg text-gray-600">
              #{invoiceData.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              <div>
                <strong>Date:</strong> {formatDate(invoiceData.date)}
              </div>
              <div>
                <strong>Due:</strong> {formatDate(invoiceData.dueDate)}
              </div>
              <div>
                <strong>Currency:</strong> {invoiceData.currency}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="border-l-4 border-gray-900 pl-4">
          <h3 className="text-lg font-bold text-gray-900 uppercase mb-2">
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

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div>
            <table className="w-full border-2 border-gray-900">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left p-3 font-bold uppercase">
                    Description
                  </th>
                  <th className="text-center p-3 font-bold uppercase w-20">
                    Qty
                  </th>
                  <th className="text-right p-3 font-bold uppercase w-24">
                    Rate
                  </th>
                  <th className="text-right p-3 font-bold uppercase w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 border-r border-gray-300">
                      <div className="whitespace-pre-line">
                        {item.description}
                      </div>
                    </td>
                    <td className="text-center p-3 border-r border-gray-300">
                      {item.quantity}
                    </td>
                    <td className="text-right p-3 border-r border-gray-300">
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
            <div className="flex justify-end mt-4">
              <div className="w-80">
                <table className="w-full border-2 border-gray-900">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-3 font-semibold">Subtotal:</td>
                      <td className="text-right p-3">
                        {formatCurrency(invoiceData.subtotal)}
                      </td>
                    </tr>

                    {invoiceData.discountRate > 0 && (
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-semibold">
                          Discount ({invoiceData.discountRate}%):
                        </td>
                        <td className="text-right p-3 text-red-600">
                          -{formatCurrency(invoiceData.discountAmount)}
                        </td>
                      </tr>
                    )}

                    {invoiceData.taxRate > 0 && (
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-semibold">
                          Tax ({invoiceData.taxRate}%):
                        </td>
                        <td className="text-right p-3">
                          {formatCurrency(invoiceData.taxAmount)}
                        </td>
                      </tr>
                    )}

                    <tr className="bg-gray-900 text-white">
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
          <div className="border-t-2 border-gray-900 pt-4">
            <h3 className="text-lg font-bold text-gray-900 uppercase mb-4">
              Banking Information:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold text-gray-700">Bank:</span>
                <p className="text-gray-900">
                  {invoiceData.bankingInfo.bankName}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-700">Account Number:</span>
                <p className="text-gray-900">
                  {invoiceData.bankingInfo.accountNumber}
                </p>
              </div>
              {invoiceData.bankingInfo.swiftCode && (
                <div>
                  <span className="font-bold text-gray-700">SWIFT Code:</span>
                  <p className="text-gray-900">
                    {invoiceData.bankingInfo.swiftCode}
                  </p>
                </div>
              )}
              {invoiceData.bankingInfo.iban && (
                <div>
                  <span className="font-bold text-gray-700">IBAN:</span>
                  <p className="text-gray-900">
                    {invoiceData.bankingInfo.iban}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div className="border-t-2 border-gray-900 pt-4">
            <h3 className="text-lg font-bold text-gray-900 uppercase mb-2">
              Notes:
            </h3>
            <div className="text-gray-700 whitespace-pre-line italic">
              {invoiceData.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center border-t-2 border-gray-900 pt-4">
          <p className="text-gray-600 font-semibold uppercase tracking-wide">
            Thank you for your business
          </p>
        </div>
      </div>
    );
  }
);

ClassicTemplate.displayName = "ClassicTemplate";
