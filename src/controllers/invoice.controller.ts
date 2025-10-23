import { InvoiceService, SavedInvoice } from "@/services/invoice.service";
import { InvoiceData } from "@/types/invoice";
import { InvoiceTemplate } from "@/types/templates";
import { RefObject } from 'react';

export interface InvoiceControllerResponse {
  success: boolean;
  data?: SavedInvoice | SavedInvoice[];
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class InvoiceController {

  static async saveInvoice(
    userId: string,
    invoiceData: InvoiceData,
    template: InvoiceTemplate
  ): Promise<InvoiceControllerResponse> {
    try {
      const errors = this.validateInvoiceData(invoiceData);
      if (errors.length > 0) {
        return { success: false, message: "Validation failed", errors };
      }
      const response = await InvoiceService.saveInvoice(userId, invoiceData, template);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error in InvoiceController.saveInvoice:", error);
      return { success: false, message: "An unexpected error occurred while saving the invoice" };
    }
  }

  static async getInvoices(userId: string): Promise<InvoiceControllerResponse> {
    try {
      const response = await InvoiceService.getInvoices(userId);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      return { success: true, data: response.data as SavedInvoice[], message: response.message };
    } catch (error) {
      console.error("Error in InvoiceController.getInvoices:", error);
      return { success: false, message: "An unexpected error occurred while fetching invoices" };
    }
  }

  static async getInvoice(invoiceId: string): Promise<InvoiceControllerResponse> {
    try {
      const response = await InvoiceService.getInvoice(invoiceId);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error in InvoiceController.getInvoice:", error);
      return { success: false, message: "An unexpected error occurred while fetching the invoice" };
    }
  }

  static async updateInvoice(
    invoiceId: string,
    invoiceData: InvoiceData,
    template: InvoiceTemplate
  ): Promise<InvoiceControllerResponse> {
    try {
      const errors = this.validateInvoiceData(invoiceData);
      if (errors.length > 0) {
        return { success: false, message: "Validation failed", errors };
      }
      const response = await InvoiceService.updateInvoice(invoiceId, invoiceData, template);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error in InvoiceController.updateInvoice:", error);
      return { success: false, message: "An unexpected error occurred while updating the invoice" };
    }
  }

  static async deleteInvoice(invoiceId: string): Promise<InvoiceControllerResponse> {
    try {
      const response = await InvoiceService.deleteInvoice(invoiceId);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Error in InvoiceController.deleteInvoice:", error);
      return { success: false, message: "An unexpected error occurred while deleting the invoice" };
    }
  }

  static async sendInvoiceByEmail(
    invoice: SavedInvoice,
    componentRef: RefObject<HTMLDivElement>,
    emailData: { recipientEmail: string; recipientName: string; customMessage: string; ccOwner: boolean; autoGenerateMessage: boolean; }
  ): Promise<InvoiceControllerResponse> {
    try {
      const response = await InvoiceService.sendInvoiceByEmail(invoice, componentRef, emailData);
      if (!response.success) {
        return { success: false, message: response.message, errors: response.errors };
      }
      return { success: true, message: 'Invoice sent successfully' };
    } catch (error) {
      console.error("Error in InvoiceController.sendInvoiceByEmail:", error);
      return { success: false, message: "An unexpected error occurred while sending the invoice email" };
    }
  }

  private static validateInvoiceData(invoiceData: InvoiceData): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];
    if (!invoiceData.invoiceNumber?.trim()) errors.push({ field: "invoiceNumber", message: "Invoice number is required" });
    if (!invoiceData.date) errors.push({ field: "date", message: "Issue date is required" });
    if (!invoiceData.dueDate) errors.push({ field: "dueDate", message: "Due date is required" });
    if (!invoiceData.currency?.trim()) errors.push({ field: "currency", message: "Currency is required" });
    if (!invoiceData.businessInfo.name?.trim()) errors.push({ field: "businessName", message: "Business name is required" });
    if (!invoiceData.clientInfo.name?.trim()) errors.push({ field: "clientName", message: "Client name is required" });
    if (invoiceData.lineItems.length === 0) errors.push({ field: "lineItems", message: "At least one line item is required" });

    invoiceData.lineItems.forEach((item, index) => {
      if (!item.description?.trim()) errors.push({ field: `lineItems[${index}].description`, message: `Line item ${index + 1} description is required` });
      if (item.quantity <= 0) errors.push({ field: `lineItems[${index}].quantity`, message: `Line item ${index + 1} quantity must be greater than 0` });
      if (item.rate < 0) errors.push({ field: `lineItems[${index}].rate`, message: `Line item ${index + 1} rate cannot be negative` });
    });

    return errors;
  }

  static async updateEmailSentDate(invoiceId: string): Promise<any> {
    if (!invoiceId?.trim()) {
      return { success: false, message: "Invoice ID is required", errors: [{ field: "invoiceId", message: "Invoice ID is required" }] };
    }
    return InvoiceService.updateEmailSentDate(invoiceId);
  }
}
