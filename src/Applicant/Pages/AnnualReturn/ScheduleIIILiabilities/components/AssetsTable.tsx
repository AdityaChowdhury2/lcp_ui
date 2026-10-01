import React from "react";
import { ASSET_ROWS, inputClass } from "../constants/liabilities.constants";
import { AssetState } from "../types/liabilities.types";

interface AssetsTableProps {
  assets: AssetState;
  remarkLocked: boolean;
  onOpenModal: (fieldId: number) => void;
}

export const AssetsTable: React.FC<AssetsTableProps> = ({
  assets,
  remarkLocked,
  onOpenModal,
}) => {
  return (
    <div className="border border-[#dcdcdc]">
      <div className="grid grid-cols-[40%_20%_40%] bg-[#2c6da4] text-white text-[13px] font-semibold">
        <div className="p-2 border-r border-[#3b7cb5]">Details Of Assets</div>
        <div className="p-2 border-r border-[#3b7cb5]"></div>
        <div className="p-2">Rupees</div>
      </div>

      {/* Dynamic Asset Rows */}
      {ASSET_ROWS.map((row) => (
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
              value={(assets as any)[row.key] ?? 0}
              className={`${inputClass} bg-[#f3f3f3]`}
            />
          </div>
        </div>
      ))}

      {/* Total Assets */}
      <div className="grid grid-cols-[60%_40%] border-t border-[#dcdcdc] bg-[#f9f9f9] items-center">
        <div className="p-2 font-semibold text-[13px] border-r border-[#dcdcdc]">
          Total Assets
        </div>
        <div className="p-2">
          <input
            readOnly
            value={assets.total}
            className={`${inputClass} bg-[#f3f3f3] font-semibold text-[#2c6da4]`}
          />
        </div>
      </div>
    </div>
  );
};
