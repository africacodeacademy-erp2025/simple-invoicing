import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceData } from "@/types/invoice";

export const generatePDF = async (
  invoiceElement: HTMLElement,
  invoiceData: InvoiceData
): Promise<void> => {
  try {
    // Create a temporary container with A4 dimensions for better PDF generation
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "210mm"; // A4 width
    tempContainer.style.minHeight = "297mm"; // A4 height
    tempContainer.style.padding = "5mm"; // Minimal padding
    tempContainer.style.fontFamily = "Arial, sans-serif";
    tempContainer.style.fontSize = "12px";
    tempContainer.style.lineHeight = "1.4";
    tempContainer.style.color = "#333";
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.style.boxSizing = "border-box";
    document.body.appendChild(tempContainer);

    // Clone the invoice element and style it for A4
    const clonedElement = invoiceElement.cloneNode(true) as HTMLElement;

    // Remove any Card styling and make it full width
    clonedElement.style.width = "100%";
    clonedElement.style.maxWidth = "none";
    clonedElement.style.margin = "0";
    clonedElement.style.padding = "0";
    clonedElement.style.boxSizing = "border-box";
    clonedElement.style.backgroundColor = "transparent";
    clonedElement.style.boxShadow = "none";
    clonedElement.style.border = "none";
    clonedElement.style.borderRadius = "0";

    // Update all child elements to use full width and remove constraints
    const allElements = clonedElement.querySelectorAll("*");
    allElements.forEach((element: any) => {
      if (element.style) {
        element.style.maxWidth = "none";
        element.style.width = "100%";
        element.style.boxSizing = "border-box";

        // Remove any card-like styling
        if (element.classList) {
          element.classList.remove(
            "shadow-medium",
            "shadow-soft",
            "bg-card-gradient"
          );
        }
      }
    });

    // Fix logo aspect ratio - find all images and ensure they maintain aspect ratio
    const images = clonedElement.querySelectorAll("img");
    images.forEach((img: any) => {
      img.style.objectFit = "contain";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.width = "auto";
      img.style.maxHeight = "80px"; // Reasonable max height for logos
    });

    // Specifically target tables and make them full width
    const tables = clonedElement.querySelectorAll("table");
    tables.forEach((table: any) => {
      table.style.width = "100%";
      table.style.tableLayout = "fixed";
    });

    // Make all divs and containers full width
    const divs = clonedElement.querySelectorAll("div");
    divs.forEach((div: any) => {
      div.style.maxWidth = "none";
      div.style.width = "100%";
    });

    tempContainer.appendChild(clonedElement);

    // Create canvas from the styled element
    const canvas = await html2canvas(tempContainer, {
      scale: 1, // Reduce scale to potentially smaller PDF size
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // Create PDF with A4 dimensions
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Use full A4 width with minimal margins (5mm on each side)
    const imgWidth = pdfWidth - 10; // 200mm usable width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Handle multiple pages if content is too tall
    let heightLeft = imgHeight;
    let position = -5; // Start with a negative margin to account for the top margin

    // Add first page
    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 10; // 5mm margin top and bottom

    // Add additional pages if needed
    while (heightLeft > 0) {
      position -= pdfHeight - 10; // Move the position up by the height of a page
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 10;
    }

    // Clean up temporary container
    document.body.removeChild(tempContainer);

    // Generate filename
    const filename = `invoice-${
      invoiceData.invoiceNumber || "draft"
    }-${new Date().getTime()}.pdf`;

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

export const generatePDFBuffer = async (
  invoiceElement: HTMLElement
): Promise<Uint8Array> => {
  try {
    // Create a temporary container for accurate rendering
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = "210mm"; // A4 width
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.style.padding = "5mm";
    document.body.appendChild(tempContainer);

    const clonedElement = invoiceElement.cloneNode(true) as HTMLElement;
    clonedElement.style.width = "100%";
    clonedElement.style.maxWidth = "none";
    clonedElement.style.boxShadow = "none";
    clonedElement.style.border = "none";
    tempContainer.appendChild(clonedElement);

    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 10; // 5mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = -5; // Initial negative position

    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 10;

    while (heightLeft > 0) {
      position -= pdfHeight - 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 10;
    }

    document.body.removeChild(tempContainer);

    const arrayBuffer = pdf.output("arraybuffer");
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error("Error generating PDF buffer:", error);
    throw new Error("Failed to generate PDF buffer.");
  }
};
