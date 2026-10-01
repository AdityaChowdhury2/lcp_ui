import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { toast } from "react-toastify";

import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";
import { useNavigate } from "react-router";

interface InspectorAssignment {
  sl_no: number;
  assignment_id: number;
  randomization_id: number;
  alc_name: string | null;
  randomization_date: string;
  /** ins_file_number of the inspection started for this assignment, if any. */
  note_id?: string | number | null;
  status?: string;
}

const customStyles = {
  table: { style: { border: "1px solid #ccc" } },
  headRow: {
    style: {
      backgroundColor: "#3b8dbc",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      minHeight: "36px",
    },
  },
  headCells: { style: { borderRight: "1px solid #ccc" } },
  rows: {
    style: { fontSize: "13px", minHeight: "34px" },
    stripedStyle: { backgroundColor: "#f2f2f2" },
  },
  cells: { style: { borderRight: "1px solid #ddd" } },
};

const InspectorOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InspectorAssignment[]>([]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      const res = await axios.get(
        `${API_BASE}inspections/inspector/assignments?userId=${userId}`,
      );

      setRows(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inspection assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (randomizationId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}inspections/randomization-orders/${randomizationId}/pdf`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate inspection note form PDF");
    }
  };

  const columns: TableColumn<InspectorAssignment>[] = [
    {
      name: "SL",
      selector: (row) => row.sl_no,
      width: "80px",
      center: true,
    },
    {
      name: "ALC NAME",
      selector: (row) => row.alc_name ?? "-",
      grow: 1,
    },
    {
      name: "DATE",
      selector: (row) =>
        row.randomization_date
          ? new Date(row.randomization_date).toLocaleDateString("en-IN")
          : "-",
      width: "180px",
    },
    {
      name: "ACTION",
      center: true,
      cell: (row) => (
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          {row.status === "Submitted" || row.status === "FS" || row.note_id ? (
            <button
              onClick={() =>
                navigate(
                  `/inspection-list/final-submit?inspectionId=${row.assignment_id}&source=dlc`,
                )
              }
              className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 cursor-pointer"
            >
              Inspect Report
            </button>
          ) : (
            <button
              onClick={() =>
                navigate(
                  `/inspection-list/final-submit?inspectionId=${row.assignment_id}&source=dlc`,
                )
              }
              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              Review & Upload Note
            </button>
          )}
          <button
            onClick={() => handleGenerate(row.randomization_id)}
            className="rounded bg-[#28a745] px-3 py-1 text-sm font-medium text-white hover:bg-[#218838] cursor-pointer"
          >
            Inspection Order
          </button>
        </div>
      ),
      width: "500px",
    },
  ];

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-xl border border-[#d7e0ea] bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#203040]">
            Inspector Order List
          </h1>

          <p className="mt-1 text-sm text-[#607080]">
            List of inspection assignments allocated to you
          </p>
        </div>

        <div className="rounded-xl border border-[#d7e0ea] bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={rows}
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 50]}
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-8 text-center text-sm text-[#607080]">
                No inspection assignments found
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default InspectorOrderList;
