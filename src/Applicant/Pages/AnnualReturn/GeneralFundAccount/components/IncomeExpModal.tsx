import React from "react";
import { FaSpinner } from "react-icons/fa";
import { ModalRow } from "../types/generalFund.types";

interface IncomeExpModalProps {
  showModal: boolean;
  onClose: () => void;
  modalTitle: string;
  modalCategory: "income" | "expenditure";
  modalError: string;
  modalDesc: string;
  setModalDesc: (val: string) => void;
  modalAmount: string;
  setModalAmount: (val: string) => void;
  isSavingModal: boolean;
  onSaveModal: () => Promise<void>;
  loadingModal: boolean;
  modalRows: ModalRow[];
  deletingModalId: string | number | null;
  onDeleteModal: (id: string | number) => Promise<void>;
}

export const IncomeExpModal: React.FC<IncomeExpModalProps> = ({
  showModal,
  onClose,
  modalTitle,
  modalCategory,
  modalError,
  modalDesc,
  setModalDesc,
  modalAmount,
  setModalAmount,
  isSavingModal,
  onSaveModal,
  loadingModal,
  modalRows,
  deletingModalId,
  onDeleteModal,
}) => {
  if (!showModal) return null;

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
          <span>
            Add Details - {modalTitle} ({modalCategory.toUpperCase()})
          </span>
          <button
            className="hover:opacity-80 text-lg leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3">
          {modalError && (
            <p className="text-red-600 text-xs font-semibold">{modalError}</p>
          )}

          <div>
            <label className="text-[12px] font-semibold text-gray-700 block mb-1">
              Description <span className="text-red-600">*</span>
            </label>
            <input
              value={modalDesc}
              onChange={(e) => setModalDesc(e.target.value)}
              className="w-full h-[30px] border border-[#bdbdbd] px-2 text-[13px] rounded-sm focus:outline-none focus:border-[#2c5f8a]"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-gray-700 block mb-1">
              Amount <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              onKeyDown={preventNegative}
              value={modalAmount}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw.includes("-")) return;
                setModalAmount(raw);
              }}
              className="w-full h-[30px] border border-[#bdbdbd] px-2 text-[13px] rounded-sm focus:outline-none focus:border-[#2c5f8a]"
              placeholder="Enter amount"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="border border-[#ccc] px-4 py-1 text-xs rounded hover:bg-gray-100 text-gray-700"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              disabled={isSavingModal}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-4 py-1 text-xs rounded font-medium disabled:opacity-50 flex items-center gap-1.5"
              onClick={onSaveModal}
            >
              {isSavingModal && <FaSpinner className="w-3 h-3 animate-spin" />}
              Save
            </button>
          </div>

          {/* Table of added items */}
          <div className="mt-3 border border-[#dcdcdc] rounded overflow-hidden max-h-[220px] overflow-y-auto">
            {loadingModal ? (
              <div className="p-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <FaSpinner className="w-3.5 h-3.5 animate-spin text-[#2c5f8a]" />
                <span>Loading item details...</span>
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
                    modalRows.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="border p-1.5 text-center">{r.sl}</td>
                        <td className="border p-1.5">{r.description}</td>
                        <td className="border p-1.5 text-right">₹{r.amount}</td>
                        <td className="border p-1.5 text-center">
                          <button
                            type="button"
                            disabled={deletingModalId === r.id}
                            className="text-red-600 hover:underline font-semibold disabled:opacity-50"
                            onClick={() => onDeleteModal(r.id)}
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
