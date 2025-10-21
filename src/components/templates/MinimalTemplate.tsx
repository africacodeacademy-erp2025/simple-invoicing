import React from "react";
import { InvoiceData } from "@/types/invoice";

interface MinimalTemplateProps {
  invoiceData: InvoiceData;
  isPremiumUser?: boolean;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ invoiceData }) => {
  const { businessInfo, clientInfo, lineItems, total, currency, invoiceNumber, date, dueDate } = invoiceData;

  return (
    <div className="w-[800px] bg-white p-8 font-sans">
        <div className="flex justify-between items-start mb-8">
            <div>
            <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-500">{invoiceNumber}</p>
            </div>
            <div className="text-right">
            <h2 className="text-2xl font-semibold text-gray-700">{businessInfo.name}</h2>
            <p className="text-gray-500">{businessInfo.address}</p>
            <p className="text-gray-500">{businessInfo.email}</p>
            <p className="text-gray-500">{businessInfo.phone}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
            <h3 className="font-semibold text-gray-600 mb-2">BILL TO</h3>
            <p className="text-gray-800 font-medium">{clientInfo.name}</p>
            <p className="text-gray-500">{clientInfo.address}</p>
            <p className="text-gray-500">{clientInfo.email}</p>
            </div>
            <div className="text-right">
            <div className="mb-2">
                <span className="font-semibold text-gray-600">Issue Date: </span>
                <span className="text-gray-800">{new Date(date).toLocaleDateString()}</span>
            </div>
            <div>
                <span className="font-semibold text-gray-600">Due Date: </span>
                <span className="text-gray-800">{new Date(dueDate).toLocaleDateString()}</span>
            </div>
            </div>
        </div>

        <table className="w-full mb-8 text-left">
            <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Amount</th>
            </tr>
            </thead>
            <tbody>
            {lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">{item.rate.toFixed(2)}</td>
                <td className="p-3 text-right">{(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
            ))}
            </tbody>
        </table>

        <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs">
            <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-600">Subtotal</span>
                <span className="text-gray-800">
                {lineItems.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                {currency} {total.toFixed(2)}
                </span>
            </div>
            </div>
        </div>

        <div className="mt-8">
            <h3 className="font-semibold text-gray-600 mb-2">Notes</h3>
            <p className="text-gray-500 text-sm">{invoiceData.notes}</p>
        </div>
    </div>
  );
};
