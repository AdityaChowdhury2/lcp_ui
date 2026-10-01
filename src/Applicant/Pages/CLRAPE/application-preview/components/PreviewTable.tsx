import React from "react";
import type { PreviewTableRow } from "../previewApi";

interface PreviewTableProps {
  rows: PreviewTableRow[];
  stickyHeader?: boolean;
}

const TABLE_STYLE = "w-full border border-[#c7ced6] text-[13px]";
const CELL_STYLE = "border border-[#c7ced6] px-3 py-2";
const HEADER_BG = "bg-[#7c8a96] text-white";
const ROW_ALT = "bg-[#f3f4f6]";
const ROW_BASE = "bg-white";

export function PreviewTable({ rows, stickyHeader = false }: PreviewTableProps) {
  return (
    <table className={TABLE_STYLE}>
      <thead className={stickyHeader ? "sticky top-0 z-10" : undefined}>
        <tr className={HEADER_BG}>
          <th className={`${CELL_STYLE} text-left w-[45%]`}>Parameters</th>
          <th className={`${CELL_STYLE} text-left`}>Inputs</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`${row.label}-${i}`} className={i % 2 === 0 ? ROW_ALT : ROW_BASE}>
            <td className={`${CELL_STYLE} align-top`}>{row.label}</td>
            <td className={`${CELL_STYLE} font-semibold align-top`}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
