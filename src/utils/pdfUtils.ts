// export const openBase64PdfInNewTab = (base64Pdf: string): void => {
//   // 1. Remove data URI prefix if present
//   let cleanedBase64 = base64Pdf.includes(",")
//     ? base64Pdf.split(",")[1]
//     : base64Pdf;

//   // 2. Remove all whitespace & line breaks (🔥 REQUIRED)
//   cleanedBase64 = cleanedBase64.replace(/\s/g, "");

//   // 3. Decode
//   const byteCharacters = atob(cleanedBase64);
//   const byteNumbers = new Uint8Array(byteCharacters.length);

//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i);
//   }

//   // 4. Create PDF blob
//   const blob = new Blob([byteNumbers], { type: "application/pdf" });
//   const url = URL.createObjectURL(blob);

//   window.open(url, "_blank");

//   // Optional cleanup
//   setTimeout(() => URL.revokeObjectURL(url), 5000);
// };

export const openBase64PdfInNewTab = (pdfBlob: Blob): void => {
  const url = URL.createObjectURL(
    new Blob([pdfBlob], { type: "application/pdf" })
  );

  window.open(url, "_blank");

  // cleanup
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

