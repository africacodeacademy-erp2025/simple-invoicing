import { InvoiceTemplate } from "@/types/templates";

// Simulate an API call to a backend that would generate and return a file.
const simulateApiCall = (url: string, fileName: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      resolve({ success: true });
    }, 500);
  });
};

export class TemplateService {
  /**
   * Downloads a template file in the specified format.
   * @param templateId The ID of the template to download.
   * @param format The desired file format ('word' or 'excel').
   * @returns A promise that resolves when the download is initiated.
   */
  static async downloadTemplate(
    templateId: string,
    format: "word" | "excel"
  ): Promise<{ success: boolean; message?: string }> {
    const isPremium = [
      InvoiceTemplate.MINIMAL,
      InvoiceTemplate.CORPORATE,
      InvoiceTemplate.CREATIVE,
    ].includes(templateId as InvoiceTemplate);

    if (isPremium) {
      return {
        success: false,
        message: "Premium templates cannot be downloaded in this format.",
      };
    }

    try {
      const fileName = `${templateId}-template.${format === "word" ? "docx" : "xlsx"}`;
      // In a real application, this URL would point to a server-side endpoint
      // that generates the file. For this example, we use placeholder files.
      const fileUrl = `/placeholders/${fileName}`;
      
      await simulateApiCall(fileUrl, fileName);
      
      return { success: true };

    } catch (error) {
      console.error(`Error downloading ${format} template:`, error);
      return {
        success: false,
        message: `Failed to download ${format.toUpperCase()} template. Please try again.`,
      };
    }
  }
}
