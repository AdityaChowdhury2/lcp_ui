import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { SecurityRow } from "../types/securities.types";

interface SecuritiesTableProps {
  data: SecurityRow[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (row: SecurityRow) => Promise<void>;
}

export const SecuritiesTable: React.FC<SecuritiesTableProps> = ({
  data,
  loading,
  deletingId,
  onDelete,
}) => {
  const columns: TableColumn<SecurityRow>[] = [
    { name: "Sl. No", cell: (row) => row.sl_no, width: "80px" },
    {
      name: "Particulars",
      cell: (row) => <p className="text-wrap break-words">{row.particulars}</p>,
    },
    {
      name: "Face Value",
      cell: (row) => <p className="text-wrap break-words">{row.face_value}</p>,
    },
    {
      name: "Cost Price",
      cell: (row) => <p className="text-wrap break-words">{row.cost_price}</p>,
    },
    {
      name: (
        <p className="text-wrap break-words">
          Market price at date on which accounts have been made up
        </p>
      ),
      cell: (row) => <p className="text-wrap break-words">{row.market_price}</p>,
      wrap: true,
    },
    {
      name: <p className="text-wrap break-words">In hands of</p>,
      cell: (row) => <p className="text-wrap break-words">{row.in_hand}</p>,
    },
    {
      name: "Action",
      cell: (row) =>
        deletingId === row.encrypted_id ? (
          <FaSpinner className="w-4 h-4 animate-spin text-red-600" />
        ) : (
          <span
            className="text-red-600 cursor-pointer hover:underline font-semibold"
            onClick={() => onDelete(row)}
          >
            Delete
          </span>
        ),
      width: "100px",
    },
  ];

  return (
    <div className="px-4 pb-4">
      <DataTable
        columns={columns}
        data={data}
        striped
        responsive
        progressPending={loading}
        progressComponent={
          <div className="p-6 flex items-center gap-2 text-gray-500">
            <FaSpinner className="w-4 h-4 animate-spin text-[#2c5f8a]" />
            <span>Loading securities list...</span>
          </div>
        }
        noDataComponent={
          <div className="p-6 text-center text-gray-500 text-[13px]">
            No securities records found.
          </div>
        }
        customStyles={{
          table: {
            style: {
              border: "1px solid #cfcfcf",
            },
          },
          headRow: {
            style: {
              backgroundColor: "#2c5f8a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
            },
          },
          headCells: {
            style: {
              color: "#ffffff",
              borderRight: "1px solid #ffffff33",
            },
          },
          cells: {
            style: {
              fontSize: "13px",
              borderRight: "1px solid #ddd",
            },
          },
        }}
      />
    </div>
  );
};
