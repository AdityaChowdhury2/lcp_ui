import { API_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  AlertCircle,
  ChevronDown,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import ReportDatePicker from "@/Components/ReportDatePicker";

interface DistrictOption {
  id: number;
  code: number;
  name: string;
}

interface SubdivisionOption {
  code: number | string;
  districtCode: number;
  name: string;
}

interface ReportApiRow {
  particular?: string;
  values?: Record<string, unknown>;
}

interface ReportResponse {
  reportName?: string;
  filters?: {
    service?: string;
    district?: string;
    subDivision?: string;
    fromDate?: string;
    toDate?: string;
  };
  columns?: string[];
  rows?: ReportApiRow[];
}

interface TableRow {
  particular: string;
  [key: string]: string | number;
}

interface FieldErrors {
  service?: string;
  district?: string;
  fromDate?: string;
  toDate?: string;
}


const ALL_DISTRICT_CODE = "24";

const SERVICE_OPTIONS: Record<string, string> = {
  "0001": "Registration of Principal Employer under CLRA",
  "0011": "Amendment of Registration Certificate for PE under CLRA",
  "0004": "Registration of Establishments under BOCWA",
  "0014": "Amendment of Registration Certificate of Establishments under BOCWA",
  "0005": "Est. Registration under MTW",
  "0007": "Registration of Principal Employer under ISMW",
  "0002": "License of Contractor under CLRA",
  "0003": "Renewal of License of Contractor under CLRA",
  "0009": "License of Employment under ISMW",
  "0008": "License of Recruitment under ISMW",
};

const SERVICES_WITHOUT_DEEMED_APPROVAL = new Set(["0014", "0003", "0009", "0008"]);

const COLUMN_HEADERS: Record<string, string> = {
  "Total Application": "TOTAL APPLICATION",
  "Pending with Citizen": "PENDING WITH CITIZEN",
  "Pending in Office": "PENDING IN OFFICE",
  "Transaction Successful but Form Pending":
    "TRANSACTION SUCCESSFUL BUT FORM-I PENDING",
  Issued: "ISSUED",
  Rejected: "REJECTED",
  "Deemed Approved": "DEEMED APPROVAL / AUTO-GENERATED",
  // TOTAL: "TOTAL",
};

const HIGHLIGHT_COLUMNS = new Set([
  "Total Application",
  "Issued",
  "Rejected",
]);

const LOCATION_COL_WIDTH = "168px";

const TABLE_STYLES = `
  .analytical-report-table .rdt_Table {
    width: 100% !important;
    min-width: 100% !important;
    table-layout: fixed;
  }
  .analytical-report-table .rdt_TableHeadRow,
  .analytical-report-table .rdt_TableRow {
    width: 100% !important;
  }
  .analytical-report-table .rdt_TableCol,
  .analytical-report-table .rdt_TableCell {
    min-width: 0 !important;
    white-space: normal !important;
    overflow: hidden !important;
    word-break: break-word;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
  .analytical-report-table .rdt_TableHeadRow .rdt_TableCol:first-child,
  .analytical-report-table .rdt_TableRow .rdt_TableCell:first-child {
    flex: 0 0 ${LOCATION_COL_WIDTH} !important;
    width: ${LOCATION_COL_WIDTH} !important;
    max-width: ${LOCATION_COL_WIDTH} !important;
    min-width: ${LOCATION_COL_WIDTH} !important;
    justify-content: flex-start !important;
    text-align: left !important;
  }
  .analytical-report-table .rdt_TableHeadRow .rdt_TableCol:not(:first-child),
  .analytical-report-table .rdt_TableRow .rdt_TableCell:not(:first-child) {
    flex: 1 1 0 !important;
    width: auto !important;
    max-width: none !important;
    min-width: 0 !important;
    justify-content: center !important;
    text-align: center !important;
    align-items: center !important;
  }
`;

const controlClass =
  "h-9 w-full rounded border border-[#d2d6de] bg-white px-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/25 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const invalidControlClass =
  "border-red-500 focus:border-red-500 focus:ring-red-200";

function fieldClass(hasError: boolean) {
  return `${controlClass} ${hasError ? invalidControlClass : ""}`;
}

const isDeemedApprovalColumn = (column: string) =>
  column.toLowerCase().includes("deemed");

const getVisibleReportColumns = (columns: string[], service: string) => {
  const withoutTotalColumn = columns.filter(
    (column) => column.trim().toUpperCase() !== "TOTAL",
  );

  if (!SERVICES_WITHOUT_DEEMED_APPROVAL.has(service)) {
    return withoutTotalColumn;
  }

  return withoutTotalColumn.filter((column) => !isDeemedApprovalColumn(column));
};

const sanitizeColumnKey = (column: string) =>
  column
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDisplayParticular = (value: string) => SERVICE_OPTIONS[value] ?? value;

const appendTotalRow = (rows: TableRow[], columns: string[]): TableRow[] => {
  if (!rows.length) return rows;

  const totalRow: TableRow = {
    particular: "Total",
    isTotal: 1,
  };

  columns.forEach((column) => {
    const accessor = sanitizeColumnKey(column);
    totalRow[accessor] = rows.reduce(
      (sum, row) => sum + toNumber(row[accessor]),
      0,
    );
  });

  return [...rows, totalRow];
};

const buildTableRows = (response: ReportResponse): TableRow[] => {
  const columns = Array.isArray(response.columns) ? response.columns : [];
  const rows = Array.isArray(response.rows) ? response.rows : [];

  return rows.map((row) => {
    const values = row.values && typeof row.values === "object" ? row.values : {};

    const mappedRow: TableRow = {
      particular: getDisplayParticular(String(row.particular ?? "")),
    };

    columns.forEach((column) => {
      mappedRow[sanitizeColumnKey(column)] = toNumber(values[column]);
    });

    return mappedRow;
  });
};

const buildTableColumns = (
  reportColumns: string[],
  service = "",
  locationHeader = "SUB DIVISION NAME",
): TableColumn<TableRow>[] => {
  const visibleColumns = getVisibleReportColumns(reportColumns, service);

  const baseColumn: TableColumn<TableRow> = {
    name: locationHeader,
    selector: (row) => row.particular,
    grow: 0,
    wrap: true,
    cell: (row) => (
      <div className={`w-full py-1 text-left ${row.isTotal ? "font-bold" : ""}`}>
        {row.particular}
      </div>
    ),
  };

  const dynamicColumns: TableColumn<TableRow>[] = visibleColumns.map((column) => {
    const accessor = sanitizeColumnKey(column);
    const header = COLUMN_HEADERS[column] ?? column.toUpperCase();
    const highlight = HIGHLIGHT_COLUMNS.has(column);

    return {
      name: (
        <p className="w-full whitespace-normal p-1 text-center leading-snug">
          {header}
        </p>
      ),
      selector: (row) => Number(row[accessor] ?? 0),
      grow: 1,
      center: true,
      wrap: true,
      cell: (row) => (
        <div
          className={`w-full text-center ${row.isTotal ? "font-bold" : ""} ${
            highlight ? "text-[#c17a3a]" : ""
          }`}
        >
          {row[accessor] ?? 0}
        </div>
      ),
    };
  });

  return [baseColumn, ...dynamicColumns];
};

const defaultTableColumns: TableColumn<TableRow>[] = [
  {
    name: "SUB DIVISION NAME",
    selector: (row) => row.particular,
    grow: 2,
    wrap: true,
    cell: (row) => <div className="py-1">{row.particular}</div>,
  },
];

const LcAnalyticalReport: React.FC = () => {
  const [service, setService] = useState("");
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [subdivisions, setSubdivisions] = useState<SubdivisionOption[]>([]);
  const [selectedDistId, setSelectedDistId] = useState("");
  const [selectedSubdivId, setSelectedSubdivId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [tableColumns, setTableColumns] =
    useState<TableColumn<TableRow>[]>(defaultTableColumns);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await axios.get(`${API_BASE}district`);
        const distList: DistrictOption[] = Array.isArray(res.data)
          ? res.data.map((district: any) => ({
              id: Number(district.id),
              code: Number(district.district_code),
              name: String(district.district_name ?? ""),
            }))
          : [];

        setDistricts(distList);
      } catch (err) {
        console.error("District API error:", err);
        setDistricts([]);
      }
    };

    loadDistricts();
  }, []);

  const resetReportState = () => {
    setTableData([]);
    setTableColumns(defaultTableColumns);
    setFieldErrors({});
    setFetchError(false);
    setHasSearched(false);
  };

  const fetchSubdivisions = async (districtCode: string) => {
    if (!districtCode || districtCode === ALL_DISTRICT_CODE) {
      setSubdivisions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}subdivision/${districtCode}`);
      const subdivisionList: SubdivisionOption[] = Array.isArray(res.data)
        ? res.data.map((subdivision: any) => ({
            code: subdivision.sub_div_code,
            districtCode: Number(subdivision.district_code),
            name: String(subdivision.sub_div_name ?? ""),
          }))
        : [];

      setSubdivisions(subdivisionList);
    } catch (err) {
      console.error("Subdivision API error:", err);
      setSubdivisions([]);
    }
  };

  const handleDistrictChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const districtCode = event.target.value;

    setSelectedDistId(districtCode);
    setSelectedSubdivId("");
    setSubdivisions([]);
    resetReportState();

    if (!districtCode || districtCode === ALL_DISTRICT_CODE) {
      return;
    }

    await fetchSubdivisions(districtCode);
  };

  const handleSubdivisionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSubdivId(event.target.value);
    resetReportState();
  };

  const generateReport = async (event?: React.FormEvent) => {
    event?.preventDefault();

    const nextErrors: FieldErrors = {};

    if (!service) {
      nextErrors.service = "Service is required";
    }

    if (!selectedDistId) {
      nextErrors.district = "District is required";
    }

    if (!fromDate) {
      nextErrors.fromDate = "From Date is required";
    }

    if (!toDate) {
      nextErrors.toDate = "To Date is required";
    } else if (fromDate && fromDate > toDate) {
      nextErrors.toDate = "To Date cannot be earlier than From Date";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setTableData([]);
      return;
    }

    try {
      setLoading(true);
      setFetchError(false);
      setHasSearched(true);

      const payload = {
        reportName: "ANALYTICAL_REPORT",
        service,
        district: selectedDistId,
        subDivision: selectedSubdivId,
        fromDate,
        toDate,
      };

      const res = await axios.post<ReportResponse>(
        `${API_BASE}reports/administrative`,
        payload,
      );

      const response = res.data ?? {};
      const reportColumns = Array.isArray(response.columns) ? response.columns : [];
      const visibleColumns = getVisibleReportColumns(reportColumns, service);
      const locationHeader =
        selectedDistId === ALL_DISTRICT_CODE
          ? "DISTRICT NAME"
          : "SUB DIVISION NAME";
      const mappedRows = appendTotalRow(buildTableRows(response), visibleColumns);

      setTableColumns(buildTableColumns(reportColumns, service, locationHeader));
      setTableData(mappedRows);
    } catch (err) {
      console.error("Analytical report API error:", err);
      setTableData([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const showTable = !loading && !fetchError && tableData.length > 0;

  return (
    <div className="min-h-screen p-3 md:p-4">
      <style>{TABLE_STYLES}</style>
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-gray-800 md:text-2xl">
        Analytical Report
      </h1>

      <div className="flex flex-col gap-4">
        {/* Filter Panel */}
        <div className="overflow-visible rounded-[3px] border border-gray-200 border-t-[3px] border-t-[#3c8dbc] bg-white p-4 shadow-sm md:p-5">
          <form onSubmit={generateReport} className="space-y-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[1.5fr_1fr_1fr]">
              {/* Service */}
              <div >
                <label
                  htmlFor="service"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  Select Services <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="service"
                    className={`${fieldClass(!!fieldErrors.service)} appearance-none pr-8`}
                    value={service}
                    onChange={(event) => {
                      setService(event.target.value);
                      resetReportState();
                    }}
                  >
                    <option value="">- Select -</option>
                    {Object.entries(SERVICE_OPTIONS).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
                {fieldErrors.service && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.service}</p>
                )}
              </div>

              {/* District */}
              <div>
                <label
                  htmlFor="district"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  Select District <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="district"
                    className={`${fieldClass(!!fieldErrors.district)} appearance-none pr-8`}
                    value={selectedDistId}
                    onChange={handleDistrictChange}
                  >
                    <option value="">- Select -</option>
                    {districts.map((district) => (
                      <option key={district.id} value={String(district.code)}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
                {fieldErrors.district && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.district}</p>
                )}
              </div>

              {/* Subdivision */}
              <div>
                <label
                  htmlFor="subdivision"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  Select Subdivision
                </label>
                <div className="relative">
                  <select
                    id="subdivision"
                    className={`${controlClass} appearance-none pr-8`}
                    value={selectedSubdivId}
                    onChange={handleSubdivisionChange}
                    disabled={!selectedDistId || selectedDistId === ALL_DISTRICT_CODE}
                  >
                    <option value="">
                      {!selectedDistId
                        ? "Select District First"
                        : selectedDistId === ALL_DISTRICT_CODE
                          ? "Subdivision not applicable for ALL"
                          : "- Select Sub-division -"}
                    </option>
                    {subdivisions.map((subdivision) => (
                      <option
                        key={String(subdivision.code)}
                        value={String(subdivision.code)}
                      >
                        {subdivision.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-12">
              {/* From Date */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="fromDate"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  From Date <span className="text-red-500">*</span>
                </label>
                <ReportDatePicker
                  id="fromDate"
                  value={fromDate}
                  onChange={(next) => {
                    setFromDate(next);
                    resetReportState();
                  }}
                  rangeEnd={toDate}
                  hasError={!!fieldErrors.fromDate}
                />
                {fieldErrors.fromDate && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.fromDate}</p>
                )}
              </div>

              {/* To Date */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="toDate"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  To Date <span className="text-red-500">*</span>
                </label>
                <ReportDatePicker
                  id="toDate"
                  value={toDate}
                  onChange={(next) => {
                    setToDate(next);
                    resetReportState();
                  }}
                  rangeStart={fromDate}
                  hasError={!!fieldErrors.toDate}
                />
                {fieldErrors.toDate && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.toDate}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded bg-[#3c8dbc] px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#357ca5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c8dbc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "GENERATE"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Report Section */}
        <div className="w-full rounded-[3px] border-t-[3px] border-t-[#3c8dbc] bg-white p-4 shadow">
          {showTable && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-800">
                Analytical Report
              </h2>
            </div>
          )}

          {loading && (
            <div className="py-2">
              {/*<div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-[#3c8dbc]" />
                Generating report…
              </div> */}
              <div className="overflow-hidden rounded border border-gray-200">
                <div className="h-10 animate-pulse bg-[#3c8dbc]/80" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 px-3 py-2 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <div className="h-3 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && fetchError && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">
                Unable to generate report
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Something went wrong while loading the analytical report. Please
                try again.
              </p>
              <button
                type="button"
                onClick={() => generateReport()}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#3c8dbc] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#357ca5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c8dbc] focus-visible:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !fetchError && !hasSearched && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3c8dbc]/10 text-[#3c8dbc]">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">
                Generate Analytical Report
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Select the required filters and date range, then click Generate to
                view the report.
              </p>
            </div>
          )}

          {!loading && !fetchError && hasSearched && tableData.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">
                No records found
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                No report records were found for the selected filters and date
                range.
              </p>
            </div>
          )}

          {showTable && (
            <div className="analytical-report-table w-full">
              <DataTable
                columns={tableColumns}
                data={tableData}
                dense
                highlightOnHover
                striped
                conditionalRowStyles={[
                  {
                    when: (row) => Number(row.isTotal) === 1,
                    style: {
                      fontWeight: 700,
                    },
                  },
                ]}
                customStyles={{
                  table: {
                    style: {
                      width: "max-content",
                      minWidth: "100%",
                    },
                  },
                  responsiveWrapper: {
                    style: {
                      overflowX: "auto",
                      width: "100%",
                    },
                  },
                  headCells: {
                    style: {
                      backgroundColor: "#3c8dbc",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "11px",
                      whiteSpace: "normal",
                      wordBreak: "normal",
                      overflowWrap: "break-word",
                      overflow: "hidden",
                      lineHeight: "1.25",
                      justifyContent: "center",
                      textAlign: "center",
                    },
                  },
                  cells: {
                    style: {
                      whiteSpace: "normal",
                      wordBreak: "normal",
                      overflow: "hidden",
                      justifyContent: "center",
                    },
                  },
                  rows: {
                    style: {
                      fontSize: "12px",
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LcAnalyticalReport;
