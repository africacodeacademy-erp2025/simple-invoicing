import React from "react";
import { InvoiceData, currencies } from "@/types/invoice";

interface ZistemoTemplateProps {
  invoiceData: InvoiceData;
}

// Zistemo-inspired: professional, clean, adaptable, fully customizable
export default function ZistemoProfessionalTemplate({ invoiceData }: ZistemoTemplateProps) {
  const selectedCurrency = currencies.find(c => c.code === invoiceData.currency);
  const currencySymbol = selectedCurrency?.symbol || "$";

  const formatCurrency = (amount: number) => {
    const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `${currencySymbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-10 bg-white text-gray-900 font-sans rounded-xl shadow-lg w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          {invoiceData.businessInfo.logo && (
            <img src={typeof invoiceData.businessInfo.logo === 'string' ? invoiceData.businessInfo.logo : URL.createObjectURL(invoiceData.businessInfo.logo)} alt="Logo" className="h-20 mb-3 object-contain" />
          )}
          <h1 className="text-3xl font-bold tracking-tight">{invoiceData.businessInfo.name || 'Business Name'}</h1>
          {invoiceData.businessInfo.address && <p className="text-sm mt-1 whitespace-pre-line opacity-80">{invoiceData.businessInfo.address}</p>}
        </div>
        <div className="text-right text-sm space-y-1">
          <p>Invoice #: {invoiceData.invoiceNumber}</p>
          <p>Date: {formatDate(invoiceData.date)}</p>
          <p>Due: {formatDate(invoiceData.dueDate)}</p>
          <p>Currency: {invoiceData.currency}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8 bg-gray-50 p-5 rounded-xl shadow-sm">
        <h3 className="font-bold mb-2 uppercase">Bill To:</h3>
        <p className="font-semibold text-sm">{invoiceData.clientInfo.name}</p>
        {invoiceData.clientInfo.email && <p>{invoiceData.clientInfo.email}</p>}
        {invoiceData.clientInfo.address && <p className="whitespace-pre-line text-xs mt-1 opacity-80">{invoiceData.clientInfo.address}</p>}
      </div>

      {/* Line Items */}
      <table className="w-full mb-10 border border-gray-200 rounded-xl overflow-hidden text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-center">Qty</th>
            <th className="p-3 text-right">Rate</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.lineItems.map((item, idx) => (
            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="p-3">{item.description}</td>
              <td className="text-center p-3">{item.quantity}</td>
              <td className="text-right p-3">{formatCurrency(item.rate)}</td>
              <td className="text-right p-3 font-semibold">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 bg-gray-50 p-5 rounded-xl shadow-sm text-sm">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoiceData.subtotal)}</span>
          </div>
          {invoiceData.discountRate > 0 && (
            <div className="flex justify-between py-1 text-red-600">
              <span>Discount ({invoiceData.discountRate}%):</span>
              <span>-{formatCurrency(invoiceData.discountAmount)}</span>
            </div>
          )}
          {invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-1">
              <span>Tax ({invoiceData.taxRate}%):</span>
              <span>{formatCurrency(invoiceData.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 mt-2 font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(invoiceData.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl shadow-sm text-sm">
          <h3 className="font-bold mb-2 uppercase">Notes:</h3>
          <p className="whitespace-pre-line italic">{invoiceData.notes}</p>
        </div>
      )}

      <footer className="text-center mt-10 text-xs text-gray-500">Thank you for your business.</footer>
    </div>
  );
}
