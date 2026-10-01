import React from "react";
import { SectionHeader } from "./SectionHeader";

interface TradeUnionSectionProps {
  tradeUnions: Array<{ regNumber: string; name: string; address: string }>;
}

export function TradeUnionSection({ tradeUnions }: TradeUnionSectionProps) {
  return (
    <>
      <SectionHeader title="TRADE UNION DETAILS" />
      {tradeUnions.length === 0 ? (
        <div className="border bg-white text-center py-4 font-semibold text-[13px]">
          No Trade Union Added
        </div>
      ) : (
        <div className="border bg-white">
          {tradeUnions.map((tu, i) => (
            <div key={i} className="border-b border-[#c7ced6] p-3 text-[13px]">
              <div><strong>Reg. No:</strong> {tu.regNumber}</div>
              <div><strong>Name:</strong> {tu.name}</div>
              <div><strong>Address:</strong> {tu.address}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
