import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";

/* ============================
   TYPES
============================ */
interface InspectionCase {
  sl_no: number;
  case_id: number;
  randomization_id: number;
  randomization_date: string;
  district_code: number;
  district_name: string;
  sub_div_code: number;
  subdivision_name: string;
  dlc_name: string;
  dlc_mobile: string;
  inspector_id: number;
  inspector_name: string;
  inspector_mobile: string;
  inspector_department: string;
  assigned_block_id: number;
  assigned_block_name: string;
  alc_ins_date: string;
  alc_order_uploaded_path: string;
  alc_order_uploaded_file: string;
  date: string;
  created_at: string;
  updated_at: string;
  note_id: number | null;
  uploaded_file_path: string | null;
  alc_case_status: string;
  status: string;
  alc_action: string | null;
  alc_remarks: string | null;
  alc_action_count: number;
  is_central: number;
}

interface ApiResponse {
  code: number;
  alc_name: string;
  total: number;
  data: InspectionCase[];
}

interface TableRow {
  sl: number;
  caseId: number;
  randomizationId: number;
  randomizationDate: string;
  districtName: string;
  subdivisionName: string;
  dlcName: string;
  inspectorName: string;
  inspectorMobile: string;
  assignedBlockName: string;
  alcInsDate: string;
  alcInsDateRaw: string | null;
  inspectionDate: string;
  noteId: number | null;
  alcCaseStatus: string;
  status: string;
  alcAction: string | null;
  alcRemarks: string | null;
  isCentral: number;
  uploadedFilePath: string | null;
}

/* ============================
   TABLE STYLES
============================ */
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

