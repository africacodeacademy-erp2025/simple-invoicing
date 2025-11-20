import React, { forwardRef } from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface CreativeGeometricTemplateProps {
  invoiceData: InvoiceData;
}

export const CreativeGeometricTemplate = forwardRef<
  HTMLDivElement,
  CreativeGeometricTemplateProps
>(({ invoiceData }, ref) => {
  const selectedCurrency = currencies.find((c) => c.code === invoiceData.currency);
  const currencySymbol = selectedCurrency?.symbol || "$";

  const currencyFormatter = (value: number) => {
    const v = typeof value === "number" && !isNaN(value) ? value : 0;
    return `${currencySymbol}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const {
    invoiceNumber,
    date,
    dueDate,
    lineItems,
    taxRate,
    discountRate,
    subtotal,
    total,
    notes,
    businessInfo,
    clientInfo,
  } = invoiceData;

  return (
    <div className="relative w-full max-w-[1100px] mx-auto bg-white text-gray-900 overflow-hidden p-10" ref={ref}>
      {/* Geometric Background Shapes */}
      <div className="absolute top-0 left-0 w-0 h-0 border-r-[400px] border-r-blue-500 border-b-[400px] border-b-transparent opacity-20 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[350px] border-l-pink-500 border-t-[350px] border-t-transparent opacity-20 -z-10"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-wide uppercase">Invoice</h1>
          <p className="mt-3 text-sm font-medium">Invoice #: {invoiceNumber}</p>
          <p className="text-sm font-medium">Date: {date}</p>
          <p className="text-sm font-medium">Due: {dueDate}</p>
        </div>

        {businessInfo?.logo && (
          <img
            src={
              typeof businessInfo.logo === "string"
                ? businessInfo.logo
                : URL.createObjectURL(businessInfo.logo)
            }
            alt="Business Logo"
            className="h-24 rounded-md object-contain shadow-md"
          />
        )}
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse shadow-md text-sm mb-10">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-right">Qty</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length > 0 ? (
            lineItems.map((item, index) => (
              <tr key={item.id} className={`even:bg-gray-100 odd:bg-white border-b`}>
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">{currencyFormatter(item.rate)}</td>
                <td className="p-3 text-right">{currencyFormatter(item.amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-center italic text-gray-500">
                No items added
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-10">
        <div className="w-72 text-sm bg-gray-50 shadow-md p-5 rounded-lg">
          <div className="flex justify-between py-1 border-b">
            <span>Subtotal</span>
            <span>{currencyFormatter(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span>Discount</span>
            <span>{currencyFormatter(invoiceData.discountAmount)}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span>Tax ({taxRate}%)</span>
            <span>{currencyFormatter(invoiceData.taxAmount)}</span>
          </div>
          <div className="flex justify-between py-2 text-base font-bold">
            <span>Total</span>
            <span>{currencyFormatter(total)}</span>
          </div>
        </div>
      </div>

      {/* Custom Fields */}
      {Array.isArray((invoiceData as any).customFields) && (invoiceData as any).customFields.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
          <ul className="list-disc ml-5 text-sm">
            {(invoiceData as any).customFields.map((field: any, index: number) => (
              <li key={index}>{field.label}: {field.value}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-gray-500">Thank you for choosing our services.</footer>
    </div>
  );
});

CreativeGeometricTemplate.displayName = "CreativeGeometricTemplate";
