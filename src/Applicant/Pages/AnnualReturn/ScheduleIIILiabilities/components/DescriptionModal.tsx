import React from "react";
import { FaSpinner } from "react-icons/fa";
import { FieldConfig, ModalRow } from "../types/liabilities.types";
import { inputClass, labelClass } from "../constants/liabilities.constants";

interface DescriptionModalProps {
  activeModalConfig: FieldConfig | null;
  onClose: () => void;
  modalError: string;
  desc: string;
  setDesc: (val: string) => void;
  amt: string;
  setAmt: (val: string) => void;
  isSavingModal: boolean;
  onSaveModalRow: () => Promise<void>;
  loadingModal: boolean;
  modalRows: ModalRow[];
  deletingModalId: number | null;
  onDeleteModalRow: (id: number) => Promise<void>;
}

export const DescriptionModal: React.FC<DescriptionModalProps> = ({
  activeModalConfig,
  onClose,
  modalError,
  desc,
  setDesc,
  amt,
  setAmt,
  isSavingModal,
  onSaveModalRow,
  loadingModal,
  modalRows,
  deletingModalId,
  onDeleteModalRow,
}) => {
  if (!activeModalConfig) return null;

  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[540px] rounded shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#3c8dbc] text-white px-4 py-2.5 text-sm font-semibold flex justify-between items-center">
          <span>{activeModalConfig.label}</span>
          <button
            className="hover:opacity-80 text-lg leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {modalError && (
            <p className="text-red-600 text-xs font-semibold">{modalError}</p>
          )}

          <div>
            <label className={`${labelClass} block mb-1`}>
              Description <span className="text-red-600">*</span>
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={inputClass}
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className={`${labelClass} block mb-1`}>
              Amount <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              onKeyDown={preventNegative}
              onWheel={(e) => e.currentTarget.blur()}
              value={amt}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw.includes("-")) return;
                setAmt(raw);
              }}
              className={inputClass}
              placeholder="Enter amount"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              className="border border-[#ccc] px-4 py-1 text-xs rounded hover:bg-gray-100 text-gray-700"
              onClick={onClose}
            >
              Close
            </button>
            <button
              disabled={isSavingModal}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-4 py-1 text-xs rounded font-medium disabled:opacity-50 flex items-center gap-1.5"
              onClick={onSaveModalRow}
            >
              {isSavingModal && <FaSpinner className="w-3 h-3 animate-spin" />}
              Save
            </button>
          </div>

          {/* Table of items */}
          <div className="mt-3 border border-[#dcdcdc] rounded overflow-hidden max-h-[220px] overflow-y-auto">
            {loadingModal ? (
              <div className="p-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <FaSpinner className="w-3.5 h-3.5 animate-spin text-[#2c5f8a]" />
                <span>Loading descriptions...</span>
              </div>
            ) : (
              <table className="w-full text-[12px]">
                <thead className="bg-[#e6e6e6] sticky top-0">
                  <tr>
                    <th className="border p-1.5 text-center w-12">#</th>
                    <th className="border p-1.5 text-left">Description</th>
                    <th className="border p-1.5 text-right w-24">Amount</th>
                    <th className="border p-1.5 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border p-3 text-center text-gray-500 italic">
                        No details added yet.
                      </td>
                    </tr>
                  ) : (
                    modalRows.map((r, i) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="border p-1.5 text-center">{i + 1}</td>
                        <td className="border p-1.5">{r.details}</td>
                        <td className="border p-1.5 text-right">{r.amount}</td>
                        <td className="border p-1.5 text-center">
                          <button
                            disabled={deletingModalId === r.id}
                            className="text-red-600 hover:underline font-semibold disabled:opacity-50"
                            onClick={() => onDeleteModalRow(r.id)}
                          >
                            {deletingModalId === r.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
