import React from "react";
import { SectionHeader } from "./SectionHeader";

interface FeesSectionProps {
  fees: { note: string; total: string; previous: string; payable: string };
}

const TABLE_STYLE = "w-full border border-[#c7ced6] text-[13px]";
const ROW_ALT = "bg-[#f3f4f6]";

export function FeesSection({ fees }: FeesSectionProps) {
  return (
    <>
      <SectionHeader title="Fees Details" variant="secondary" />
      <table className={TABLE_STYLE}>
        <tbody>
          <tr className={ROW_ALT}>
            <td className="border px-3 py-3 w-[45%]">
              <p className="text-red-600 italic text-[12px]">{fees.note}</p>
            </td>
            <td className="border px-3 py-3">
              Total Fees: <span className="text-[#ff6600]">₹{fees.total}</span>
              <br />
              Previous: ₹{fees.previous}
              <br />
              Payable: <span className="text-[#ff6600]">₹{fees.payable}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
