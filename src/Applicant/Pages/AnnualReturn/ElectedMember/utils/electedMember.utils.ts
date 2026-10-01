export const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr === "1970-01-01") return "";
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  if (cleanDate.includes("-")) {
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[2].length === 4) {
        return cleanDate;
      }
    }
  }
  return cleanDate;
};
