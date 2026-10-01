import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { FaCheckCircle, FaExclamationCircle, FaEye, FaSearch, FaSpinner, FaTimes } from "react-icons/fa";

interface ReturnItem {
  slNo: number;
  tradeUnionName: string;
  tradeUnionAddress: string;
  yearOfReturn: number;
  applicantEmail: string;
  applicantContactNo: string;
  currentStatus: string;
  email: string;
  phone: string;
  returnYear: number;
  userName: string;
  registrationNo: number;
  userId: number;
  encryptedRowId: string | null;
  encryptedUserId: string | null;
  encryptedRegId: string | null;
  encryptedWizardId: string | null;
}

const AnnualReturnByRegNo: React.FC = () => {
  const navigate = useNavigate();
  const token = getAuthToken() ?? "";

  const [tuNumber, setTuNumber] = useState<string>("");
  const [searchedTuNumber, setSearchedTuNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [headerTitle, setHeaderTitle] = useState<string>("");
  const [rows, setRows] = useState<ReturnItem[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Top Notification Banner (Snackbar)
  const [notification, setNotification] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 4000);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tuNumber.trim()) {
      showNotification("error", "Please enter Trade Union Registration Number");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSearchedTuNumber(tuNumber.trim());
    try {
      const response = await axios.get(
        `${API_BASE}trade-union/action-on-return?tradeUnionNo=${encodeURIComponent(tuNumber.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === "SUCCESS") {
        setHeaderTitle(
          response.data.header || `Annual Returns for Trade Union Registration No : ${tuNumber.trim()}`
        );
        const fetchedRows = response.data.result || [];
        setRows(fetchedRows);
        if (fetchedRows.length === 0) {
          showNotification("error", "No annual return records found for this Trade Union number.");
        } else {
          showNotification("success", `Found ${fetchedRows.length} annual return record(s).`);
        }
      } else {
        showNotification("error", response.data?.message || "Failed to fetch annual returns.");
        setRows([]);
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      showNotification("error", err?.response?.data?.message || "Failed to fetch trade union records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionEdit = (row: ReturnItem) => {
    navigate("/trade-union/tu-fed-final-pdf-admin-end", {
      state: {
        en_reg_id: row.encryptedRegId,
        en_wizard_id: row.encryptedWizardId,
        en_row_id: row.encryptedRowId || row.encryptedWizardId,
        en_user_id: row.encryptedUserId,
        val: "view",
        status: row.currentStatus || "Pending",
        sourceType: "TU_DIRECT",
        requiresAction: true,
      },
    });
  };

  const columns: TableColumn<ReturnItem>[] = [
    {
      name: "SL. NO.",
      selector: (r) => r.slNo,
      width: "80px",
    },
    {
      name: "TRADE UNION NAME",
      cell: (r) => <span className="font-medium text-gray-800 break-words">{r.tradeUnionName || "-"}</span>,
      minWidth: "180px",
    },
    {
      name: "TRADE UNION ADDRESS",
      cell: (r) => <span className="text-gray-700 text-xs break-words">{r.tradeUnionAddress || "-"}</span>,
      minWidth: "220px",
    },
    {
      name: "YEAR OF RETURN",
      selector: (r) => r.yearOfReturn || r.returnYear,
      width: "140px",
    },
    {
      name: "APPLICANT EMAIL",
      cell: (r) => <span className="break-all text-gray-700 text-xs">{r.applicantEmail || r.email || "-"}</span>,
      minWidth: "180px",
    },
    {
      name: "APPLICANT CONTACT NO",
      cell: (r) => <span>{r.applicantContactNo || r.phone || "-"}</span>,
      width: "160px",
    },
    {
      name: "CURRENT STATUS",
      cell: (r) => (
        <span className="text-xs font-medium text-gray-800">
          {r.currentStatus || "Pending for Approval"}
        </span>
      ),
      width: "160px",
    },
    {
      name: "ACTION",
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleActionEdit(row)}
          className="text-[#3c8dbc] hover:text-[#357ca5] font-medium text-sm flex items-center gap-1 hover:underline focus:outline-none"
        >
          <FaEye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="bg-[#eef1f4] min-h-screen p-4 md:p-6">
      {/* PAGE TITLE */}
      <h1 className="text-xl font-semibold mb-4 text-gray-800">
        Trade Union Master List
      </h1>

      {/* SNACKBAR / NOTIFICATION BANNER */}
      {notification.type && (
        <div
          className={`mb-4 px-4 py-3 rounded flex items-center justify-between shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-[#00a65a] text-white"
              : "bg-[#dd4b39] text-white"
          }`}
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            {notification.type === "success" ? (
              <FaCheckCircle className="w-4 h-4" />
            ) : (
              <FaExclamationCircle className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification({ type: null, message: "" })}
            className="text-white hover:opacity-75 focus:outline-none"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP SEARCH SECTION */}
      <div className="bg-white border border-[#ddd] border-t-[3px] border-t-[#3c8dbc] rounded shadow-sm mb-6 max-w-md">
        <form onSubmit={handleSearch} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Trade Union Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={tuNumber}
              onChange={(e) => setTuNumber(e.target.value)}
              placeholder="e.g. 797"
              className="w-full px-3 py-1.5 text-sm border border-[#a6a6a6] rounded-sm focus:outline-none focus:border-[#3c8dbc]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#3c8dbc] hover:bg-[#357ca5] text-white px-5 py-1.5 rounded-sm text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 uppercase"
          >
            {loading ? (
              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FaSearch className="w-3.5 h-3.5" />
            )}
            <span>SEARCH</span>
          </button>
        </form>
      </div>

      {/* BOTTOM RESULTS TABLE SECTION (BELOW SEARCH) */}
      <div className="bg-white border border-[#ddd] border-t-[3px] border-t-[#3c8dbc] rounded shadow-sm overflow-hidden">
        {headerTitle ? (
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-normal text-gray-800">
              {headerTitle}
            </h2>
          </div>
        ) : (
          <div className="bg-[#3c8dbc] text-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wide">
            Trade Union Information
          </div>
        )}

        <div className="p-2 md:p-4">
          <DataTable
            columns={columns}
            data={rows}
            pagination={false}
            progressPending={loading}
            progressComponent={
              <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
                <FaSpinner className="w-5 h-5 animate-spin text-[#3c8dbc]" />
                <span className="text-sm font-medium">Searching annual returns...</span>
              </div>
            }
            noDataComponent={
              <div className="p-10 text-center text-gray-500 text-sm">
                {hasSearched
                  ? `No annual returns found for Trade Union Registration No : ${searchedTuNumber}`
                  : "Enter a Trade Union Number above and click SEARCH to display return records."}
              </div>
            }
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: "#3c8dbc",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                },
              },
              rows: {
                style: {
                  fontSize: "13px",
                },
              },
              cells: {
                style: {
                  borderRight: "1px solid #eee",
                  borderBottom: "1px solid #eee",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnualReturnByRegNo;
