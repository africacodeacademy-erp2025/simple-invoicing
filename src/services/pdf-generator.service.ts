import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { RefObject } from "react";
import { InvoiceData } from "@/types/invoice";

export class PdfGenerationService {
  /**
   * Generate a PDF from a React component
   * @param componentRef - A ref to the component to be converted to PDF
   * @param invoice - The invoice data
   */
  static async generatePdfFromComponent(
    componentRef: RefObject<HTMLDivElement>,
    invoice: InvoiceData
  ): Promise<Blob | null> {
    if (!componentRef.current) {
      console.error("Component ref is not available.");
      return null;
    }

    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  }
}
