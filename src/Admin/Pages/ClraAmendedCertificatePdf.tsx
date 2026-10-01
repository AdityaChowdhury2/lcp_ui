import { useRef } from "react";
import { ClraAmendedCertificate } from "../../Components/ClraAmendedCertificate";
import { ClraAnnexureI } from "./ClraAnnexureI";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf'


export const ClraAmendedCertificatePdf = () => {
  //   const certificateData = {...};
  const contractors = [
    {
      id: 1,
      slNo: 1,
      name: "M/S ABC ENGINEERING WORKS",
      address:
        "12, Industrial Estate, Sector-II, Salt Lake, Kolkata – 700091, PS-Bidhannagar",
      natureOfWork: "Electrical Installation & Maintenance",
      maxLabour: 25,
      fromDate: "01-04-2024",
      toDate: "31-03-2025",
      isNewlyAdded: false, // no red *
    },
    {
      id: 2,
      slNo: 2,
      name: "M/S SARKAR CONSTRUCTION",
      address:
        "Village-Chandipur, Block-Mahisadal, Dist-Purba Medinipur – 721628",
      natureOfWork: "Civil Construction Work",
      maxLabour: 40,
      fromDate: "15-05-2024",
      toDate: "14-05-2025",
      isNewlyAdded: true, // show red *
    },
    {
      id: 3,
      slNo: 3,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 4,
      slNo: 4,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 5,
      slNo: 5,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },

    {
      id: 6,
      slNo: 6,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 7,
      slNo: 7,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 8,
      slNo: 8,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 9,
      slNo: 9,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 10,
      slNo: 10,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
    {
      id: 11,
      slNo: 11,
      name: "M/S ROY ENTERPRISE",
      address:
        "Ward-12, Municipal Market Road, Asansol – 713301, PS-Asansol North",
      natureOfWork: "Housekeeping & Sanitation",
      maxLabour: 18,
      fromDate: "01-06-2024",
      toDate: "31-05-2025",
      isNewlyAdded: false,
    },
  ];

  const pdfRef = useRef<HTMLDivElement>(null);

  const waitForImages = async (container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          img.complete ||
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          })
      )
    );
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;

    await waitForImages(pdfRef.current);

    const pdf = new jsPDF("p", "mm", "a4");

    const pages = pdfRef.current.querySelectorAll("[data-pdf-page]");

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false, // 🔥 IMPORTANT
        ignoreElements: (el) => {
          const style = window.getComputedStyle(el);
          return style.color.includes("oklch");
        },
      });

      const imgData = canvas.toDataURL("image/png");

      if (i !== 0) pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        210,
        297 // exact A4 height in mm
      );
    }

    pdf.save("CLRA-AMEND-THT10-CLR-00047.pdf");
  };


  return (
    <>
      <button
        onClick={handleDownloadPdf}
        className="mb-4 px-4 py-2 bg-blue-600 text-white"
      >
        Download PDF
      </button>


      <div ref={pdfRef} className="pdf-safe">
        <div data-pdf-page style={{ pageBreakAfter: "always" }}>
          <ClraAmendedCertificate
            registrationNo="THT10/CLR/00047"
            registrationDate="5th Dec, 2019"
            officeName="Office of the Assistant Labour Commissioner"
            // officeExtra=""
            officeAddress="Tehatta, Nadia"
            establishmentDetails="ABC Construction, Tehatta, Nadia – 741160"
            natureOfWork="Civil Works, Construction & Maintenance"
            contractorDetails="Annexure I Attached"
            contractorNatureOfWork="Annexure I Attached"
            maxContractLabour={120}
            qrUrl="/api/qr?ref=123"

          />
        </div>
        <ClraAnnexureI contractors={contractors} />
      </div>
    </>
  );
};
