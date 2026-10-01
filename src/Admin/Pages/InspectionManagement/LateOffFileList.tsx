import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";

interface InspectionCase {
  case_id: number;
  randomization_id: number;
  randomization_date: string;
  district_name: string;
  subdivision_name: string;
  dlc_name: string;
  inspector_name: string;
  inspector_mobile: string;
  assigned_block_name: string;
  alc_ins_date: string;
  date: string;
  note_id: number | null;
  alc_case_status: string;
  status: string;
  alc_action: string | null;
  alc_remarks: string | null;
  is_central: number;
  uploaded_file_path?: string | null;
}

interface ApiResponse {
  alc_name: string;
  total: number;
  data: InspectionCase[];
}

interface TableRow {
  sl: number;
  caseId: number;
  randomizationId: number;
  districtName: string;
  subdivisionName: string;
  inspectorName: string;
  inspectorMobile: string;
  assignedBlockName: string;
  alcInsDate: string;
  noteId: number | null;
  alcCaseStatus: string;
  status: string;
  alcAction: string | null;
  alcRemarks: string | null;
  isCentral: number;
  uploadedFilePath: string | null;
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

const getColumns = (
  navigate: ReturnType<typeof useNavigate>,
): TableColumn<TableRow>[] => [
  {
    name: "SL NO",
    selector: (r) => r.sl,
    width: "60px",
    center: true,
  },
  {
    name: "CASE ID / FILE NO",
    selector: (r) => r.caseId,
    width: "120px",
    center: true,
  },
  {
    name: "INSPECTOR NAME",
    selector: (r) => r.inspectorName,
    grow: 2,
    wrap: true,
  },
  {
    name: "MOBILE",
    selector: (r) => r.inspectorMobile,
    width: "110px",
  },
  {
    name: "ASSIGNED BLOCK",
    selector: (r) => r.assignedBlockName,
    width: "180px",
    wrap: true,
  },
  {
    name: "INSPECTION DATE",
    selector: (r) => r.alcInsDate,
    width: "140px",
  },
  {
    name: "STATUS",
    cell: (r) => {
      const status = r.alcCaseStatus || "Pending";
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200">
          {status}
        </span>
      );
    },
    width: "140px",
    center: true,
  },
  {
    name: "ALC REMARKS",
    selector: (r) => r.alcRemarks || "-",
    grow: 2,
    wrap: true,
  },
  {
    name: "ACTIONS",
    cell: (r) => (
      <div className="flex gap-2 items-center py-1">
        {r.noteId ? (
          <button
            onClick={() => {
              if (r.isCentral === 1) {
                navigate(`/alc-orders-list/${r.caseId}`);
              } else {
                navigate(`/inspection-list/final-submit?inspectionId=${r.caseId}&source=dlc`);
              }
            }}
            className="rounded bg-[#3b8dbc] px-3 py-1 text-xs font-medium text-white hover:bg-[#2d6fa3] cursor-pointer"
          >
            View
          </button>
        ) : (
          <span className="text-xs text-gray-400 italic">No details</span>
        )}
        {r.uploadedFilePath && (
          <button
            onClick={() => {
              if (!r.uploadedFilePath) return;
              const base = API_BASE.endsWith("/api/") ? API_BASE.slice(0, -5) : API_BASE.replace(/\/api$/, "");
              const cleanPath = r.uploadedFilePath.startsWith("/") ? r.uploadedFilePath.slice(1) : r.uploadedFilePath;
              window.open(`${base}/${cleanPath}`, "_blank");
            }}
            className="rounded bg-[#00a65a] px-3 py-1 text-xs font-medium text-white hover:bg-[#008d4c] cursor-pointer"
          >
            Preview Signed
          </button>
        )}
      </div>
    ),
    width: "220px",
  },
];

const LateOffFileList: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInspectionCases = async (userId: number) => {
    try {
      setLoading(true);
      const res = await axios.get<ApiResponse>(
        `${API_BASE}inspections/alc/inspection-cases?userId=${userId}`,
      );

      const filtered = (res.data.data || [])
        .filter((item) => item.alc_action === "Late Off Notice")
        .map((item, index) => ({
          sl: index + 1,
          caseId: item.case_id,
          randomizationId: item.randomization_id,
          districtName: item.district_name || "-",
          subdivisionName: item.subdivision_name || "-",
          inspectorName: item.inspector_name || "-",
          inspectorMobile: item.inspector_mobile || "-",
          assignedBlockName: item.assigned_block_name || "-",
          alcInsDate: item.alc_ins_date
            ? new Date(item.alc_ins_date).toLocaleDateString("en-IN")
            : "-",
          noteId: item.note_id ?? null,
          alcCaseStatus: item.alc_case_status || "Pending",
          status: item.status || "Pending",
          alcAction: item.alc_action || null,
          alcRemarks: item.alc_remarks || null,
          isCentral: item.is_central ?? 0,
          uploadedFilePath: item.uploaded_file_path || null,
        }));

      setRows(filtered);
    } catch {
      toast.error("Failed to load Late Off files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchInspectionCases(Number(userId));
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      row.inspectorName.toLowerCase().includes(query) ||
      String(row.caseId).toLowerCase().includes(query) ||
      row.assignedBlockName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="rounded-xl border border-[#d7e0ea] bg-white px-4 py-4 shadow-sm">
          <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold text-[#203040]">
                Late Off Files
              </h1>
              <p className="text-xs text-gray-500 mt-1">Inspection cases marked as Late Off by ALC</p>
            </div>
            <input
              type="text"
              value={searchQuery}
              placeholder="Search by Inspector, Case ID..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border px-3 py-1.5 rounded-lg text-sm w-64 shadow-xs"
            />
          </div>

          <DataTable
            columns={getColumns(navigate)}
            data={filteredRows}
            progressPending={loading}
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[10, 20, 50]}
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-8 text-center text-sm text-[#607080]">
                No Late Off files found
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LateOffFileList;
