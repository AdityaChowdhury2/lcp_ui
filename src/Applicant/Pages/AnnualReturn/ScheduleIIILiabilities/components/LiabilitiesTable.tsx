import React from "react";
import { LIABILITY_ROWS, inputClass } from "../constants/liabilities.constants";
import { LiabilityState } from "../types/liabilities.types";

interface LiabilitiesTableProps {
  liabilities: LiabilityState;
  setLiabilities: React.Dispatch<React.SetStateAction<LiabilityState>>;
  remarkLocked: boolean;
  onOpenModal: (fieldId: number) => void;
}

export const LiabilitiesTable: React.FC<LiabilitiesTableProps> = ({
  liabilities,
  setLiabilities,
  remarkLocked,
  onOpenModal,
}) => {
  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <div className="border border-[#dcdcdc]">
      <div className="grid grid-cols-[40%_20%_40%] bg-[#2c6da4] text-white text-[13px] font-semibold">
        <div className="p-2 border-r border-[#3b7cb5]">Details Of Liabilities</div>
        <div className="p-2 border-r border-[#3b7cb5]"></div>
        <div className="p-2">Rupees</div>
      </div>

      {/* General Fund */}
      <div className="grid grid-cols-[40%_20%_40%] border-t border-[#dcdcdc] items-center">
        <div className="p-2 text-[13px] border-r border-[#dcdcdc]">
          Amount of General Fund <span className="text-red-600">*</span>
        </div>
        <div className="border-r border-[#dcdcdc] h-full"></div>
        <div className="p-2">
          <input
            type="number"
            min="0"
            onKeyDown={preventNegative}
            onWheel={(e) => e.currentTarget.blur()}
            className={inputClass}
            value={liabilities.generalFund ?? ""}
            disabled={remarkLocked}
            onChange={(e) => {
              const rawVal = e.target.value;
              const val = rawVal === "" ? "" : Math.max(0, Number(rawVal));
              setLiabilities((prev) => {
                const gf = Number(val || 0);
                const pf = Number(prev.politicalFund || 0);
                const lf = Number(prev.loanFrom || 0);
                const dd = Number(prev.debtsDue || 0);
                const ol = Number(prev.otherLiabilities || 0);
                return {
                  ...prev,
                  generalFund: val,
                  total: gf + pf + lf + dd + ol,
                };
              });
            }}
          />
        </div>
      </div>

      {/* Political Fund */}
      <div className="grid grid-cols-[40%_20%_40%] border-t border-[#dcdcdc] items-center">
        <div className="p-2 text-[13px] border-r border-[#dcdcdc]">
          Amount of Political Fund <span className="text-red-600">*</span>
        </div>
        <div className="border-r border-[#dcdcdc] h-full"></div>
        <div className="p-2">
          <input
            type="number"
            min="0"
            onKeyDown={preventNegative}
            onWheel={(e) => e.currentTarget.blur()}
            className={inputClass}
            value={liabilities.politicalFund ?? ""}
            disabled={remarkLocked}
            onChange={(e) => {
              const rawVal = e.target.value;
              const val = rawVal === "" ? "" : Math.max(0, Number(rawVal));
              setLiabilities((prev) => {
                const gf = Number(prev.generalFund || 0);
                const pf = Number(val || 0);
                const lf = Number(prev.loanFrom || 0);
                const dd = Number(prev.debtsDue || 0);
                const ol = Number(prev.otherLiabilities || 0);
                return {
                  ...prev,
                  politicalFund: val,
                  total: gf + pf + lf + dd + ol,
                };
              });
            }}
          />
        </div>
      </div>

      {/* Dynamic Liability Rows */}
      {LIABILITY_ROWS.map((row) => (
        <div key={row.fieldId} className="grid grid-cols-[40%_20%_40%] border-t border-[#dcdcdc] items-center">
          <div className="p-2 text-[13px] border-r border-[#dcdcdc]">
            {row.label} <span className="text-red-600">*</span>
          </div>
          <div className="p-2 border-r border-[#dcdcdc] flex items-center">
            <button
              type="button"
              disabled={remarkLocked}
              className="bg-[#337ab7] text-white text-[12px] px-3 py-[4px] rounded hover:bg-[#286090] transition disabled:opacity-50 font-medium"
              onClick={() => onOpenModal(row.fieldId)}
            >
              Add Description
            </button>
          </div>
          <div className="p-2">
            <input
              readOnly
              value={(liabilities as any)[row.key] ?? 0}
              className={`${inputClass} bg-[#f3f3f3]`}
            />
          </div>
        </div>
      ))}

      {/* Total Liabilities */}
      <div className="grid grid-cols-[60%_40%] border-t border-[#dcdcdc] bg-[#f9f9f9] items-center">
        <div className="p-2 font-semibold text-[13px] border-r border-[#dcdcdc]">
          Total Liabilities
        </div>
        <div className="p-2">
          <input
            readOnly
            value={liabilities.total}
            className={`${inputClass} bg-[#f3f3f3] font-semibold text-[#2c6da4]`}
          />
        </div>
      </div>
    </div>
  );
};
