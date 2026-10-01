import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { Eye, Search } from "lucide-react";
import { API_BASE } from "@/constants/constants";
import { getAuthToken, getUserId } from "@/utils/auth";

interface ScheduledInspectionRow {
  id: number;
  scheduleId: string;
  cisId: string | null;
  estId: string | null;
  estSource: string;
  scheduleDate: string;
  fromDate: string;
  toDate: string;
  actCode: string;
  registrationNumber: string | null;
  mapStatus: string;
  status: string | null;
  establishmentName: string | null;
  establishmentType: string | null;
  riskCategory: string | null;
  location: {
    address: string | null;
    district: string | null;
    subdivision: string | null;
    areaType: string | null;
    villageWard: string | null;
    blockMunicipality: string | null;
    policeStation: string | null;
    pincode: number | null;
  };
}

interface ScheduledInspectionListResponse {
  data: ScheduledInspectionRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const tableStyles = {
  headCells: {
    style: {
      background: "#1E73BE",
      color: "white",
      fontWeight: 600,
      fontSize: "12px",
      borderRight: "1px solid #c9c9c9",
      wordBreak: "break-word" as const,
      overflow: "visible",
      textOverflow: "unset",
      overflowWrap: "break-word" as const,
      display: "block",
      maxWidth: "none",
      whiteSpace: "normal",
      lineHeight: "1.2",
      paddingTop: "8px",
      paddingBottom: "8px",
    },
  },
  rows: {
    style: {
      fontSize: "12px",
      borderBottom: "1px solid #e5e7eb",
    },
  },
  cells: {
    style: {
      paddingTop: "12px",
      paddingBottom: "12px",
      borderRight: "1px solid #e5e7eb",
    },
  },
};

const formatDisplayDate = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatValidityPeriod = (fromDate: string, toDate: string) => {
  if (!fromDate && !toDate) return "-";
  return `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`;
};

const displayRegistrationNumber = (value: string | null | undefined) =>
  value && String(value).trim() ? String(value).trim() : "Not registered";

const isNonLcRow = (row: ScheduledInspectionRow) =>
  String(row.estSource || "").trim().toUpperCase() === "OTHER" || !row.estId;

const sourceLabel = (row: ScheduledInspectionRow) =>
  isNonLcRow(row) ? "Other" : "LC";

const display = (value: unknown) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

// Same layout as the "Address of the Establishment" row on the View Details
// page: the raw postal address text, then Ward/Block/Subdivision, then
// PS/District/PIN.
const formatAddressLines = (location: ScheduledInspectionRow["location"]) => [
  ...(location?.address ? [location.address] : []),
  `Ward - ${display(location?.villageWard)}, Block/Municipality - ${display(
    location?.blockMunicipality,
  )}, ${display(location?.subdivision)},`,
  `PS - ${display(location?.policeStation)}, ${display(location?.district)}, PIN - ${display(
    location?.pincode,
  )}, West Bengal`,
];

const formatAddress = (location: ScheduledInspectionRow["location"]) =>
  formatAddressLines(location).join(" ");

const displayStatus = (status?: string | null) => {
  switch ((status || "").trim().toLowerCase()) {
    case "received":
      return "Pending";
    case "draft":
      return "In Process";
    default:
      return status || "";
  }
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const statusLabelClass = (status?: string | null) => {
  switch ((status || "").trim().toLowerCase()) {
    case "received":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "inspector assigned":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "draft":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "final submit":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const StatusLabel: FC<{ status: string | null }> = ({ status }) => {
  if (!status) return <span className="text-gray-400">-</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusLabelClass(status)}`}
    >
      {displayStatus(status)}
    </span>
  );
};

const riskLabelClass = (risk?: string | null) => {
  switch ((risk || "").trim().toUpperCase()) {
    case "HIGH":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "MEDIUM":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "LOW":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const RiskLabel: FC<{ risk: string | null }> = ({ risk }) => {
  if (!risk) return <span className="text-gray-400">-</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${riskLabelClass(risk)}`}
    >
      {risk}
    </span>
  );
};

const sourceLabelClass = (source: string) =>
  source === "Other"
    ? "bg-slate-100 text-slate-800 border-slate-200"
    : "bg-blue-100 text-blue-800 border-blue-200";

const SourceLabel: FC<{ source: string }> = ({ source }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${sourceLabelClass(source)}`}
  >
    {source}
  </span>
);

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "Received", label: "Pending" },
  { value: "Inspector assigned", label: "Inspector assigned" },
  { value: "Draft", label: "In Process" },
  { value: "Submitted", label: "Submitted" },
] as const;

const SOURCE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "LC", label: "LC" },
  { value: "Other", label: "Other" },
] as const;

const LIST_FETCH_LIMIT = 5000;

const rowMatchesSearch = (row: ScheduledInspectionRow, search: string) => {
  if (!search) return true;
  const haystack = [
    row.establishmentName,
    row.establishmentType,
    row.estId,
    displayRegistrationNumber(row.registrationNumber),
    row.scheduleId,
    row.cisId,
    row.status,
    displayStatus(row.status),
    row.riskCategory,
    row.actCode,
    sourceLabel(row),
    formatDisplayDate(row.scheduleDate),
    formatValidityPeriod(row.fromDate, row.toDate),
    ...formatAddressLines(row.location),
  ]
    .filter((value) => value != null && value !== "")
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
};

const ScheduledInspectionList: FC = () => {
  const navigate = useNavigate();

  const [tableData, setTableData] = useState<ScheduledInspectionRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [paginationReset, setPaginationReset] = useState(false);

  const fetchScheduledInspections = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userId = getUserId();
      const response = await axios.get<ScheduledInspectionListResponse>(
        `${API_BASE}inspections/scheduled-inspections`,
        {
          params: { userId, page: 1, limit: LIST_FETCH_LIMIT },
          headers: getAuthHeaders(),
        },
      );

      const rows = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      setTableData(rows);
    } catch (error) {
      setTableData([]);
      setErrorMessage(
        getApiErrorMessage(error, "Failed to load scheduled inspections."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchScheduledInspections();
  }, [fetchScheduledInspections]);

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return tableData.filter((row) => {
      const statusOk =
        statusFilter === "ALL" ||
        (row.status || "").trim().toLowerCase() === statusFilter.toLowerCase();
      const source = sourceLabel(row);
      const sourceOk = sourceFilter === "ALL" || source === sourceFilter;
      return statusOk && sourceOk && rowMatchesSearch(row, search);
    });
  }, [tableData, searchText, statusFilter, sourceFilter]);

  useEffect(() => {
    setPage(1);
    setPaginationReset((prev) => !prev);
  }, [searchText, statusFilter, sourceFilter]);

  const tableColumns: TableColumn<ScheduledInspectionRow>[] = [
    {
      name: <div style={{ whiteSpace: "normal" }}>SL NO.</div>,
      width: "80px",
      selector: (_row, index) => (page - 1) * limit + (index ?? 0) + 1,
      cell: (_row, index) => (
        <div className="w-full">{(page - 1) * limit + (index ?? 0) + 1}</div>
      ),
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>ESTABLISHMENT</div>,
      selector: (row) =>
        `${row.establishmentName || row.estId || ""} ${formatAddress(row.location)}`,
      wrap: true,
      grow: 2,
      minWidth: "260px",
      cell: (row) => (
        <div className="py-1">
          <div className="font-semibold">
            {row.establishmentName || row.estId || "-"}
          </div>
          {formatAddressLines(row.location).map((line, index) => (
            <div key={index} className="text-gray-600">
              {line}
            </div>
          ))}
        </div>
      ),
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>SOURCE</div>,
      selector: (row) => sourceLabel(row),
      cell: (row) => <SourceLabel source={sourceLabel(row)} />,
      minWidth: "90px",
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>REGISTRATION NO.</div>,
      selector: (row) => displayRegistrationNumber(row.registrationNumber),
      cell: (row) => <div>{displayRegistrationNumber(row.registrationNumber)}</div>,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>SCHEDULE DATE</div>,
      selector: (row) => row.scheduleDate,
      cell: (row) => <div>{formatDisplayDate(row.scheduleDate)}</div>,
      minWidth: "120px",
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>VALIDITY PERIOD</div>,
      selector: (row) => formatValidityPeriod(row.fromDate, row.toDate),
      cell: (row) => <div>{formatValidityPeriod(row.fromDate, row.toDate)}</div>,
      minWidth: "170px",
    },
    
    {
      name: <div style={{ whiteSpace: "normal" }}>STATUS</div>,
      selector: (row) => row.status || "",
      cell: (row) => <StatusLabel status={row.status} />,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>RISK</div>,
      selector: (row) => row.riskCategory || "",
      cell: (row) => <RiskLabel risk={row.riskCategory} />,
      minWidth: "110px",
    },
    {
      name: <div style={{ whiteSpace: "normal" }}>ACTION</div>,
      cell: (row) => (
        <button
          type="button"
          className="flex gap-1 bg-green-700 hover:bg-green-800 text-white text-xs rounded-lg px-2 py-1"
          onClick={() =>
            navigate(`/central-inspection/scheduled-inspection/${row.id}`)
          }
        >
          <Eye size={15} /> View Details
        </button>
      ),
      minWidth: "130px",
    },
  ];

  return (
    <div className="w-full bg-[#ededed] pb-5 pl-[20px] pr-5 pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-gray-800">Scheduled Inspections</h1>
      </div>

      <div className="bg-white p-3">
        {errorMessage ? (
          <div className="mb-3 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search establishment, registration, address..."
              className="w-full rounded border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-[#1E73BE] focus:outline-none"
            />
            {searchText ? (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Source:</span>
          {SOURCE_FILTERS.map((filter) => {
            const isActive = sourceFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSourceFilter(filter.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "border-[#1E73BE] bg-[#1E73BE] text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "border-[#1E73BE] bg-[#1E73BE] text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {filteredRows.length}
            </span>{" "}
            of {tableData.length}
          </span>
        </div>

        <DataTable
          columns={tableColumns}
          data={filteredRows}
          pagination
          paginationResetDefaultPage={paginationReset}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          paginationRowsPerPageOptions={[10, 20, 50]}
          onChangePage={(nextPage) => setPage(nextPage)}
          onChangeRowsPerPage={(nextLimit, nextPage) => {
            setLimit(nextLimit);
            setPage(nextPage);
          }}
          progressPending={loading}
          striped
          highlightOnHover
          dense
          responsive
          customStyles={tableStyles}
          noDataComponent="No scheduled inspections found."
        />
      </div>
    </div>
  );
};

export default ScheduledInspectionList;
