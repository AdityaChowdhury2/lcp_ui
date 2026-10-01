import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { IncomeRow } from "../types/generalFund.types";

interface IncomeTableProps {
  incomeRows: IncomeRow[];
  setIncomeRows?: React.Dispatch<React.SetStateAction<IncomeRow[]>>;
  loadingIncome: boolean;
  onOpenIncomeModal: (row: IncomeRow) => void;
  totalIncome: number;
}

export const IncomeTable: React.FC<IncomeTableProps> = ({
  incomeRows,
  setIncomeRows,
  loadingIncome,
  onOpenIncomeModal,
  totalIncome,
}) => {
  const incomeColumns: TableColumn<IncomeRow>[] = [
    {
      name: "Income Description",
      cell: (row) => (
        <span className="text-[13px] font-medium text-gray-800">{row.label}</span>
      ),
      grow: 2,
    },
    {
      name: "",
      cell: (row) =>
        row.hasDescription ? (
          <button
            type="button"
            onClick={() => onOpenIncomeModal(row)}
            className="bg-[#1da1f2] text-white text-[11px] px-3 py-1 rounded font-semibold hover:bg-[#0c85d0] transition"
          >
            Add Description
          </button>
        ) : null,
      width: "150px",
    },
    {
      name: "Rupees",
      cell: (row) =>
        row.id === 1 && setIncomeRows ? (
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold text-gray-900">₹</span>
            <input
              type="number"
              min="0"
              value={row.amount || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                setIncomeRows((prev) =>
                  prev.map((r) => (r.id === 1 ? { ...r, amount: val } : r))
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
              placeholder="0"
              className="w-full max-w-[100px] px-2 py-1 text-right text-[13px] font-bold border border-blue-400 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c5f8a]/30 shadow-inner"
            />
          </div>
        ) : (
          <span className="text-[13px] font-bold text-gray-900">
            ₹{row.amount.toLocaleString("en-IN")}
          </span>
        ),
      width: "140px",
    },
  ];

  return (
    <div className="bg-white border border-[#d5d5d5] rounded shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 text-[13px] font-semibold">
          DETAILS OF INCOME
        </div>
        <DataTable
          columns={incomeColumns}
          data={incomeRows}
          progressPending={loadingIncome}
          progressComponent={
            <div className="p-6 flex items-center gap-2 text-gray-500 text-xs">
              <FaSpinner className="w-4 h-4 animate-spin text-[#2c5f8a]" />
              <span>Loading Income details...</span>
            </div>
          }
          noDataComponent={
            <div className="p-4 text-center text-gray-500 text-xs italic">
              No Income records found.
            </div>
          }
          customStyles={{
            headRow: {
              style: {
                backgroundColor: "#f4f6f9",
                minHeight: "36px",
                borderBottom: "1px solid #e0e0e0",
              },
            },
            headCells: {
              style: {
                fontSize: "12px",
                fontWeight: 700,
                color: "#444",
              },
            },
            rows: {
              style: {
                minHeight: "42px",
                "&:nth-of-type(even)": {
                  backgroundColor: "#fafafa",
                },
              },
            },
            cells: {
              style: {
                paddingLeft: "12px",
                paddingRight: "12px",
              },
            },
          }}
        />
      </div>

      {/* TOTAL INCOME FOOTER */}
      <div className="bg-[#f0f4f8] border-t border-[#d5d5d5] px-4 py-3 flex justify-between items-center font-bold text-[13px]">
        <span className="text-gray-800">Total Income:</span>
        <span className="text-[#2c5f8a] text-sm">
          ₹{totalIncome.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
};
