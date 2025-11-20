import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceTemplate } from "./template.service";

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
}

export class PDFGeneratorService {
  /**
   * Generate a PDF invoice from HTML template (matches preview exactly)
   */
  static async generateInvoicePDFFromHTML(
    template: InvoiceTemplate,
    data: InvoiceData
  ): Promise<jsPDF> {
    // Create a temporary HTML element
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "210mm"; // A4 width
    tempDiv.style.height = "297mm"; // A4 height
    tempDiv.style.backgroundColor = "white";
    tempDiv.style.padding = "15mm";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.fontSize = "12px";
    tempDiv.style.lineHeight = "1.4";

    // Generate HTML content based on template
    tempDiv.innerHTML = this.generateInvoiceHTML(template, data);

    // Add to DOM temporarily
    document.body.appendChild(tempDiv);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        width: 794, // 210mm in pixels at 96 DPI
        height: 1123, // 297mm in pixels at 96 DPI
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Create PDF from canvas
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      return pdf;
    } finally {
      // Clean up
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Generate HTML content for invoice template
   */
  private static generateInvoiceHTML(
    template: InvoiceTemplate,
    data: InvoiceData
  ): string {
    const colors = this.getTemplateColors(template.id);
    
    // Get template-specific background styling
    const backgroundStyle = this.getTemplateBackgroundStyle(template.id, colors);

    return `
      <div style="width: 100%; height: 100%; font-family: Arial, sans-serif; color: #333; ${backgroundStyle}">
        ${this.generateHeaderHTML(template, data, colors)}
        ${this.generateCompanyClientHTML(data, colors)}
        ${this.generateLineItemsHTML(data, colors)}
        ${this.generateTotalsHTML(data, colors)}
        ${this.generateFooterHTML(template, data, colors)}
      </div>
    `;
  }

  /**
   * Get template-specific background styling
   */
  private static getTemplateBackgroundStyle(templateId: string, colors: any): string {
    switch (templateId) {
      case "modern":
        return `background: linear-gradient(135deg, ${colors.background} 0%, #e0f2fe 100%);`;
      case "creative":
        return `background: linear-gradient(135deg, ${colors.background} 0%, #f3e8ff 100%);`;
      case "corporate":
        return `background: ${colors.background};`;
      case "minimal":
        return `background: white;`;
      case "classic":
        return `background: white;`;
      default:
        return `background: white;`;
    }
  }

  /**
   * Generate header HTML based on template
   */
  private static generateHeaderHTML(
    template: InvoiceTemplate,
    data: InvoiceData,
    colors: any
  ): string {
    switch (template.id) {
      case "classic":
        return `
          <div style="border-bottom: 2px solid #e5e5e5; padding-bottom: 8px; margin-bottom: 16px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: ${colors.primary};">INVOICE</h1>
            <p style="font-size: 12px; color: ${colors.secondary}; margin: 4px 0 0 0;">#${data.invoiceNumber}</p>
          </div>
        `;

      case "modern":
        return `
          <div style="background: ${colors.primary}; color: white; padding: 12px; margin: -15mm -15mm 16px -15mm;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0;">INVOICE</h1>
            <p style="font-size: 12px; margin: 4px 0 0 0; opacity: 0.9;">#${data.invoiceNumber}</p>
          </div>
        `;

      case "minimal":
        return `
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 18px; font-weight: 300; margin: 0; color: ${colors.primary};">Invoice</h1>
            <p style="font-size: 12px; color: ${colors.secondary}; margin: 4px 0 0 0;">#${data.invoiceNumber}</p>
          </div>
        `;

      case "corporate":
        return `
          <div style="border-bottom: 3px solid ${colors.accent}; padding-bottom: 8px; margin-bottom: 16px;">
            <h1 style="font-size: 16px; font-weight: bold; margin: 0; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 1px;">INVOICE</h1>
            <p style="font-size: 12px; color: ${colors.secondary}; margin: 4px 0 0 0;">Invoice #: ${data.invoiceNumber}</p>
          </div>
        `;

      case "creative":
        return `
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: ${colors.primary};">✨ INVOICE ✨</h1>
            <p style="font-size: 12px; color: ${colors.secondary}; margin: 4px 0 0 0;">#${data.invoiceNumber}</p>
          </div>
        `;

      default:
        return `
          <div style="border-bottom: 2px solid #e5e5e5; padding-bottom: 8px; margin-bottom: 16px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: ${colors.primary};">INVOICE</h1>
            <p style="font-size: 12px; color: ${colors.secondary}; margin: 4px 0 0 0;">#${data.invoiceNumber}</p>
          </div>
        `;
    }
  }

  /**
   * Generate company and client information HTML
   */
  private static generateCompanyClientHTML(
    data: InvoiceData,
    colors: any
  ): string {
    return `
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
        <div style="flex: 1;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: ${colors.primary};">${data.companyName}</h3>
          <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0;">${data.companyAddress}</p>
          <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0;">${data.companyEmail}</p>
          <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0;">${data.companyPhone}</p>
        </div>
        <div style="flex: 1; text-align: right;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: ${colors.primary};">Bill To:</h3>
          <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0;">${data.clientName}</p>
          <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0;">${data.clientAddress}</p>
          <p style="font-size: 11px; color: ${colors.secondary}; margin: 2px 0;">${data.clientEmail}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate line items table HTML
   */
  private static generateLineItemsHTML(data: InvoiceData, colors: any): string {
    const lineItemsHTML = data.lineItems
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 8px 4px; font-size: 10px; color: ${
          colors.secondary
        };">${item.description}</td>
        <td style="padding: 8px 4px; font-size: 10px; color: ${
          colors.secondary
        }; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 4px; font-size: 10px; color: ${
          colors.secondary
        }; text-align: right;">$${item.rate.toFixed(2)}</td>
        <td style="padding: 8px 4px; font-size: 10px; color: ${
          colors.secondary
        }; text-align: right;">$${item.amount.toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    return `
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; background: white;">
          <thead style="background: #f8f8f8;">
            <tr>
              <th style="padding: 8px 4px; font-size: 10px; font-weight: bold; color: ${colors.primary}; text-align: left;">Description</th>
              <th style="padding: 8px 4px; font-size: 10px; font-weight: bold; color: ${colors.primary}; text-align: center;">Qty</th>
              <th style="padding: 8px 4px; font-size: 10px; font-weight: bold; color: ${colors.primary}; text-align: right;">Rate</th>
              <th style="padding: 8px 4px; font-size: 10px; font-weight: bold; color: ${colors.primary}; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody style="background: white;">
            ${lineItemsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Generate totals section HTML
   */
  private static generateTotalsHTML(data: InvoiceData, colors: any): string {
    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 200px; border: 1px solid #e0e0e0; padding: 12px; border-radius: 4px; background: white;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; color: ${
              colors.secondary
            };">Subtotal:</span>
            <span style="font-size: 10px; color: ${
              colors.secondary
            };">$${data.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 10px; color: ${colors.secondary};">VAT (${
      data.vatRate
    }%):</span>
            <span style="font-size: 10px; color: ${
              colors.secondary
            };">$${data.vatAmount.toFixed(2)}</span>
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 12px; font-weight: bold; color: ${
                colors.primary
              };">Total:</span>
              <span style="font-size: 12px; font-weight: bold; color: ${
                colors.primary
              };">$${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate footer HTML
   */
  private static generateFooterHTML(
    template: InvoiceTemplate,
    data: InvoiceData,
    colors: any
  ): string {
    const thankYouMessages = {
      classic: "Thank you for your business!",
      modern: "Thank you for choosing us!",
      minimal: "Thank you!",
      corporate: "Thank you for your continued partnership.",
      creative: "✨ Thank you for your creativity! ✨",
    };

    return `
      <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 0 0 20px 0;">
        <div style="margin-bottom: 16px;">
          <p style="font-size: 9px; color: ${
            colors.secondary
          }; margin: 2px 0;">Payment Terms:</p>
          <p style="font-size: 9px; color: ${
            colors.secondary
          }; margin: 2px 0;">Due Date: ${data.dueDate}</p>
          <p style="font-size: 9px; color: ${
            colors.secondary
          }; margin: 2px 0;">Payment methods: Bank Transfer, Credit Card</p>
        </div>
        <div style="text-align: center;">
          <p style="font-size: 10px; color: ${
            colors.primary
          }; font-style: italic; margin: 0;">
            ${
              thankYouMessages[template.id as keyof typeof thankYouMessages] ||
              "Thank you!"
            }
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate a PDF invoice based on template and data (legacy method)
   */
  static generateInvoicePDF(
    template: InvoiceTemplate,
    data: InvoiceData
  ): jsPDF {
    // Create PDF with A4 paper size (210 x 297 mm)
    // A4 dimensions: 210mm width x 297mm height
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 15; // 15mm margins for A4
    const contentWidth = pageWidth - margin * 2; // 180mm content width

    // Set up colors based on template
    const colors = this.getTemplateColors(template.id);

    // Add header
    this.addHeader(doc, template, data, colors, pageWidth, margin);

    // Add company and client info
    this.addCompanyClientInfo(doc, data, colors, pageWidth, margin);

    // Add line items table
    this.addLineItemsTable(doc, data, colors, pageWidth, margin);

    // Add totals
    this.addTotals(doc, data, colors, pageWidth, margin);

    // Add notes and thank you
    this.addNotesAndThankYou(
      doc,
      template,
      data,
      colors,
      pageWidth,
      margin,
      pageHeight
    );

    return doc;
  }

  /**
   * Get template-specific colors
   */
  private static getTemplateColors(templateId: string) {
    switch (templateId) {
      case "classic":
        return {
          primary: "#000000",
          secondary: "#666666",
          accent: "#000000",
          background: "#ffffff",
        };
      case "modern":
        return {
          primary: "#2563eb",
          secondary: "#1e40af",
          accent: "#3b82f6",
          background: "#f8fafc",
        };
      case "minimal":
        return {
          primary: "#374151",
          secondary: "#6b7280",
          accent: "#9ca3af",
          background: "#ffffff",
        };
      case "corporate":
        return {
          primary: "#1f2937",
          secondary: "#4b5563",
          accent: "#6b7280",
          background: "#f9fafb",
        };
      case "creative":
        return {
          primary: "#7c3aed",
          secondary: "#a855f7",
          accent: "#c084fc",
          background: "#faf5ff",
        };
      default:
        return {
          primary: "#000000",
          secondary: "#666666",
          accent: "#000000",
          background: "#ffffff",
        };
    }
  }

  /**
   * Add header section
   */
  private static addHeader(
    doc: jsPDF,
    template: InvoiceTemplate,
    data: InvoiceData,
    colors: any,
    pageWidth: number,
    margin: number
  ) {
    const y = margin + 8;

    // Template-specific header styling (matches preview exactly)
    switch (template.id) {
      case "classic":
        // Header with border (matches preview)
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 8, pageWidth - margin, y + 8);

        doc.setFontSize(20);
        doc.setTextColor(colors.primary);
        doc.text("INVOICE", margin, y + 5);
        doc.setFontSize(10);
        doc.setTextColor(colors.secondary);
        doc.text(`#${data.invoiceNumber}`, margin, y + 12);
        break;

      case "modern":
        // Blue header background (matches preview)
        doc.setFillColor(colors.primary);
        doc.rect(margin, y - 3, pageWidth - margin * 2, 10, "F");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("INVOICE", margin + 3, y + 3);
        doc.setFontSize(10);
        doc.text(`#${data.invoiceNumber}`, margin + 3, y + 9);
        break;

      case "minimal":
        doc.setFontSize(14);
        doc.setTextColor(colors.primary);
        doc.text("Invoice", pageWidth / 2, y + 3, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(colors.secondary);
        doc.text(`#${data.invoiceNumber}`, pageWidth / 2, y + 10, {
          align: "center",
        });
        break;

      case "corporate":
        // Corporate header with double border (matches preview)
        doc.setDrawColor(colors.accent);
        doc.setLineWidth(1);
        doc.line(margin, y + 6, pageWidth - margin, y + 6);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 8, pageWidth - margin, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(colors.primary);
        doc.text("INVOICE", margin, y + 3);
        doc.setFontSize(10);
        doc.setTextColor(colors.secondary);
        doc.text(`Invoice #: ${data.invoiceNumber}`, margin, y + 10);
        break;

      case "creative":
        doc.setFontSize(16);
        doc.setTextColor(colors.primary);
        doc.text("✨ INVOICE ✨", pageWidth / 2, y + 3, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(colors.secondary);
        doc.text(`#${data.invoiceNumber}`, pageWidth / 2, y + 10, {
          align: "center",
        });
        break;
    }
  }

  /**
   * Add company and client information
   */
  private static addCompanyClientInfo(
    doc: jsPDF,
    data: InvoiceData,
    colors: any,
    pageWidth: number,
    margin: number
  ) {
    const y = margin + 30;

    // Company info (left side) - optimized for A4
    doc.setFontSize(11);
    doc.setTextColor(colors.primary);
    doc.text(data.companyName, margin, y);

    doc.setFontSize(9);
    doc.setTextColor(colors.secondary);
    doc.text(data.companyAddress, margin, y + 5);
    doc.text(data.companyEmail, margin, y + 10);
    doc.text(data.companyPhone, margin, y + 15);

    // Client info (right side) - optimized for A4
    const clientX = pageWidth - margin - 70; // Adjusted for A4 width
    doc.setFontSize(11);
    doc.setTextColor(colors.primary);
    doc.text("Bill To:", clientX, y);
    doc.text(data.clientName, clientX, y + 5);

    doc.setFontSize(9);
    doc.setTextColor(colors.secondary);
    doc.text(data.clientAddress, clientX, y + 10);
    doc.text(data.clientEmail, clientX, y + 15);
  }

  /**
   * Add line items table - matches preview layout exactly
   */
  private static addLineItemsTable(
    doc: jsPDF,
    data: InvoiceData,
    colors: any,
    pageWidth: number,
    margin: number
  ) {
    const y = margin + 65;
    const tableWidth = pageWidth - margin * 2;
    const colWidths = [
      tableWidth * 0.4,
      tableWidth * 0.15,
      tableWidth * 0.2,
      tableWidth * 0.25,
    ];

    // Table container with border (matches preview)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 6, tableWidth, 8 + data.lineItems.length * 6 + 4);

    // Table header with background (matches preview)
    doc.setFillColor(240, 240, 240);
    doc.rect(margin + 1, y - 5, tableWidth - 2, 6, "F");

    // Header border line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin + 1, y + 1, margin + tableWidth - 1, y + 1);

    doc.setFontSize(8);
    doc.setTextColor(colors.primary);
    doc.text("Description", margin + 2, y - 1);
    doc.text("Qty", margin + colWidths[0] + 2, y - 1, { align: "center" });
    doc.text("Rate", margin + colWidths[0] + colWidths[1] + 2, y - 1, {
      align: "right",
    });
    doc.text(
      "Amount",
      margin + colWidths[0] + colWidths[1] + colWidths[2] + 2,
      y - 1,
      { align: "right" }
    );

    // Table rows (matches preview grid layout)
    let currentY = y + 3;
    data.lineItems.forEach((item, index) => {
      if (currentY > 200) {
        // A4 page break at 200mm
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(7);
      doc.setTextColor(colors.secondary);
      doc.text(item.description, margin + 2, currentY);
      doc.text(item.quantity.toString(), margin + colWidths[0] + 2, currentY, {
        align: "center",
      });
      doc.text(
        `$${item.rate.toFixed(2)}`,
        margin + colWidths[0] + colWidths[1] + 2,
        currentY,
        { align: "right" }
      );
      doc.text(
        `$${item.amount.toFixed(2)}`,
        margin + colWidths[0] + colWidths[1] + colWidths[2] + 2,
        currentY,
        { align: "right" }
      );

      currentY += 5; // Matches preview spacing
    });
  }

  /**
   * Add totals section - matches preview layout exactly
   */
  private static addTotals(
    doc: jsPDF,
    data: InvoiceData,
    colors: any,
    pageWidth: number,
    margin: number
  ) {
    const totalsX = pageWidth - margin - 70; // Adjusted for A4
    const totalsY = margin + 100; // Adjusted for A4

    // Totals container with border (matches preview)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(totalsX - 5, totalsY - 8, 60, 25);

    doc.setFontSize(8);
    doc.setTextColor(colors.secondary);
    doc.text("Subtotal:", totalsX, totalsY);
    doc.text(`$${data.subtotal.toFixed(2)}`, totalsX + 45, totalsY, {
      align: "right",
    });

    doc.text(`VAT (${data.vatRate}%):`, totalsX, totalsY + 5);
    doc.text(`$${data.vatAmount.toFixed(2)}`, totalsX + 45, totalsY + 5, {
      align: "right",
    });

    // Total line (matches preview border)
    doc.setLineWidth(0.3);
    doc.setDrawColor(180, 180, 180);
    doc.line(totalsX, totalsY + 8, totalsX + 50, totalsY + 8);

    doc.setFontSize(9);
    doc.setTextColor(colors.primary);
    doc.text("Total:", totalsX, totalsY + 12);
    doc.text(`$${data.total.toFixed(2)}`, totalsX + 45, totalsY + 12, {
      align: "right",
    });
  }

  /**
   * Add notes and thank you message
   */
  private static addNotesAndThankYou(
    doc: jsPDF,
    template: InvoiceTemplate,
    data: InvoiceData,
    colors: any,
    pageWidth: number,
    margin: number,
    pageHeight: number
  ) {
    const y = pageHeight - 35; // Adjusted for A4

    // Payment terms - optimized for A4
    doc.setFontSize(8);
    doc.setTextColor(colors.secondary);
    doc.text("Payment Terms:", margin, y);
    doc.text(`Due Date: ${data.dueDate}`, margin, y + 5);
    doc.text("Payment methods: Bank Transfer, Credit Card", margin, y + 10);

    // Thank you message
    const thankYouMessages = {
      classic: "Thank you for your business!",
      modern: "Thank you for choosing us!",
      minimal: "Thank you!",
      corporate: "Thank you for your continued partnership.",
      creative: "✨ Thank you for your creativity! ✨",
    };

    doc.setFontSize(9);
    doc.setTextColor(colors.primary);
    doc.text(
      thankYouMessages[template.id as keyof typeof thankYouMessages] ||
        "Thank you!",
      pageWidth / 2,
      y + 18,
      { align: "center" }
    );
  }

  /**
   * Generate sample invoice data for preview
   */
  static generateSampleData(templateId: string): InvoiceData {
    const baseData = {
      companyName: "Your Company",
      companyAddress: "123 Business Street, City, State 12345",
      companyEmail: "billing@yourcompany.com",
      companyPhone: "+1 (555) 123-4567",
      clientName: "Client Name",
      clientAddress: "456 Client Avenue, City, State 67890",
      clientEmail: "client@example.com",
      invoiceNumber: "INV-001",
      invoiceDate: new Date().toLocaleDateString(),
      dueDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      lineItems: [
        {
          description: "Web Development",
          quantity: 1,
          rate: 1000,
          amount: 1000,
        },
        { description: "Design Services", quantity: 1, rate: 500, amount: 500 },
      ],
      subtotal: 1500,
      vatRate: 20,
      vatAmount: 300,
      total: 1800,
      notes: "Please pay within 30 days of invoice date.",
    };

    // Template-specific adjustments
    switch (templateId) {
      case "modern":
        return {
          ...baseData,
          lineItems: [
            { description: "Consulting", quantity: 2, rate: 750, amount: 1500 },
            {
              description: "Implementation",
              quantity: 1,
              rate: 800,
              amount: 800,
            },
          ],
          subtotal: 2300,
          vatRate: 15,
          vatAmount: 345,
          total: 2645,
        };
      case "minimal":
        return {
          ...baseData,
          lineItems: [
            { description: "Design Work", quantity: 1, rate: 800, amount: 800 },
            {
              description: "Development",
              quantity: 1,
              rate: 1200,
              amount: 1200,
            },
            { description: "Testing", quantity: 1, rate: 300, amount: 300 },
          ],
          subtotal: 2300,
          vatRate: 10,
          vatAmount: 230,
          total: 2530,
        };
      case "corporate":
        return {
          ...baseData,
          companyName: "Your Company Ltd.",
          lineItems: [
            {
              description: "Software License",
              quantity: 5,
              rate: 200,
              amount: 1000,
            },
            {
              description: "Support Package",
              quantity: 1,
              rate: 500,
              amount: 500,
            },
            { description: "Training", quantity: 2, rate: 300, amount: 600 },
          ],
          subtotal: 2100,
          vatRate: 18,
          vatAmount: 378,
          total: 2478,
        };
      case "creative":
        return {
          ...baseData,
          companyName: "Your Creative Studio",
          lineItems: [
            { description: "Logo Design", quantity: 8, rate: 75, amount: 600 },
            {
              description: "Brand Identity",
              quantity: 12,
              rate: 85,
              amount: 1020,
            },
            { description: "Mockups", quantity: 6, rate: 60, amount: 360 },
          ],
          subtotal: 1980,
          vatRate: 12,
          vatAmount: 237.6,
          total: 2217.6,
        };
      default:
        return baseData;
    }
  }

  // DOCX generation has been moved to `TemplateService` (uses `docx` library)
}
