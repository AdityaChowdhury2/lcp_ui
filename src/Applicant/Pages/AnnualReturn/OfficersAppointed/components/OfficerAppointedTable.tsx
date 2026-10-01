import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { OfficerRow } from "../types/officersAppointed.types";

interface OfficerAppointedTableProps {
  tableData: OfficerRow[];
  loadingTable: boolean;
  onDelete: (row: OfficerRow) => Promise<void>;
}

export const OfficerAppointedTable: React.FC<OfficerAppointedTableProps> = ({
  tableData,
  loadingTable,
  onDelete,
}) => {
  const columns: TableColumn<OfficerRow>[] = [
    {
      name: "Sl. No",
      cell: (row) => <span className="font-medium text-gray-700">{row.slNo}</span>,
      width: "80px",
    },
    {
      name: "Name",
      cell: (row) => <p className="text-wrap break-words text-gray-800">{row.name}</p>,
    },
    {
      name: "DOB",
      cell: (row) => <span className="text-gray-800">{row.dob}</span>,
    },
    {
      name: <p className="text-wrap break-words">Personal Occupation</p>,
      cell: (row) => (
        <p className="text-wrap break-words text-gray-800">{row.personal_occupation}</p>
      ),
    },
    {
      name: (
        <p className="text-wrap break-words">Title of Position held in Union/Federation</p>
      ),
      cell: (row) => <p className="text-wrap break-words text-gray-800">{row.tital_position}</p>,
    },
    {
      name: (
        <p className="text-wrap break-words">Date on which appointment in col 5 was taken up</p>
      ),
      cell: (row) => (
        <p className="text-wrap break-words text-gray-800">{row.date_appointment_was_taken}</p>
      ),
    },
    {
      name: (
        <p className="text-wrap break-words">
          Other Office held in addition to membership of executive with date
        </p>
      ),
      cell: (row) => <p className="text-wrap break-words text-gray-800">{row.other_office}</p>,
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          type="button"
          className="text-red-600 font-semibold hover:underline text-sm"
          onClick={() => onDelete(row)}
        >
          Delete
        </button>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="bg-white border border-[#ddd] rounded shadow-sm mb-12">
      <DataTable
        columns={columns}
        data={tableData}
        pagination={false}
        progressPending={loadingTable}
        progressComponent={
          <div className="p-6 flex items-center gap-2 text-gray-500">
            <FaSpinner className="w-4 h-4 animate-spin text-[#2c5f8a]" />
            <span>Loading officers appointed records...</span>
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
