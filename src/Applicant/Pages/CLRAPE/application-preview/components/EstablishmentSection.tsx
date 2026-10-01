import React from "react";
import type { PreviewTableRow } from "../previewApi";
import { SectionHeader } from "./SectionHeader";
import { PreviewTable } from "./PreviewTable";

interface EstablishmentSectionProps {
  leftRows: PreviewTableRow[];
  rightRows: PreviewTableRow[];
  authorizedOffice: string;
}

export function EstablishmentSection({
  leftRows,
  rightRows,
  authorizedOffice,
}: EstablishmentSectionProps) {
  return (
    <>
      <SectionHeader title="ESTABLISHMENT DETAILS" />
      <div className="text-[14px]">
        <strong>Authorized Registering office :</strong> {authorizedOffice}
        <button
          type="button"
          className="ml-2 bg-[#1794e7] text-white text-xs px-2 py-1 rounded"
        >
          MORE INFO.
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <PreviewTable rows={leftRows} />
        <PreviewTable rows={rightRows} />
      </div>
    </>
  );
}
