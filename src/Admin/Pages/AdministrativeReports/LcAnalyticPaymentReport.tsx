import { API_BASE } from "@/constants/constants";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
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

interface PaymentReportRow {
  serial?: number | null;
  subDivisionName?: string;
  totalAmount?: number;
  [key: string]: unknown;
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
  rows?: PaymentReportRow[];
}

interface FieldErrors {
  service?: string;
  district?: string;
  fromDate?: string;
  toDate?: string;
}

type TableRow = Record<string, string | number>;


const ALL_DISTRICT_CODE = "24";

// const SERVICE_OPTIONS: Record<string, string> = {
//   "1": "Registration of Principal Employer under CLRA",
//   "10": "Amendment of Registration Certificate for PE under CLRA",
//   "2": "Registration of Establishments under BOCWA",
//   "20": "Amendment of Registration Certificate of Establishments under BOCWA",
//   "3": "Est. Registration under MTW",
//   "4": "Registration of Principal Employer under ISMW",
//   "12": "License of Contractor under CLRA",
//   "13": "Renewal of License of Contractor under CLRA",
//   "42": "License of Employment under ISMW",
//   "43": "License of Recruitment under ISMW",
// };
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

const SERVICES_UNDER_DEVELOPMENT = new Set(["0009", "0008"]);

const TABLE_STYLES = `
  .payment-report-table .rdt_Table {
    width: 100% !important;
    min-width: 100% !important;
    table-layout: fixed;
  }
  .payment-report-table .rdt_TableHeadRow,
  .payment-report-table .rdt_TableRow {
    width: 100% !important;
  }
  .payment-report-table .rdt_TableCol,
  .payment-report-table .rdt_TableCell {
    min-width: 0 !important;
    white-space: normal !important;
    overflow: hidden !important;
    word-break: break-word;
  }
  .payment-report-table .rdt_TableHeadRow .rdt_TableCol:first-child,
  .payment-report-table .rdt_TableRow .rdt_TableCell:first-child {
    flex: 0 0 64px !important;
    width: 64px !important;
    max-width: 64px !important;
    min-width: 64px !important;
    padding-left: 4px !important;
    padding-right: 4px !important;
    justify-content: flex-start !important;
  }
  .payment-report-table .rdt_TableHeadRow .rdt_TableCol:last-child,
  .payment-report-table .rdt_TableRow .rdt_TableCell:last-child {
    flex: 0 1 180px !important;
    width: 180px !important;
    max-width: 200px !important;
    min-width: 160px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    justify-content: flex-start !important;
  }
`

const controlClass =
  "h-9 w-full rounded border border-[#d2d6de] bg-white px-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/25 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const invalidControlClass =
  "border-red-500 focus:border-red-500 focus:ring-red-200";

function fieldClass(hasError: boolean) {
  return `${controlClass} ${hasError ? invalidControlClass : ""}`;
}

const sanitizeColumnKey = (column: string) =>
  column
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getRowValueByColumn = (
  row: PaymentReportRow,
  column: string,
): string | number => {
  switch (column) {
    case "SERIAL":
      return Number(row.serial ?? 0);
    case "SUB DIVISION NAME":
    case "DISTRICT NAME":
      return String(row.subDivisionName ?? "");
    case "TOTAL AMOUNT":
    case "TOTAL AMOUNT (in ₹)": {
      const amount = Number(row.totalAmount ?? 0);
      return amount !== 0 ? `₹ ${Math.trunc(amount)}` : "NIL";
    }
    default: {
      const normalizedValue = row[sanitizeColumnKey(column)];
      if (typeof normalizedValue === "string" || typeof normalizedValue === "number") {
        return normalizedValue;
      }

      const directValue = row[column];
      if (typeof directValue === "string" || typeof directValue === "number") {
        return directValue;
      }

      return "";
    }
  }
};

const buildTableRows = (response: ReportResponse): TableRow[] => {
  const columns = Array.isArray(response.columns) ? response.columns : [];
  const rows = Array.isArray(response.rows) ? response.rows : [];

  return rows.map((row) => {
    const mappedRow: TableRow = {};

    columns.forEach((column) => {
      mappedRow[sanitizeColumnKey(column)] = getRowValueByColumn(row, column);
    });

    return mappedRow;
  });
};

const buildTableColumns = (reportColumns: string[]): TableColumn<TableRow>[] =>
  reportColumns.map((column) => {
    const accessor = sanitizeColumnKey(column);
    const isSerial = column === "SERIAL";
    const isName = column === "SUB DIVISION NAME" || column === "DISTRICT NAME";
    const isAmount = column.startsWith("TOTAL AMOUNT");
    const headerLabel = isSerial ? "Serial" : column;

    return {
      name: (
        <p
          className={`whitespace-normal p-0.5 leading-snug text-left`}
        >
          {headerLabel}
        </p>
      ),
      selector: (row) =>
        typeof row[accessor] === "number" ? Number(row[accessor]) : 0,
      cell: (row) => (
        <div className="text-left break-words">
          {row[accessor] ?? ""}
        </div>
      ),
      grow: isSerial ? 0 : isName ? 2 : 0,
      width: isSerial ? "64px" : isAmount ? "180px" : undefined,
      minWidth: isSerial ? "64px" : isAmount ? "160px" : undefined,
      maxWidth: isSerial ? "64px" : isAmount ? "200px" : undefined,
      compact: isSerial,
      wrap: true,
    };
  });

