import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { ExpRow } from "../types/politicalFund.types";

interface PFAExpenditureTableProps {
  expRows: ExpRow[];
  loadingExp: boolean;
  onOpenExpModal: (row: ExpRow) => void;
  totalExpenditure: number;
}

export const PFAExpenditureTable: React.FC<PFAExpenditureTableProps> = ({
  expRows,
  loadingExp,
  onOpenExpModal,
  totalExpenditure,
}) => {
  const expColumns: TableColumn<ExpRow>[] = [
    {
      name: "Expenditure Description",
      cell: (row) => (
        <span className="text-[13px] font-medium text-gray-800">{row.description}</span>
      ),
      grow: 2,
    },
    {
      name: "",
      cell: (row) =>
        row.hasModal ? (
          <button
            type="button"
            onClick={() => onOpenExpModal(row)}
            className="bg-[#1da1f2] text-white text-[11px] px-3 py-1 rounded font-semibold hover:bg-[#0c85d0] transition"
          >
            ADD DESCRIPTION
          </button>
        ) : null,
      width: "200px",
    },
    {
      name: "Amount (₹)",
      cell: (row) => (
        <span className="text-[13px] font-bold text-gray-900">
          ₹{row.amount.toLocaleString("en-IN")}
        </span>
      ),
      width: "180px",
    },
  ];

  return (
    <div className="bg-white border border-[#d5d5d5] rounded shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <div className="bg-[#2c5f8a] text-white px-4 py-2 text-[13px] font-semibold">
          DETAILS OF EXPENDITURE
        </div>
        <DataTable
          columns={expColumns}
          data={expRows}
          progressPending={loadingExp}
          progressComponent={
            <div className="p-6 flex items-center gap-2 text-gray-500 text-xs">
              <FaSpinner className="w-4 h-4 animate-spin text-[#2c5f8a]" />
              <span>Loading Expenditure details...</span>
            </div>
          }
          noDataComponent={
            <div className="p-4 text-center text-gray-500 text-xs italic">
              No Expenditure records found.
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
                minHeight: "48px",
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

      {/* TOTAL FOOTER */}
      <div className="bg-[#f0f4f8] border-t border-[#d5d5d5] px-4 py-3 flex justify-between items-center font-bold text-[13px]">
        <span className="text-gray-800">Total Expenditure:</span>
        <span className="text-[#2c5f8a] text-sm">
          ₹{totalExpenditure.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
};
