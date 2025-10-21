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
      <Card className="w-[800px] shadow-medium bg-card-gradient" ref={ref}>
        <CardContent className="p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              {invoiceData.businessInfo.logo && (
                <div
                  className="mb-4"
                  style={{ maxWidth: "200px", maxHeight: "80px" }}
                >
                  <img
                    src={
                      typeof invoiceData.businessInfo.logo === "string"
                        ? invoiceData.businessInfo.logo
                        : URL.createObjectURL(invoiceData.businessInfo.logo)
                    }
                    alt="Business logo"
                    className="max-w-full max-h-full object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
              <p className="text-muted-foreground">
                #{invoiceData.invoiceNumber}
              </p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-semibold">
                {invoiceData.businessInfo.name}
              </h2>
              {invoiceData.businessInfo.email && (
                <p className="text-sm text-muted-foreground">
                  {invoiceData.businessInfo.email}
                </p>
              )}
              {invoiceData.businessInfo.phone && (
                <p className="text-sm text-muted-foreground">
                  {invoiceData.businessInfo.phone}
                </p>
              )}
              {invoiceData.businessInfo.address && (
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoiceData.businessInfo.address}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details and Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
                <div className="space-y-1">
                  <p className="font-medium">{invoiceData.clientInfo.name}</p>
                  {invoiceData.clientInfo.email && (
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.clientInfo.email}
                    </p>
                  )}
                  {invoiceData.clientInfo.address && (
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {invoiceData.clientInfo.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span>{formatDate(invoiceData.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{formatDate(invoiceData.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span>{invoiceData.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoiceData.lineItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Items</h3>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Description</th>
                      <th className="text-right p-4 font-medium">Qty</th>
                      <th className="text-right p-4 font-medium">Rate</th>
                      <th className="text-right p-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.lineItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className={
                          index % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }
                      >
                        <td className="p-4">
                          <div className="whitespace-pre-line">
                            {item.description}
                          </div>
                        </td>
                        <td className="text-right p-4">{item.quantity}</td>
                        <td className="text-right p-4">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="text-right p-4 font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoiceData.subtotal)}</span>
                  </div>

                  {invoiceData.discountRate > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({invoiceData.discountRate}%):</span>
                      <span>-{formatCurrency(invoiceData.discountAmount)}</span>
                    </div>
                  )}

                  {invoiceData.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({invoiceData.taxRate}%):</span>
                      <span>{formatCurrency(invoiceData.taxAmount)}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">
                      {formatCurrency(invoiceData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoiceData.notes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Notes</h3>
              <div className="text-muted-foreground whitespace-pre-line bg-muted/30 p-4 rounded-lg">
                {invoiceData.notes}
              </div>
            </div>
          )}

          {/* Banking Information */}
          {invoiceData.bankingInfo.bankName && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">
                Banking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Bank:
                  </span>
                  <p className="font-medium">
                    {invoiceData.bankingInfo.bankName}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Account Number:
                  </span>
                  <p className="font-medium">
                    {invoiceData.bankingInfo.accountNumber}
                  </p>
                </div>
                {invoiceData.bankingInfo.swiftCode && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      SWIFT Code:
                    </span>
                    <p className="font-medium">
                      {invoiceData.bankingInfo.swiftCode}
                    </p>
                  </div>
                )}
                {invoiceData.bankingInfo.iban && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      IBAN:
                    </span>
                    <p className="font-medium">
                      {invoiceData.bankingInfo.iban}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Thank you for your business!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ModernTemplate.displayName = "ModernTemplate";
