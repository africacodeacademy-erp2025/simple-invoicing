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
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <div ref={ref} className="w-[800px] bg-white">
      {/* Header Bar */}
      <div className="bg-gray-900 h-2"></div>

      <div className="p-8 space-y-8">
        {/* Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6">
          <div className="flex items-center space-x-6">
            {invoiceData.businessInfo.logo && (
              <div className="w-20 h-20 border border-gray-300 p-2">
                <img
                  src={
                    typeof invoiceData.businessInfo.logo === "string"
                      ? invoiceData.businessInfo.logo
                      : URL.createObjectURL(invoiceData.businessInfo.logo)
                  }
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                {invoiceData.businessInfo.name || "Company Name"}
              </h1>
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                {invoiceData.businessInfo.address && (
                  <div className="whitespace-pre-line">
                    {invoiceData.businessInfo.address}
                  </div>
                )}
                <div className="flex gap-6">
                  {invoiceData.businessInfo.phone && (
                    <div>Tel: {invoiceData.businessInfo.phone}</div>
                  )}
                  {invoiceData.businessInfo.email && (
                    <div>Email: {invoiceData.businessInfo.email}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 uppercase">
              INVOICE
            </h2>
            <div className="text-gray-600 mt-1">
              #{invoiceData.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Invoice Information Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Bill To Section */}
          <div>
            <div className="bg-gray-900 text-white px-4 py-2 uppercase font-bold text-sm tracking-wide">
              Bill To
            </div>
            <div className="border-l-4 border-gray-900 border-r border-b border-gray-300 p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="font-bold text-gray-900 text-lg">
                  {invoiceData.clientInfo.name}
                </div>
                {invoiceData.clientInfo.email && (
                  <div className="text-gray-700">
                    {invoiceData.clientInfo.email}
                  </div>
                )}
                {invoiceData.clientInfo.address && (
                  <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                    {invoiceData.clientInfo.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <div className="bg-gray-900 text-white px-4 py-2 uppercase font-bold text-sm tracking-wide">
              Invoice Details
            </div>
            <div className="border-l border-r-4 border-b border-gray-300 border-r-gray-900 p-4 bg-gray-50">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">
                      Invoice Date:
                    </td>
                    <td className="py-2 text-right">
                      {formatDate(invoiceData.date)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">
                      Due Date:
                    </td>
                    <td className="py-2 text-right">
                      {formatDate(invoiceData.dueDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">
                      Currency:
                    </td>
                    <td className="py-2 text-right">{invoiceData.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.lineItems.length > 0 && (
          <div className="border-2 border-gray-900">
            <div className="bg-gray-900 text-white px-4 py-3 uppercase font-bold text-sm tracking-wide">
              Services / Products
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-900">
                  <th className="text-left p-4 font-bold text-gray-900 uppercase text-xs tracking-wide">
                    Description
                  </th>
                  <th className="text-center p-4 font-bold text-gray-900 uppercase text-xs tracking-wide w-20">
                    Qty
                  </th>
                  <th className="text-right p-4 font-bold text-gray-900 uppercase text-xs tracking-wide w-24">
                    Rate
                  </th>
                  <th className="text-right p-4 font-bold text-gray-900 uppercase text-xs tracking-wide w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lineItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-b border-gray-200`}
                  >
                    <td className="p-4 text-gray-800">
                      <div className="whitespace-pre-line">
                        {item.description}
                      </div>
                    </td>
                    <td className="text-center p-4 text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="text-right p-4 text-gray-700">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="text-right p-4 font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="bg-gray-100 p-4">
              <div className="flex justify-end">
                <div className="w-96">
                  <table className="w-full border-2 border-gray-900">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="p-3 font-bold text-gray-900 bg-gray-200">
                          Subtotal:
                        </td>
                        <td className="p-3 text-right bg-white">
                          {formatCurrency(invoiceData.subtotal)}
                        </td>
                      </tr>

                      {invoiceData.discountRate > 0 && (
                        <tr className="border-b border-gray-300">
                          <td className="p-3 font-bold text-gray-900 bg-gray-200">
                            Discount ({invoiceData.discountRate}%):
                          </td>
                          <td className="p-3 text-right bg-white text-red-600">
                            -{formatCurrency(invoiceData.discountAmount)}
                          </td>
                        </tr>
                      )}

                      {invoiceData.taxRate > 0 && (
                        <tr className="border-b border-gray-300">
                          <td className="p-3 font-bold text-gray-900 bg-gray-200">
                            Tax ({invoiceData.taxRate}%):
                          </td>
                          <td className="p-3 text-right bg-white">
                            {formatCurrency(invoiceData.taxAmount)}
                          </td>
                        </tr>
                      )}

                      <tr>
                        <td className="p-4 font-bold text-white bg-gray-900 text-lg uppercase">
                          Total Amount:
                        </td>
                        <td className="p-4 text-right bg-gray-900 text-white font-bold text-lg">
                          {formatCurrency(invoiceData.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banking Information */}
        {invoiceData.bankingInfo.bankName && (
          <div className="border-2 border-gray-900">
            <div className="bg-gray-900 text-white px-4 py-2 uppercase font-bold text-sm tracking-wide">
              Banking Information
            </div>
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold text-gray-700">Bank:</span>
                  <p className="text-gray-900">
                    {invoiceData.bankingInfo.bankName}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-gray-700">
                    Account Number:
                  </span>
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
          </div>
        )}

        {/* Notes */}
        {invoiceData.notes && (
          <div className="border-2 border-gray-900">
            <div className="bg-gray-900 text-white px-4 py-2 uppercase font-bold text-sm tracking-wide">
              Terms & Notes
            </div>
            <div className="p-4 bg-gray-50 text-gray-800 whitespace-pre-line leading-relaxed">
              {invoiceData.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-900 pt-6 text-center">
          <p className="text-gray-600 font-semibold uppercase tracking-wide">
            Thank you for your business
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Please remit payment within the specified due date to avoid any late
            fees.
          </p>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-gray-900 h-2"></div>
    </div>
  );
});

CorporateTemplate.displayName = "CorporateTemplate";