/* ============================
   TABLE COLUMNS
============================ */
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
      name: "INSPECTION DATE (ALC)",
      selector: (r) => r.alcInsDate,
      width: "140px",
    },
    {
      name: "ALC CASE STATUS",
      cell: (r) => {
        const status = r.alcCaseStatus || "Pending";
        let badgeClass = "bg-gray-100 text-gray-800 border-gray-250";
        if (status === "Pending") {
          badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
        } else if (status === "Closed") {
          badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
        } else if (status === "Under Review" || status === "In Progress") {
          badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${badgeClass}`}>
            {status}
          </span>
        );
      },
      width: "160px",
      center: true,
    },
    {
      name: "ALC ACTION & REMARKS",
      cell: (r) => {
        if (!r.alcAction && !r.alcRemarks) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="flex flex-col gap-0.5 py-1">
            {r.alcAction && (
              <span className="font-semibold text-slate-800 text-[12px]">
                {r.alcAction}
              </span>
            )}
            {r.alcRemarks && (
              <span className="text-[11px] text-gray-500 italic max-w-[160px] truncate" title={r.alcRemarks}>
                "{r.alcRemarks}"
              </span>
            )}
          </div>
        );
      },
      width: "160px",
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
                  navigate(`/alc-orders-list/${r.caseId}`, {
                    state: {
                      caseId: r.caseId,
                      inspectorName: r.inspectorName,
                      inspectorMobile: r.inspectorMobile,
                      assignedBlockName: r.assignedBlockName,
                      alcInsDate: r.alcInsDate,
                      districtName: r.districtName,
                      subdivisionName: r.subdivisionName,
                    },
                  });
                } else {
                  navigate(`/inspection-list/final-submit?inspectionId=${r.caseId}&source=dlc`);
                }
              }}
              className="rounded bg-[#3b8dbc] px-3 py-1 text-xs font-medium text-white hover:bg-[#2d6fa3] cursor-pointer"
            >
              {r.alcCaseStatus === "Closed" ? "View Details" : "Inspect"}
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">Pending note</span>
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

/* ============================
   COMPONENT
============================ */
const AlcInspectionCasesList: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [alcName, setAlcName] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const fetchInspectionCases = async (userId: number) => {
    try {
      setLoading(true);

      const res = await axios.get<ApiResponse>(
        `${API_BASE}inspections/alc/inspection-cases?userId=${userId}`,
      );

      setAlcName(res.data.alc_name || "");
      setTotal(res.data.total || 0);

      const tableRows: TableRow[] = (res.data.data || []).map(
        (item, index) => ({
          sl: index + 1,
          caseId: item.case_id,
          randomizationId: item.randomization_id,
          randomizationDate: item.randomization_date
            ? new Date(item.randomization_date).toLocaleDateString("en-IN")
            : "-",
          districtName: item.district_name || "-",
          subdivisionName: item.subdivision_name || "-",
          dlcName: item.dlc_name || "-",
          inspectorName: item.inspector_name || "-",
          inspectorMobile: item.inspector_mobile || "-",
          assignedBlockName: item.assigned_block_name || "-",
          alcInsDate: item.alc_ins_date
            ? new Date(item.alc_ins_date).toLocaleDateString("en-IN")
            : "-",
          alcInsDateRaw: item.alc_ins_date || null,
          inspectionDate: item.date
            ? new Date(item.date).toLocaleDateString("en-IN")
            : "-",
          noteId: item.note_id ?? null,
          alcCaseStatus: item.alc_case_status || "Pending",
          status: item.status || "Pending",
          alcAction: item.alc_action || null,
          alcRemarks: item.alc_remarks || null,
          isCentral: item.is_central ?? 0,
          uploadedFilePath: item.uploaded_file_path || null,
        }),
      );

      setRows(tableRows);
    } catch {
      toast.error("Failed to load inspection cases");
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

  const totalCount = rows.length;
  const pendingCount = rows.filter((r) => !r.alcInsDateRaw && !r.noteId).length;
  const scheduledCount = rows.filter((r) => r.alcInsDateRaw && !r.noteId).length;
  const processedCount = rows.filter((r) => r.noteId !== null && r.noteId !== undefined).length;
  const showCauseCount = rows.filter((r) => r.alcAction === "Show Cause Notice").length;
  // Cases the inspector has sent up for prosecution — the ALC's only action queue.
  const recommendedCount = rows.filter(
    (r) => r.alcAction === "Recommended for Court Case",
  ).length;
  const courtCaseCount = rows.filter((r) => r.alcAction === "Court Case").length;
  const lateOffCount = rows.filter((r) => r.alcAction === "Late Off Notice").length;

  const filterTabs = [
    { label: "All", value: "All", count: totalCount, badgeClass: "bg-gray-100 text-gray-800 border-gray-200" },
    { label: "Show Cause", value: "Show Cause", count: showCauseCount, badgeClass: "bg-amber-100 text-amber-800 border-amber-250" },
    { label: "Recommended for Court Case", value: "Recommended for Court Case", count: recommendedCount, badgeClass: "bg-orange-100 text-orange-800 border-orange-200" },
    { label: "Court Case", value: "Court Case", count: courtCaseCount, badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Late Off", value: "Late Off", count: lateOffCount, badgeClass: "bg-rose-100 text-rose-800 border-rose-200" },
    { label: "Processed By Inspector", value: "Processed By Inspector", count: processedCount, badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  ];

  const filteredRows = rows.filter((row) => {
    if (selectedStatus === "All") return true;
    if (selectedStatus === "Show Cause") {
      return row.alcAction === "Show Cause Notice";
    }
    if (selectedStatus === "Recommended for Court Case") {
      return row.alcAction === "Recommended for Court Case";
    }
    if (selectedStatus === "Court Case") {
      return row.alcAction === "Court Case";
    }
    if (selectedStatus === "Late Off") {
      return row.alcAction === "Late Off Notice";
    }
    if (selectedStatus === "Processed By Inspector") {
      return row.noteId !== null && row.noteId !== undefined;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="rounded-xl border border-[#d7e0ea] bg-white px-4 py-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-[24px] font-semibold text-[#203040]">
              Orders List
            </h1>
            {alcName && (
              <div className="text-sm text-[#607080]">
                <span className="font-medium text-[#203040]">ALC:</span>{" "}
                {alcName} &nbsp;|&nbsp;{" "}
                <span className="font-medium text-[#203040]">Total:</span>{" "}
                {total}
              </div>
            )}
          </div>

          {/* Status Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const isActive = selectedStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer ${isActive
                    ? "bg-[#3b8dbc] text-white border-[#3b8dbc]"
                    : "bg-white text-[#607080] border-[#d7e0ea] hover:bg-slate-50"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${isActive
                      ? "bg-white/20 text-white border-white/20"
                      : tab.badgeClass
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
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
                No inspection cases found
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AlcInspectionCasesList;
