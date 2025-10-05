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
        {
          id: "classic",
          name: "Classic Invoice",
          description:
            "A traditional, professional invoice template perfect for established businesses.",
          category: "Professional",
          previewImage: "/api/placeholder/400/300",
          features: [
            "Clean, professional layout",
            "Company logo placement",
            "Itemized billing section",
            "Tax calculations",
            "Payment terms section",
          ],
          downloadFormats: [
            {
              type: "pdf",
              label: "PDF",
              description: "Print-ready format",
              icon: "📄",
            },
            {
              type: "word",
              label: "Word",
              description: "Editable document",
              icon: "📝",
            },
            {
              type: "excel",
              label: "Excel",
              description: "With formulas",
              icon: "📊",
            },
          ],
          isPopular: true,
        },
        {
          id: "modern",
          name: "Modern Invoice",
          description:
            "A sleek, contemporary design with modern typography and clean lines.",
          category: "Contemporary",
          previewImage: "/api/placeholder/400/300",
          features: [
            "Modern typography",
            "Color-coded sections",
            "Responsive design",
            "Digital-friendly layout",
            "Social media integration",
          ],
          downloadFormats: [
            {
              type: "pdf",
              label: "PDF",
              description: "Print-ready format",
              icon: "📄",
            },
            {
              type: "word",
              label: "Word",
              description: "Editable document",
              icon: "📝",
            },
            {
              type: "excel",
              label: "Excel",
              description: "With formulas",
              icon: "📊",
            },
          ],
          isNew: true,
        },
        {
          id: "minimal",
          name: "Minimal Invoice",
          description:
            "A clean, uncluttered design focusing on essential information.",
          category: "Minimalist",
          previewImage: "/api/placeholder/400/300",
          features: [
            "Ultra-clean design",
            "Essential information only",
            "Easy to read",
            "Quick to customize",
            "Mobile-optimized",
          ],
          downloadFormats: [
            {
              type: "pdf",
              label: "PDF",
              description: "Print-ready format",
              icon: "📄",
            },
            {
              type: "word",
              label: "Word",
              description: "Editable document",
              icon: "📝",
            },
            {
              type: "excel",
              label: "Excel",
              description: "With formulas",
              icon: "📊",
            },
          ],
        },
        {
          id: "corporate",
          name: "Corporate Invoice",
          description:
            "A formal, business-focused template for large corporations.",
          category: "Corporate",
          previewImage: "/api/placeholder/400/300",
          features: [
            "Formal business layout",
            "Multiple currency support",
            "Detailed terms & conditions",
            "Signature sections",
            "Compliance-ready",
          ],
          downloadFormats: [
            {
              type: "pdf",
              label: "PDF",
              description: "Print-ready format",
              icon: "📄",
            },
            {
              type: "word",
              label: "Word",
              description: "Editable document",
              icon: "📝",
            },
            {
              type: "excel",
              label: "Excel",
              description: "With formulas",
              icon: "📊",
            },
          ],
          isPopular: true,
          isPremium: true,
        },
        {
          id: "creative",
          name: "Creative Invoice",
          description:
            "An artistic, unique design perfect for creative professionals.",
          category: "Creative",
          previewImage: "/api/placeholder/400/300",
          features: [
            "Artistic design elements",
            "Custom color schemes",
            "Creative typography",
            "Visual hierarchy",
            "Brand personality",
          ],
          downloadFormats: [
            {
              type: "pdf",
              label: "PDF",
              description: "Print-ready format",
              icon: "📄",
            },
            {
              type: "word",
              label: "Word",
              description: "Editable document",
              icon: "📝",
            },
            {
              type: "excel",
              label: "Excel",
              description: "With formulas",
              icon: "📊",
            },
          ],
          isPremium: true,
        },
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
        // For Word and Excel, create placeholder files for now
        // TODO: Implement real Word/Excel generation
        const mockContent = `This is a placeholder ${format.toUpperCase()} file for ${
          templateData.name
        }. PDF generation is fully functional, but Word and Excel generation will be implemented in a future update.`;

        const blob = new Blob([mockContent], {
          type:
            format === "word"
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
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
