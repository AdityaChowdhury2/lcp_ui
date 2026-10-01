import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { OfficerRow } from "../types/officersRelinquishing.types";

interface OfficerRelinquishingTableProps {
  tableData: OfficerRow[];
  loadingTable: boolean;
  onDelete: (id: number) => Promise<void>;
}

export const OfficerRelinquishingTable: React.FC<OfficerRelinquishingTableProps> = ({
  tableData,
  loadingTable,
  onDelete,
}) => {
  const columns: TableColumn<OfficerRow>[] = [
    {
      name: "Sl. No",
      cell: (row) => <span className="font-medium text-gray-700">{row.sl}</span>,
      width: "100px",
    },
    {
      name: "Name",
      cell: (row) => <p className="text-wrap break-words text-gray-800">{row.name}</p>,
    },
    {
      name: "Office",
      cell: (row) => <p className="text-wrap break-words text-gray-800">{row.office}</p>,
    },
    {
      name: <p className="text-wrap break-words">Date of Relinquishing Office</p>,
      cell: (row) => <span className="text-gray-800">{row.date}</span>,
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          type="button"
          className="text-red-600 font-semibold hover:underline text-sm"
          onClick={() => onDelete(row.id)}
        >
          Delete
        </button>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="bg-white border border-[#ddd] rounded shadow-sm">
      <DataTable
        columns={columns}
        data={tableData}
        pagination={false}
        progressPending={loadingTable}
        progressComponent={
          <div className="p-6 flex items-center gap-2 text-gray-500">
            <FaSpinner className="w-4 h-4 animate-spin text-[#2c5f8a]" />
            <span>Loading officers relinquishing records...</span>
          </div>
        }
        customStyles={{
          headRow: {
            style: {
              backgroundColor: "#2c5f8a",
              color: "#fff",
              fontWeight: 600,
            },
          },
          rows: {
            style: {
              minHeight: "40px",
            },
          },
          cells: {
            style: {
              borderBottom: "1px solid #ddd",
            },
          },
        }}
      />
    </div>
  );
};
