import { ErrorService } from "./error.service";
import { PDFGeneratorService, InvoiceData } from "./pdfGenerator.service";

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  features: string[];
  downloadFormats: DownloadFormat[];
  isPopular?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
}

export interface DownloadFormat {
  type: "pdf" | "word" | "excel";
  label: string;
  description: string;
  icon: string;
}

export interface TemplateServiceResponse {
  success: boolean;
  data?: InvoiceTemplate | InvoiceTemplate[];
  message: string;
  error?: string;
}

export class TemplateService {
  /**
   * Get all available invoice templates
   */
  static async getTemplates(): Promise<TemplateServiceResponse> {
    try {
      // In a real application, this would fetch from an API
      // For now, we'll return mock data
      const templates: InvoiceTemplate[] = [
        { id: "minimal", name: "Minimal Invoice", description: "A clean, uncluttered design focusing on essential information.", category: "Minimalist", previewImage: "/api/placeholder/400/300", features: ["Ultra-clean design","Essential information only","Easy to read","Quick to customize","Mobile-optimized"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready format", icon: "📄" }, { type: "word", label: "Word", description: "Editable document", icon: "📝" }, { type: "excel", label: "Excel", description: "With formulas", icon: "📊" }] },
        { id: "classic", name: "Classic Invoice", description: "A traditional, professional invoice template perfect for established businesses.", category: "Professional", previewImage: "/api/placeholder/400/300", features: ["Clean, professional layout","Company logo placement","Itemized billing section","Tax calculations","Payment terms section"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready format", icon: "📄" }, { type: "word", label: "Word", description: "Editable document", icon: "📝" }, { type: "excel", label: "Excel", description: "With formulas", icon: "📊" }], isPopular: true },
        { id: "modern", name: "Modern Invoice", description: "A sleek, contemporary design with modern typography and clean lines.", category: "Contemporary", previewImage: "/api/placeholder/400/300", features: ["Modern typography","Color-coded sections","Responsive design","Digital-friendly layout","Social media integration"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready format", icon: "📄" }, { type: "word", label: "Word", description: "Editable document", icon: "📝" }, { type: "excel", label: "Excel", description: "With formulas", icon: "📊" }], isNew: true },
        { id: "corporate", name: "Corporate Invoice", description: "A formal, business-focused template for large corporations.", category: "Corporate", previewImage: "/api/placeholder/400/300", features: ["Formal business layout","Multiple currency support","Detailed terms & conditions","Signature sections","Compliance-ready"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready format", icon: "📄" }, { type: "word", label: "Word", description: "Editable document", icon: "📝" }, { type: "excel", label: "Excel", description: "With formulas", icon: "📊" }], isPopular: true },
        { id: "creative", name: "Creative Invoice", description: "An artistic, unique design perfect for creative professionals.", category: "Creative", previewImage: "/api/placeholder/400/300", features: ["Artistic design elements","Custom color schemes","Creative typography","Visual hierarchy","Brand personality"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready format", icon: "📄" }, { type: "word", label: "Word", description: "Editable document", icon: "📝" }, { type: "excel", label: "Excel", description: "With formulas", icon: "📊" }] },
        { id: "xero", name: "Xero Invoice", description: "Xero-styled invoice layout.", category: "Accounting", previewImage: "/api/placeholder/400/300", features: ["Xero style","Accounting-friendly"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" } ] },
        { id: "billed_app", name: "Billed App", description: "Designed for billing apps and SaaS.", category: "SaaS", previewImage: "/api/placeholder/400/300", features: ["SaaS friendly","Responsive"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "standard", name: "Standard Invoice", description: "A balanced, standard invoice template.", category: "Standard", previewImage: "/api/placeholder/400/300", features: ["Balanced layout","Easy to read"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "creative_geometric", name: "Creative Geometric", description: "Geometric shapes and modern layout.", category: "Creative", previewImage: "/api/placeholder/400/300", features: ["Geometric design","Bold colors"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "vibrant", name: "Vibrant Invoice", description: "Colorful and vibrant layout.", category: "Creative", previewImage: "/api/placeholder/400/300", features: ["Colorful","Eye-catching"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "zoho", name: "Zoho Branded", description: "Zoho-like branded template.", category: "Branded", previewImage: "/api/placeholder/400/300", features: ["Zoho-style"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "quickbooks", name: "QuickBooks", description: "QuickBooks-styled invoice template.", category: "Accounting", previewImage: "/api/placeholder/400/300", features: ["QuickBooks style"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "invoicehome_creative", name: "InvoiceHome Creative", description: "InvoiceHome-inspired creative template.", category: "Creative", previewImage: "/api/placeholder/400/300", features: ["InvoiceHome style"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "tasmimak_designer", name: "Tasmimak Designer", description: "Designer-focused template by Tasmimak.", category: "Design", previewImage: "/api/placeholder/400/300", features: ["Designer layout"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
        { id: "zistemo_professional", name: "Zistemo Professional", description: "Professional template inspired by Zistemo.", category: "Professional", previewImage: "/api/placeholder/400/300", features: ["Professional layout"], downloadFormats: [{ type: "pdf", label: "PDF", description: "Print-ready", icon: "📄" }, { type: "word", label: "Word", description: "Editable", icon: "📝" }] },
      ];

      return {
        success: true,
        data: templates,
        message: "Templates fetched successfully",
      };
    } catch (error) {
      ErrorService.logError("TemplateService.getTemplates", error);
      return {
        success: false,
        message: "An unexpected error occurred while fetching templates",
        error: ErrorService.getErrorMessage(error),
      };
    }
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(
    templateId: string
  ): Promise<TemplateServiceResponse> {
    try {
      const response = await this.getTemplates();
      if (!response.success) {
        return response;
      }

      const templates = response.data as InvoiceTemplate[];
      const template = templates.find((t) => t.id === templateId);

      if (!template) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      return {
        success: true,
        data: template,
        message: "Template fetched successfully",
      };
    } catch (error) {
      ErrorService.logError("TemplateService.getTemplate", error);
      return {
        success: false,
        message: "An unexpected error occurred while fetching template",
        error: ErrorService.getErrorMessage(error),
      };
    }
  }

  /**
   * Download template in specified format
   */
  static async downloadTemplate(
    templateId: string,
    format: "pdf" | "word" | "excel"
  ): Promise<TemplateServiceResponse> {
    try {
      // In a real application, this would generate and return the actual file
      // For now, we'll simulate the download
      const template = await this.getTemplate(templateId);
      if (!template.success || !template.data) {
        return template;
      }

      // Simulate file generation and download
      const templateData = template.data as InvoiceTemplate;
      const fileName = `${templateData.name.replace(/\s+/g, "_")}_Template.${
        format === "word" ? "docx" : format === "excel" ? "xlsx" : "pdf"
      }`;

      if (format === "pdf") {
        try {
          // Generate real PDF using HTML-to-PDF conversion (matches preview exactly)
          const sampleData = PDFGeneratorService.generateSampleData(templateId);
          const pdf = await PDFGeneratorService.generateInvoicePDFFromHTML(
            templateData,
            sampleData
          );

          // Download the PDF
          pdf.save(fileName);
        } catch (error) {
          console.warn(
            "HTML-to-PDF conversion failed, falling back to jsPDF:",
            error
          );
          // Fallback to original jsPDF method
          const sampleData = PDFGeneratorService.generateSampleData(templateId);
          const pdf = PDFGeneratorService.generateInvoicePDF(
            templateData,
            sampleData
          );
          pdf.save(fileName);
        }
      } else {
        if (format === "word") {
          try {
            // Use docx library to generate a valid DOCX file
            const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType } = await import("docx");
            const sampleData: InvoiceData = PDFGeneratorService.generateSampleData(templateId);

            // Build the DOCX document
            const doc = new Document({
              sections: [
                {
                  properties: {},
                  children: [
                    new Paragraph({
                      text: "INVOICE",
                      heading: "Heading1",
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ text: `Invoice #: ${sampleData.invoiceNumber}` }),
                    new Paragraph({ text: `Date: ${sampleData.invoiceDate}` }),
                    new Paragraph({ text: `Due Date: ${sampleData.dueDate}` }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: `From: ${sampleData.companyName}` }),
                    new Paragraph({ text: sampleData.companyAddress }),
                    new Paragraph({ text: sampleData.companyEmail }),
                    new Paragraph({ text: sampleData.companyPhone }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: `To: ${sampleData.clientName}` }),
                    new Paragraph({ text: sampleData.clientAddress }),
                    new Paragraph({ text: sampleData.clientEmail }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "Line Items:" }),
                    new Table({
                      rows: [
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph("Description")]}),
                            new TableCell({ children: [new Paragraph("Qty")]}),
                            new TableCell({ children: [new Paragraph("Rate")]}),
                            new TableCell({ children: [new Paragraph("Amount")]}),
                          ],
                        }),
                        ...sampleData.lineItems.map(item => new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph(item.description)] }),
                            new TableCell({ children: [new Paragraph(item.quantity.toString())] }),
                            new TableCell({ children: [new Paragraph(item.rate.toFixed(2))] }),
                            new TableCell({ children: [new Paragraph(item.amount.toFixed(2))] }),
                          ],
                        })),
                      ],
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: `Subtotal: $${sampleData.subtotal.toFixed(2)}` }),
                    new Paragraph({ text: `VAT (${sampleData.vatRate}%): $${sampleData.vatAmount.toFixed(2)}` }),
                    new Paragraph({ text: `Total: $${sampleData.total.toFixed(2)}` }),
                    new Paragraph({ text: "" }),
                    sampleData.notes ? new Paragraph({ text: `Notes: ${sampleData.notes}` }) : new Paragraph({ text: "" }),
                  ],
                },
              ],
            });

            // Generate the DOCX file as a Blob and ensure correct MIME type
            const rawBlob = await Packer.toBlob(doc);
            let docxBuffer: Blob = rawBlob as Blob;
            const expectedType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if (!docxBuffer.type || docxBuffer.type !== expectedType) {
              const ab = await docxBuffer.arrayBuffer();
              docxBuffer = new Blob([ab], { type: expectedType });
            }
            const url = window.URL.createObjectURL(docxBuffer);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.warn("DOCX generation failed, falling back to placeholder:", error);
            const mockContent = `This is a placeholder WORD file for ${templateData.name}. DOCX generation failed in the browser.`;
            const blob = new Blob([mockContent], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }
        } else {
          // Excel placeholder for now
          const mockContent = `This is a placeholder EXCEL file for ${templateData.name}.`;
          const blob = new Blob([mockContent], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      }

      return {
        success: true,
        message: `${
          templateData.name
        } template downloaded successfully as ${format.toUpperCase()}${
          format === "pdf" ? " (real template)" : " (placeholder)"
        }`,
      };
    } catch (error) {
      ErrorService.logError("TemplateService.downloadTemplate", error);
      return {
        success: false,
        message: "An unexpected error occurred while downloading template",
        error: ErrorService.getErrorMessage(error),
      };
    }
  }
}
