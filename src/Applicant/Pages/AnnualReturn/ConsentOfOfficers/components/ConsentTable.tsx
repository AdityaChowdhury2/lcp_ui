import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { ConsentRow } from "../types/consentOfOfficers.types";

interface ConsentTableProps {
  rows: ConsentRow[];
  loadingTable: boolean;
  onDelete: (row: ConsentRow) => Promise<void>;
}

export const ConsentTable: React.FC<ConsentTableProps> = ({
  rows,
  loadingTable,
  onDelete,
}) => {
  const columns: TableColumn<ConsentRow>[] = [
    { name: "Sl. No.", selector: (r) => r.sl_no, width: "80px" },
    {
      name: "Name",
      cell: (r) => <p className="text-wrap break-words text-gray-800">{r.name}</p>,
    },
    {
      name: "Mobile",
      cell: (r) => <p className="text-wrap break-words text-gray-800">{r.mobile}</p>,
    },
    {
      name: "Designation",
      cell: (r) => (
        <p className="text-wrap break-words text-gray-800">{r.designation}</p>
      ),
    },
    {
      name: "Action",
      cell: (row: ConsentRow) => (
        <button
          type="button"
          onClick={() => onDelete(row)}
          className="text-red-600 font-semibold hover:underline text-sm"
        >
          Delete
        </button>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="mt-6 bg-white border border-[#ddd] rounded shadow-sm">
      <DataTable
        columns={columns}
        data={rows}
        pagination={false}
        progressPending={loadingTable}
        progressComponent={
          <div className="p-6 flex items-center gap-2 text-gray-500">
            <FaSpinner className="w-4 h-4 animate-spin text-[#2c5f8a]" />
            <span>Loading consent of officers records...</span>
          </div>
        }
        customStyles={{
          headRow: {
            style: {
              backgroundColor: "#2c5f8a",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
            },
          },
          rows: {
            style: {
              fontSize: "13px",
            },
          },
          cells: {
            style: {
              borderRight: "1px solid #ddd",
              borderBottom: "1px solid #ddd",
            },
          },
        }}
      />
    </div>
  );
};
