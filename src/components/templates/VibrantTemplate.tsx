import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface VibrantTemplateProps {
  invoiceData: InvoiceData;
}

export const VibrantTemplate = forwardRef<HTMLDivElement, VibrantTemplateProps>(
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
      const value = typeof amount === "number" && !isNaN(amount) ? amount : 0;
      return `${currencySymbol}${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    return (
      <div
        ref={ref}
        className="w-full p-6 md:p-10 bg-gradient-to-br from-pink-500 via-yellow-400 to-green-400 text-gray-900 rounded-2xl shadow-xl text-sm"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start bg-white bg-opacity-80 p-4 rounded-xl shadow-md mb-8">
          <div>
            {invoiceData.businessInfo.logo && (
              <img
                src={
                  typeof invoiceData.businessInfo.logo === "string"
                    ? invoiceData.businessInfo.logo
                    : URL.createObjectURL(invoiceData.businessInfo.logo)
                }
                alt="Business logo"
                className="max-w-[120px] h-auto object-contain mb-4"
              />
            )}
            <h1 className="text-3xl font-extrabold tracking-wide">
              {invoiceData.businessInfo.name || "Business Name"}
            </h1>
          </div>

          <div className="text-xs text-gray-700 space-y-1 mt-4 sm:mt-0">
            {invoiceData.businessInfo.address && (
              <div className="whitespace-pre-line">{invoiceData.businessInfo.address}</div>
            )}
            <p>Tel: {invoiceData.businessInfo.phone}</p>
            <p>Email: {invoiceData.businessInfo.email}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold uppercase drop-shadow-md">Invoice</h2>
          <p className="text-sm">#{invoiceData.invoiceNumber}</p>
        </div>

        {/* Client & Invoice Details */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8 bg-white bg-opacity-80 p-4 rounded-xl shadow-md">
          <div className="flex-1">
            <h3 className="text-base font-bold mb-2 uppercase">Bill To:</h3>
            <p className="font-semibold text-sm">{invoiceData.clientInfo.name}</p>
            {invoiceData.clientInfo.email && <p>{invoiceData.clientInfo.email}</p>}
            {invoiceData.clientInfo.address && (
              <div className="whitespace-pre-line text-xs mt-1">
                {invoiceData.clientInfo.address}
              </div>
            )}
          </div>

          <div className="flex-1 text-sm space-y-2">
            <p>
              <span className="font-bold">Date:</span> {formatDate(invoiceData.date)}
            </p>
            <p>
              <span className="font-bold">Due Date:</span> {formatDate(invoiceData.dueDate)}
            </p>
            <p>
              <span className="font-bold">Currency:</span> {invoiceData.currency}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-md mb-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.lineItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                >
                  <td className="p-2">{item.description}</td>
                  <td className="text-center p-2">{item.quantity}</td>
                  <td className="text-right p-2">{formatCurrency(item.rate)}</td>
                  <td className="text-right p-2 font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="bg-white bg-opacity-80 p-4 rounded-xl shadow-md w-full max-w-xs text-sm">
            <div className="flex justify-between py-1">
              <span className="font-semibold">Subtotal:</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>

            {invoiceData.discountRate > 0 && (
              <div className="flex justify-between py-1 text-red-600">
                <span className="font-semibold">Discount ({invoiceData.discountRate}%):</span>
                <span>-{formatCurrency(invoiceData.discountAmount)}</span>
              </div>
            )}

            {invoiceData.taxRate > 0 && (
              <div className="flex justify-between py-1">
                <span className="font-semibold">Tax ({invoiceData.taxRate}%):</span>
                <span>{formatCurrency(invoiceData.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-base rounded-lg px-2">
              <span>Total:</span>
              <span>{formatCurrency(invoiceData.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoiceData.notes && (
          <div className="bg-white bg-opacity-80 p-4 rounded-xl shadow-md mb-8 text-sm">
            <h3 className="font-bold mb-2 uppercase">Notes:</h3>
            <p className="whitespace-pre-line italic">{invoiceData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm font-semibold">
          <p className="text-white drop-shadow-md uppercase tracking-wide">Thank you for your business</p>
        </div>
      </div>
    );
  }
);

VibrantTemplate.displayName = "VibrantTemplate";
