import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";
import React, { FC, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Eye, Search, RotateCcw, Filter, ListFilter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DistrictOption {
  districtCode: number;
  districtName: string;
}

interface AnnualReturnRow {
  id: string;
  reg_no: string;
  year: string;
  name: string;
  district: string;
  email?: string;
  phone?: string;
  submission_date: string;
  status: string;
  sourceType: "TU_DIRECT" | "CTU_FORWARDED";
  sourceLabel: string;
  requiresAction: boolean;
  en_reg_id: string;
  en_wizard_id: string;
  en_row_id: string;
  en_user_id: string | null;
  val: string;
}

const tabToStatusMap: Record<string, string> = {
  All: "ALL",
  Pending: "Pending",
  Approved: "Approved",
  "Send Back": "Send Back",
};

const ActionOnReturn: FC = () => {
  const navigate = useNavigate();
  const token = getAuthToken() ?? "";

  const [tabValue, setTabValue] = useState<string>("Pending");
  const [tableData, setTableData] = useState<AnnualReturnRow[]>([]);
  const [allTableData, setAllTableData] = useState<AnnualReturnRow[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  // Filters
  const [unionType, setUnionType] = useState<string>("T");
  const [year, setYear] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [tradeUnionNo, setTradeUnionNo] = useState<string>("");
  const [tradeUnionName, setTradeUnionName] = useState<string>("");
  const [districts, setDistricts] = useState<DistrictOption[]>([]);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const tabHeaders: Record<string, string> = {
    All: "All Annual Returns (Admin)",
    Pending: "Pending Annual Returns (Admin)",
    Approved: "Approved Annual Returns (Admin)",
    "Send Back": "Returned Annual Returns (Admin)",
  };

  // Fetch districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`${API_BASE}trade-union/master-list/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const rawList = Array.isArray(data?.result)
          ? data.result
          : Array.isArray(data)
            ? data
            : [];

        const formatted: DistrictOption[] = rawList
          .map((item: any) => ({
            districtCode: Number(item.districtCode ?? item.district_code),
            districtName: String(item.districtName ?? item.district_name ?? ""),
          }))
          .filter((d: DistrictOption) => d.districtCode > 0 && d.districtCode !== 99 && Boolean(d.districtName));

        setDistricts(formatted);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
    };
    void fetchDistricts();
  }, [token]);

  const customTableStyles = {
    headRow: {
      style: {
        backgroundColor: "#2c5f8a",
        color: "#ffffff",
        minHeight: "42px",
      },
    },
    headCells: {
      style: {
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
        paddingLeft: "12px",
        paddingRight: "12px",
        borderRight: "1px solid rgba(255, 255, 255, 0.15)",
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        color: "#334155",
        minHeight: "44px",
        "&:nth-of-type(odd)": {
          backgroundColor: "#ffffff",
        },
        "&:nth-of-type(even)": {
          backgroundColor: "#f8fafc",
        },
        "&:hover": {
          backgroundColor: "#eef6fc",
          transition: "all 0.15s ease",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "12px",
        paddingRight: "12px",
        borderRight: "1px solid #f1f5f9",
        borderBottom: "1px solid #e2e8f0",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e2e8f0",
        fontSize: "13px",
        color: "#475569",
      },
    },
  };

  const columns: TableColumn<AnnualReturnRow>[] = [
    {
      name: "SL NO.",
      width: "75px",
      cell: (_row, index) => (
        <span className="font-semibold text-slate-600">
          {(page - 1) * limit + ((index ?? 0) + 1)}
        </span>
      ),
    },
    {
      name: "REG. NO.",
      selector: (row) =>
        encryptionDecryptionFun("decrypt", row.en_reg_id) || row.reg_no,
      sortable: true,
      width: "110px",
      cell: (row) => (
        <span className="font-semibold text-slate-800">
          {encryptionDecryptionFun("decrypt", row.en_reg_id) || row.reg_no}
        </span>
      ),
    },
    {
      name: "YEAR",
      selector: (row) => row.year,
      sortable: true,
      width: "90px",
      cell: (row) => <span className="font-medium text-slate-700">{row.year}</span>,
    },
    {
      name: "NAME",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
      minWidth: "300px",
      grow: 2,
      cell: (row) => (
        <span className="font-medium text-slate-800 py-1.5 leading-snug">
          {row.name}
        </span>
      ),
    },
    {
      name: "DISTRICT",
      selector: (row) => row.district,
      sortable: true,
      wrap: true,
      minWidth: "140px",
      cell: (row) => <span className="text-slate-700">{row.district}</span>,
    },
    {
      name: "EMAIL",
      selector: (row) => row.email || "-",
      sortable: true,
      wrap: true,
      minWidth: "170px",
      cell: (row) => <span className="text-slate-600 text-xs">{row.email || "-"}</span>,
    },
    {
      name: "PHONE NO.",
      selector: (row) => row.phone || "-",
      sortable: true,
      minWidth: "130px",
      cell: (row) => <span className="text-slate-700">{row.phone || "-"}</span>,
    },
    {
      name: "SUBMISSION DATE",
      selector: (row) => row.submission_date,
      sortable: true,
      minWidth: "140px",
      cell: (row) => <span className="text-slate-700">{row.submission_date}</span>,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
      width: "120px",
      cell: (row) => {
        const isPending = row.status === "Pending";
        const isApproved = row.status === "Approved";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPending
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : isApproved
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      name: "ACTION",
      width: "110px",
      cell: (row) => (
        <button
          type="button"
          className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1 rounded text-xs flex items-center gap-1.5 font-medium shadow-sm transition-all cursor-pointer active:scale-95"
          onClick={() =>
            navigate("/trade-union/tu-fed-final-pdf-admin-end", {
              state: {
                en_reg_id: row.en_reg_id,
                en_wizard_id: row.en_wizard_id,
                en_row_id: row.en_row_id,
                en_user_id: row.en_user_id,
                val: row.val,
                status: row.status,
                sourceType: row.sourceType,
                requiresAction: row.requiresAction,
              },
            })
          }
        >
          <Eye size={14} /> EDIT
        </button>
      ),
    },
  ];

  const fetchAnnualReturns = async () => {
    if (!token) {
      setErrorMsg("Authentication error. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const status = tabToStatusMap[tabValue];
      const params = new URLSearchParams({
        status,
        page: String(page),
        limit: String(limit),
        val: unionType,
      });

      if (year.trim()) {
        params.set("year", year.trim());
      }
      if (districtCode.trim()) {
        params.set("districtCode", districtCode.trim());
      }
      const regNo = Number(tradeUnionNo.trim());
      if (tradeUnionNo.trim() && Number.isFinite(regNo) && regNo > 0) {
        params.set("tradeUnionNo", String(regNo));
      }
      if (tradeUnionName.trim()) {
        params.set("name", tradeUnionName.trim());
      }

      const response = await fetch(
        `${API_BASE}trade-union/admin/annual-returns?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Failed to load annual returns");
      }

      const formattedData: AnnualReturnRow[] =
        result.data?.map((item: any) => {
          const decryptedRegNo = encryptionDecryptionFun("decrypt", item.en_reg_id);
          const decryptedWizardId = encryptionDecryptionFun("decrypt", item.en_wizard_id);

          return {
            id: String(item.id),
            reg_no: decryptedRegNo || String(item.regNo ?? ""),
            year: decryptedWizardId || String(item.year ?? ""),
            name: item.name,
            district: item.district,
            email: item.email || item.applicantEmail || "-",
            phone: item.phone || item.applicantContactNo || "-",
            submission_date: (() => {
              if (!item.submissionDate) return "-";
              const num = Number(item.submissionDate);
              if (!isNaN(num) && num > 0) {
                const ms = num < 10000000000 ? num * 1000 : num;
                const d = new Date(ms);
                return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB");
              }
              const d = new Date(item.submissionDate);
              return isNaN(d.getTime()) ? String(item.submissionDate) : d.toLocaleDateString("en-GB");
            })(),
            status: item.status,
            sourceType: item.sourceType,
            sourceLabel:
              item.sourceType === "TU_DIRECT"
                ? "Submitted by TU"
                : "Approved by CTU",
            requiresAction: Boolean(item.requiresAction),
            en_reg_id: item.en_reg_id,
            en_wizard_id: item.en_wizard_id,
            en_row_id: item.en_row_id,
            en_user_id: item.en_user_id,
            val: item.val || unionType,
          };
        }) ?? [];

      setAllTableData(formattedData);
      setTableData(formattedData);
      setTotalRows(result.pagination?.total || 0);
    } catch (error: any) {
      setAllTableData([]);
      setTableData([]);
      setTotalRows(0);
      setErrorMsg(error?.message || "Failed to load annual returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnnualReturns();
  }, [tabValue, page, limit]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setTableData(allTableData);
    } else {
      const filtered = allTableData.filter(
        (item) =>
          item.reg_no?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.district?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.year?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sourceLabel?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.status?.toLowerCase().includes(searchText.toLowerCase()),
      );
      setTableData(filtered);
    }
  }, [searchText, allTableData]);

  const handleSearchFilters = () => {
    setPage(1);
    void fetchAnnualReturns();
  };

  const handleResetFilters = () => {
    setUnionType("T");
    setYear("");
    setDistrictCode("");
    setTradeUnionNo("");
    setTradeUnionName("");
    setPage(1);
    setSearchText("");
    void fetchAnnualReturns();
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  return (
    <div className="w-full px-4 md:px-6 py-4 font-sans text-slate-800">
      <h1 className="text-[22px] md:text-[24px] font-semibold text-slate-800 mb-4 tracking-tight">
        Trade Union Annual Return
      </h1>

      {/* FILTERS CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden mb-5">
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-200" />
          <span>FILTER SEARCH CRITERIA</span>
        </div>

        <div className="px-5 py-4">
          {/* First Line Filters: Type of Union, Year, District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 items-end">
            {/* 1. Type of Union */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type of Union
              </label>
              <select
                value={unionType}
                onChange={(e) => setUnionType(e.target.value)}
                className="h-[36px] w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20 transition-all bg-white text-slate-800 shadow-sm"
              >
                <option value="T">Trade Union</option>
                <option value="F">Federation</option>
              </select>
            </div>

            {/* 2. Year */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-[36px] w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20 transition-all bg-white text-slate-800 shadow-sm"
              >
                <option value="">- Select Year -</option>
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. District */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                District
              </label>
              <select
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                className="h-[36px] w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20 transition-all bg-white text-slate-800 shadow-sm"
              >
                <option value="">- Select District -</option>
                {districts.map((dst) => (
                  <option key={dst.districtCode} value={dst.districtCode}>
                    {dst.districtName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Line Filters: Trade Union Number, Trade Union Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            {/* 4. Trade Union Number */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trade Union Number
              </label>
              <input
                type="text"
                value={tradeUnionNo}
                onChange={(e) => setTradeUnionNo(e.target.value)}
                className="h-[36px] w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20 transition-all bg-white text-slate-800 shadow-sm"
                placeholder="Registration number"
              />
            </div>

            {/* 5. Trade Union Name */}
            <div>
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trade Union Name
              </label>
              <input
                type="text"
                value={tradeUnionName}
                onChange={(e) => setTradeUnionName(e.target.value)}
                className="h-[36px] w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20 transition-all bg-white text-slate-800 shadow-sm"
                placeholder="Trade Union name"
              />
            </div>
          </div>

          {/* Search & Reset Buttons Pushed Right */}
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSearchFilters}
              className="px-5 py-2 text-[13px] bg-[#3c8dbc] hover:bg-[#357ca5] text-white font-semibold uppercase rounded shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2 text-[13px] bg-[#f39c12] hover:bg-[#d8890f] text-white font-semibold uppercase rounded shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {errorMsg ? <p className="text-red-600 text-sm mt-3">{errorMsg}</p> : null}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 text-[13px] font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-sky-200" />
            <span className="uppercase tracking-wide">{tabHeaders[tabValue]}</span>
          </div>
        </div>

        <div className="flex justify-between items-center px-4 py-3 flex-wrap gap-3 border-b border-slate-200 bg-slate-50/70">
          <div className="relative w-full max-w-[320px]">
            <input
              type="text"
              placeholder="Search in results..."
              className="h-[36px] w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20 transition-all bg-white shadow-inner text-slate-800"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap border border-slate-300 rounded-md overflow-hidden text-sm font-medium shadow-sm bg-white">
            {Object.keys(tabToStatusMap).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                className={`px-3.5 py-1.5 transition-colors cursor-pointer text-xs font-semibold ${
                  tabValue === tabKey
                    ? "bg-[#3c8dbc] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => {
                  setTabValue(tabKey);
                  setPage(1);
                }}
              >
                {tabKey}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <DataTable
            columns={columns}
            data={tableData}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            onChangePage={(newPage) => setPage(newPage)}
            onChangeRowsPerPage={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            paginationDefaultPage={page}
            customStyles={customTableStyles}
            highlightOnHover
          />
        </div>
      </div>
    </div>
  );
};

export default ActionOnReturn;