const LcAnalyticPaymentReport: React.FC = () => {
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
  const [tableColumns, setTableColumns] = useState<TableColumn<TableRow>[]>([]);
  const [underDevelopment, setUnderDevelopment] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef(0);

  const currentFilterKey = [
    service,
    selectedDistId,
    selectedSubdivId,
    fromDate,
    toDate,
  ].join("|");

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
    abortRef.current?.abort();
    abortRef.current = null;
    requestSeqRef.current += 1;
    setLoading(false);
    setTableData([]);
    setTableColumns([]);
    setFieldErrors({});
    setFetchError(false);
    setHasSearched(false);
    setUnderDevelopment(false);
  };

  useEffect(() => {
    resetReportState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterKey]);

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
      abortRef.current?.abort();
      abortRef.current = null;
      requestSeqRef.current += 1;
      setLoading(false);
      setTableData([]);
      setTableColumns([]);
      setFetchError(false);
      setHasSearched(false);
      setUnderDevelopment(false);
      return;
    }

    if (SERVICES_UNDER_DEVELOPMENT.has(service)) {
      abortRef.current?.abort();
      abortRef.current = null;
      requestSeqRef.current += 1;
      setLoading(false);
      setTableData([]);
      setTableColumns([]);
      setFetchError(false);
      setHasSearched(false);
      setUnderDevelopment(true);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestSeq = ++requestSeqRef.current;

    try {
      setLoading(true);
      setFetchError(false);
      setHasSearched(true);
      setUnderDevelopment(false);
      setTableData([]);
      setTableColumns([]);

      const payload = {
        reportName: "PAYMENT_REPORT",
        service,
        district: selectedDistId,
        subDivision: selectedSubdivId,
        fromDate,
        toDate,
      };

      const res = await axios.post<ReportResponse>(
        `${API_BASE}reports/administrative`,
        payload,
        { signal: controller.signal },
      );

      if (requestSeq !== requestSeqRef.current) {
        return;
      }

      const response = res.data ?? {};
      const reportColumns = Array.isArray(response.columns) ? response.columns : [];
      const mappedRows = buildTableRows(response);

      setTableColumns(buildTableColumns(reportColumns));
      setTableData(mappedRows);
    } catch (err) {
      if (
        requestSeq !== requestSeqRef.current ||
        axios.isCancel(err) ||
        (axios.isAxiosError(err) && err.code === "ERR_CANCELED")
      ) {
        return;
      }
      console.error("Payment report API error:", err);
      setTableData([]);
      setTableColumns([]);
      setFetchError(true);
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  };

  const showTable = !loading && !underDevelopment && !fetchError && tableData.length > 0;

  return (
    <div className="min-h-screen p-3 md:p-4">
      <style>{TABLE_STYLES}</style>
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-gray-800 md:text-2xl">
        Payment Report
      </h1>

      <div className="flex flex-col gap-4">
        {/* Filter Panel */}
        <div className="overflow-visible rounded-[3px] border border-gray-200 border-t-[3px] border-t-[#3c8dbc] bg-white p-4 shadow-sm md:p-5">
          <form onSubmit={generateReport} className="space-y-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[1.5fr_1fr_1fr]">
              {/* Service */}
              <div>
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
                Payment Report
              </h2>
            </div>
          )}

          {loading && (
            <div className="py-2">
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

          {!loading && underDevelopment && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">
                This service is under development
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                The payment report for the selected service is not available yet.
                Please choose a different service.
              </p>
            </div>
          )}

          {!loading && !underDevelopment && fetchError && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">
                Unable to generate report
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Something went wrong while loading the payment report. Please
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

          {!loading && !underDevelopment && !fetchError && !hasSearched && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3c8dbc]/10 text-[#3c8dbc]">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-gray-800">
                Generate Payment Report
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Select the required filters and date range, then click Generate to
                view the report.
              </p>
            </div>
          )}

          {!loading && !underDevelopment && !fetchError && hasSearched && tableData.length === 0 && (
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
            <div className="payment-report-table w-full overflow-hidden">
              <DataTable
                columns={tableColumns}
                data={tableData}
                dense
                highlightOnHover
                striped
                customStyles={{
                  table: {
                    style: {
                      width: "100%",
                      minWidth: "100%",
                    },
                  },
                  responsiveWrapper: {
                    style: {
                      overflowX: "hidden",
                      width: "100%",
                    },
                  },
                  headCells: {
                    style: {
                      backgroundColor: "#3c8dbc",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      overflow: "hidden",
                      lineHeight: "1.35",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                    },
                  },
                  cells: {
                    style: {
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflow: "hidden",
                      paddingLeft: "8px",
                      paddingRight: "8px",
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

export default LcAnalyticPaymentReport;
