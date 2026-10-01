import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { ElectionRow } from "../types/electedMember.types";

interface ElectedMemberTableProps {
  rows: ElectionRow[];
  loadingTable: boolean;
  onDelete: (row: ElectionRow) => Promise<void>;
}

export const ElectedMemberTable: React.FC<ElectedMemberTableProps> = ({
  rows,
  loadingTable,
  onDelete,
}) => {
  const columns: TableColumn<ElectionRow>[] = [
    {
      name: "Sl. No.",
      cell: (r) => <span className="font-medium text-gray-700">{r.sl_no}</span>,
      width: "80px",
    },
    {
      name: "Name",
      cell: (r) => <p className="text-wrap break-words text-gray-800">{r.name}</p>,
    },
    {
      name: <p className="text-wrap break-words">Date of Birth</p>,
      width: "140px",
      cell: (r) => <span className="text-gray-800">{r.date_of_birth}</span>,
    },
    {
      name: <p className="text-wrap break-words">Private Address</p>,
      cell: (r) => (
        <p className="text-wrap break-words text-gray-800">{r.private_address}</p>
      ),
    },
    {
      name: <p className="text-wrap break-words">Date of Election</p>,
      width: "150px",
      cell: (r) => <span className="text-gray-800">{r.date_of_election}</span>,
    },
    {
      name: "Action",
      cell: (r) => (
        <button
          type="button"
          className="text-red-600 font-semibold hover:underline text-sm"
          onClick={() => onDelete(r)}
        >
          Delete
        </button>
      ),
      width: "100px",
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
            <span>Loading election records...</span>
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
