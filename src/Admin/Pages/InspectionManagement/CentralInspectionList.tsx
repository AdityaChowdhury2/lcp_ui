import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { toast } from "react-toastify";

import { API_BASE } from "@/constants/constants";
import { getUserDetails, getUserId } from "@/utils/auth";
import { useNavigate } from "react-router";

interface BoilerInspection {
  id: number;
  factory_name: string;
  boiler_reg_no?: string | null;
  factory_reg_numer?: string | null;
  district: string;
  subdivision: string;
  area: string;
  police_station: string;
  inspection_date: string;
  cis_report_path: string;
  status: string;
  source: string;
  village_premises?: string | null;
  post_office?: string | null;
  pincode?: string | null;
  remark?: string | null;
  status_updated_by?: number | null;
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

const CentralInspectionList: React.FC = () => {
  const navigate = useNavigate();
  const user = getUserDetails();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<BoilerInspection[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const fetchInspections = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      const res = await axios.get(
        `${API_BASE}inspections/get-latest-boiler?userId=${userId}`,
      );

      setRows(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (row: BoilerInspection) => {
    try {
      if (!row.cis_report_path) {
        toast.error("PDF path not found");
        return;
      }

      const response = await axios.post(
        `${API_BASE}inspections/central-inspector/get-pdf-buffer`,
        {
          filePath: row.cis_report_path,
        },
      );

      const base64 = response.data;

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Failed to open PDF");
    }
  };

  const handleSkipInspection = async (row: BoilerInspection, isNotApplicable: boolean) => {
    const confirmSkip = window.confirm(
      `Are you sure you want to skip the inspection for ${row.factory_name}?`
    );
    if (!confirmSkip) return;
    const remark = prompt("Enter remark");

    if (!remark || remark.trim() === "") {
      toast.error("Please enter a remark");
      return;
    }

    try {
      setLoading(true);
      const userId = getUserId();
      const res = await axios.post(
        `${API_BASE}inspections/${row.id}/skip-inspection?userId=${userId}&isNA=${isNotApplicable}`,
        { remark }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success(`Inspection ${isNotApplicable ? "marked as not applicable" : "skipped"} successfully`);
        fetchInspections();
      } else {
        toast.error(`Failed to ${isNotApplicable ? "mark as not applicable" : "skip"} inspection`);
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to skip inspection";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<BoilerInspection>[] = [
    {
      name: "SL",
      cell: (_, index) => index + 1,
      width: "60px",
      center: true,
    },
    {
      name: "FACTORY NAME & ADDRESS",
      cell: (row) => (
        <div className="py-2 pr-2">
          <div className="font-semibold text-[#203040] leading-tight">{row.factory_name}</div>
          <div className="text-[11px] text-[#607080] mt-1 leading-normal">
            {[
              row.village_premises,
              row.police_station ? `PS: ${row.police_station}` : null,
              row.post_office ? `PO: ${row.post_office}` : null,
              row.pincode ? `PIN: ${row.pincode.trim()}` : null,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      ),
      grow: 3,
      wrap: true,
    },
    {
      name: "REG NO",
      cell: (row) => (
        <div className="py-1">
          <div className="font-medium text-[#203040]">
            {row.boiler_reg_no || row.factory_reg_numer || "-"}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {row.boiler_reg_no ? "Boiler Reg" : row.factory_reg_numer ? "Factory Reg" : ""}
          </div>
        </div>
      ),
      width: "160px",
    },
    {
      name: "SOURCE",
      selector: (row) => {
        if (row.source === "B") return "Boiler";
        if (row.source === "F") return "Factory";
        return row.boiler_reg_no ? "Boiler" : "Factory";
      },
      width: "110px",
    },
    {
      name: "DISTRICT",
      selector: (row) => row.district ?? "-",
      width: "120px",
    },
    {
      name: "SUBDIVISION",
      selector: (row) => row.subdivision ?? "-",
      width: "130px",
    },
    {
      name: "AREA",
      selector: (row) => row.area ?? "-",
      width: "130px",
    },
    {
      name: "INSPECTION DATE",
      selector: (row) =>
        row.inspection_date
          ? new Date(row.inspection_date).toLocaleDateString("en-IN")
          : "-",
      width: "140px",
    },
    {
      name: "STATUS",
      cell: (row) => {
        let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
        if (row.status === "Pending") {
          badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
        } else if (row.status === "Skipped") {
          badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
        } else if (row.status === "Not Applicable") {
          badgeColor = "bg-sky-100 text-sky-800 border-sky-200";
        } else if (row.status === "Approved" || row.status === "Completed") {
          badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
        }
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
            {row.status || "Pending"}
          </span>
        );
      },
      width: "130px",
      center: true,
    },
    {
      name: "REMARK",
      selector: (row) => row.remark || "-",
      width: "160px",
      wrap: true,
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1.5 py-1.5 justify-center">
          {row.cis_report_path ? (
            <button
              onClick={() => handleViewReport(row)}
              className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Inspection Order Note
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium italic">No Report</span>
          )}

          {user?.role === 7 && row.status === "Pending" && (
            <>
              <button
                onClick={() =>
                  navigate(
                    `/inspection-list/final-submit?inspectionId=${row.id}&is-central=true`,
                  )
                }
                className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Inspect
              </button>
              <button
                onClick={() => handleSkipInspection(row, false)}
                className="rounded bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                Skip
              </button>
              <button
                onClick={() => handleSkipInspection(row, true)}
                className="rounded bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
              >
                Not Applicable
              </button>
            </>
          )}

          {user?.role === 4 && row.status === "Pending" && (
            <button
              onClick={() => navigate(`/alc-orders-list/${row.id}`)}
              className="rounded bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Inspect
            </button>
          )}
        </div>
      ),
      width: "280px",
      center: true,
    },
  ];

  useEffect(() => {
    fetchInspections();
  }, []);

  const totalCount = rows.length;
  const pendingCount = rows.filter((r) => (r.status || "Pending") === "Pending").length;
  const completedCount = rows.filter((r) => r.status === "Completed" || r.status === "Approved").length;
  const skippedCount = rows.filter((r) => r.status === "Skipped").length;
  const naCount = rows.filter((r) => r.status === "Not Applicable").length;

  const filterTabs = [
    { label: "All", value: "All", count: totalCount, badgeClass: "bg-gray-100 text-gray-800 border-gray-200" },
    { label: "Pending", value: "Pending", count: pendingCount, badgeClass: "bg-amber-100 text-amber-800 border-amber-200" },
    { label: "Completed", value: "Completed", count: completedCount, badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Skipped", value: "Skipped", count: skippedCount, badgeClass: "bg-rose-100 text-rose-800 border-rose-200" },
    { label: "Not Applicable", value: "Not Applicable", count: naCount, badgeClass: "bg-sky-100 text-sky-800 border-sky-200" },
  ];

  const filteredRows = rows.filter((row) => {
    if (selectedStatus === "All") return true;
    const status = row.status || "Pending";
    if (selectedStatus === "Completed") {
      return status === "Completed" || status === "Approved";
    }
    return status === selectedStatus;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-xl border border-[#d7e0ea] bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#203040]">
            Central Inspection List
          </h1>

          <p className="mt-1 text-sm text-[#607080]">
            List of inspections available for verification
          </p>
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

        <div className="rounded-xl border border-[#d7e0ea] bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={filteredRows}
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 50]}
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-8 text-center text-sm text-[#607080]">
                No inspection records found
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CentralInspectionList;
