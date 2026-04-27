import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ExportPdfButton = ({ targetId, fileName = "business-analysis-report" }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const target = document.getElementById(targetId);
      if (!target) {
        alert("Export target not found.");
        return;
      }

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 5;

      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 10;
      }

      const date = new Date().toISOString().split("T")[0];
      pdf.save(`${fileName}-${date}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      style={{
        marginTop: "18px",
        padding: "12px 18px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        cursor: isExporting ? "not-allowed" : "pointer",
        fontWeight: 600,
      }}
    >
      {isExporting ? "Exporting PDF..." : "📄 Export to PDF"}
    </button>
  );
};

export default ExportPdfButton;