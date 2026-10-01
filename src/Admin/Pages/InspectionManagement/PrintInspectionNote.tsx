import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";

import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";

interface ActItem {
  sl: number;
  actName: string;
}

const customStyles = {
  table: { style: { border: "1px solid #d7e0ea" } },
  headRow: {
    style: {
      backgroundColor: "#3b8dbc",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      minHeight: "42px",
      textTransform: "uppercase" as const,
    },
  },
  headCells: { style: { borderRight: "1px solid #d7e0ea" } },
  rows: {
    style: { fontSize: "13px", minHeight: "38px" },
    stripedStyle: { backgroundColor: "#f9fbfd" },
  },
  cells: { style: { borderRight: "1px solid #d7e0ea" } },
};

const PrintInspectionNote: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [downloadingAct, setDownloadingAct] = useState<string | null>(null);
  const [acts, setActs] = useState<ActItem[]>([]);

  const fetchActs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}inspections/law/get-laws`);
      const rawData: any[] = res.data?.data || [];

      // Extract unique act names (inspection_name)
      const uniqueNames = Array.from(
        new Set(
          rawData
            .map((item) => item.inspection_name?.trim())
            .filter((name) => !!name)
        )
      );

      const formattedActs = uniqueNames.map((name, index) => ({
        sl: index + 1,
        actName: name,
      }));

      setActs(formattedActs);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load acts list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActs();
  }, []);

  const handleDownload = async (actName: string) => {
    try {
      setDownloadingAct(actName);
      const userId = getUserId();
      const response = await axios.get(
        `${API_BASE}inspections/generate-generic-inspection-note/pdf`,
        {
          params: { actName, userId },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Inspection_Note_${actName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download Inspection Note PDF");
    } finally {
      setDownloadingAct(null);
    }
  };

  const columns: TableColumn<ActItem>[] = [
    {
      name: "SL.NO.",
      selector: (row) => row.sl,
      width: "90px",
      center: true,
    },
    {
      name: "ACT NAME",
      selector: (row) => row.actName,
      grow: 1,
      wrap: true,
    },
    {
      name: "DOWNLOAD",
      center: true,
      width: "160px",
      cell: (row) => (
        <button
          onClick={() => handleDownload(row.actName)}
          disabled={downloadingAct === row.actName}
          className="inline-flex items-center gap-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <FaDownload />
          {downloadingAct === row.actName ? "Downloading..." : "Download"}
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[#f4f6f9] min-h-screen">
      <div className="mx-auto max-w-7xl bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        {/* Header section matching styling */}
        <div className="bg-[#fcfcfc] border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-medium text-slate-800 tracking-tight">
            PRINT INSPECTION NOTE
          </h2>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <DataTable
            columns={columns}
            data={acts}
            progressPending={loading}
            striped
            highlightOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="p-8 text-center text-slate-500 text-sm">
                No Acts found in the system
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PrintInspectionNote;
