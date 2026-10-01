import { API_BASE } from "@/constants/constants";
import axios from "axios";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import * as XLSX from "xlsx-js-style";

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

interface BlockOption {
  block_code: number;
  block_mun_name: string;
}

interface TableRow {
  serial: number;
  courtcaseId: string;
  dateOfSubmissionOfCourtCase: string;
  establishmentName: string;
  establishmentAddress: string;
  inspectionAct: string;
  alcRemarks: string;
  fineAmount: number;
  claimAmount: number;
  workersInvolved: number;
  status: string;
  [key: string]: string | number;
}

const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

function openNativeDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget as HTMLInputElement & {
    showPicker?: () => void;
  };
  input.showPicker?.();
}

const sanitizeColumnKey = (column: string) =>
  column
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getRowValueByColumn = (
  row: any,
  column: string,
): string | number => {
  switch (column) {
    case "SERIAL":
      return Number(row.serial ?? 0);
    case "COURTCASE ID":
      return String(row.courtcaseId ?? "");
    case "DATE OF SUBMISSION OF COURT CASE":
      return String(row.dateOfSubmissionOfCourtCase ?? "");
    case "ESTABLISHMENT NAME":
      return String(row.establishmentName ?? "");
    case "ESTABLISHMENT ADDRESS":
      return String(row.establishmentAddress ?? "");
    case "INSPECTION ACT":
      return String(row.inspectionAct ?? "");
    case "ALC REMARKS":
      return String(row.alcRemarks ?? "");
    case "FINE AMOUNT":
      return Number(row.fineAmount ?? 0);
    case "CLAIM AMOUNT":
      return Number(row.claimAmount ?? 0);
    case "WORKERS INVOLVED":
      return Number(row.workersInvolved ?? 0);
    case "STATUS":
      return String(row.status ?? "");
    default:
      const accessor = sanitizeColumnKey(column);
      const normalizedValue = row[accessor];
      if (typeof normalizedValue === "string" || typeof normalizedValue === "number") {
        return normalizedValue;
      }

      const directValue = row[column];
      if (typeof directValue === "string" || typeof directValue === "number") {
        return directValue;
      }

      return "";
  }
};

const buildTableRows = (response: any): TableRow[] => {
  const columns = Array.isArray(response.columns) ? response.columns : [];
  const rows = Array.isArray(response.rows) ? response.rows : [];

  return rows.map((row: any) => {
    const mappedRow: TableRow = {
      serial: Number(row.serial ?? 0),
      courtcaseId: String(row.courtcaseId ?? ""),
      dateOfSubmissionOfCourtCase: String(row.dateOfSubmissionOfCourtCase ?? ""),
      establishmentName: String(row.establishmentName ?? ""),
      establishmentAddress: String(row.establishmentAddress ?? ""),
      inspectionAct: String(row.inspectionAct ?? ""),
      alcRemarks: String(row.alcRemarks ?? ""),
      fineAmount: Number(row.fineAmount ?? 0),
      claimAmount: Number(row.claimAmount ?? 0),
      workersInvolved: Number(row.workersInvolved ?? 0),
      status: String(row.status ?? ""),
    };

    columns.forEach((column: string) => {
      mappedRow[sanitizeColumnKey(column)] = getRowValueByColumn(row, column);
    });

    return mappedRow;
  });
};

const buildTableColumns = (reportColumns: string[]): TableColumn<TableRow>[] =>
  reportColumns.map((column) => {
    const accessor = sanitizeColumnKey(column);

    const baseCol: TableColumn<TableRow> = {
      name: (
        <p className="break-words p-1 text-wrap whitespace-pre-line">
          {column.toUpperCase()}
        </p>
      ),
      selector: (row) => {
        const val = row[accessor];
        return typeof val === "number" ? val : String(val ?? "");
      },
      wrap: true,
      grow: 1,
    };

    if (column === "SERIAL") {
      baseCol.width = "70px";
      baseCol.center = true;
    } else if (column === "COURTCASE ID") {
      baseCol.width = "120px";
      baseCol.center = true;
    } else if (column === "DATE OF SUBMISSION OF COURT CASE") {
      baseCol.width = "130px";
      baseCol.center = true;
    } else if (column === "ESTABLISHMENT NAME") {
      baseCol.grow = 1.5;
    } else if (column === "ESTABLISHMENT ADDRESS") {
      baseCol.grow = 2;
    } else if (column === "INSPECTION ACT") {
      baseCol.grow = 1.5;
    } else if (column === "ALC REMARKS") {
      baseCol.grow = 1.5;
    } else if (column === "FINE AMOUNT" || column === "CLAIM AMOUNT") {
      baseCol.width = column === "FINE AMOUNT" ? "110px" : "115px";
      baseCol.right = true;
      baseCol.cell = (row) => <div>₹{row[accessor] ?? 0}</div>;
    } else if (column === "WORKERS INVOLVED") {
      baseCol.width = "110px";
      baseCol.center = true;
    } else if (column === "STATUS") {
      baseCol.width = "100px";
      baseCol.center = true;
      baseCol.cell = (row) => {
        const status = String(row[accessor] ?? "");
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              status === "Closed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        );
      };
    }

    return baseCol;
  });

const DEFAULT_COLUMNS = [
  "SERIAL",
  "COURTCASE ID",
  "DATE OF SUBMISSION OF COURT CASE",
  "ESTABLISHMENT NAME",
  "ESTABLISHMENT ADDRESS",
  "INSPECTION ACT",
  "ALC REMARKS",
  "FINE AMOUNT",
  "CLAIM AMOUNT",
  "WORKERS INVOLVED",
  "STATUS",
];

const createEmptyRow = (): TableRow => {
  return {
    serial: 1,
    courtcaseId: "0",
    dateOfSubmissionOfCourtCase: "0",
    establishmentName: "0",
    establishmentAddress: "0",
    inspectionAct: "0",
    alcRemarks: "0",
    fineAmount: 0,
    claimAmount: 0,
    workersInvolved: 0,
    status: "0",
    courtcase_id: "0",
    date_of_submission_of_court_case: "0",
    establishment_name: "0",
    establishment_address: "0",
    inspection_act: "0",
    alc_remarks: "0",
    fine_amount: 0,
    claim_amount: 0,
    workers_involved: 0,
  };
};

const LcCourtCaseReport: React.FC = () => {
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [subdivisions, setSubdivisions] = useState<SubdivisionOption[]>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);

  const [selectedDistId, setSelectedDistId] = useState("");
  const [selectedSubdivId, setSelectedSubdivId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([createEmptyRow()]);
  const [tableColumns, setTableColumns] = useState<TableColumn<TableRow>[]>(
    buildTableColumns(DEFAULT_COLUMNS)
  );

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
    setTableData([createEmptyRow()]);
    setTableColumns(buildTableColumns(DEFAULT_COLUMNS));
    setError("");
  };

  const fetchSubdivisions = async (districtCode: string) => {
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

  const fetchBlocks = async (districtCode: string, subdivCode: string) => {
    try {
      const res = await axios.get(`${API_BASE}block/${districtCode}/${subdivCode}`);
      const blockList = Array.isArray(res.data) ? res.data : [];
      setBlocks(blockList);
    } catch (err) {
      console.error("Block API error:", err);
      setBlocks([]);
    }
  };

  const handleDistrictChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = event.target.value;
    setSelectedDistId(districtCode);
    setSelectedSubdivId("");
    setSelectedBlockId("");
    setSubdivisions([]);
    setBlocks([]);
    resetReportState();

    if (!districtCode) {
      return;
    }
    await fetchSubdivisions(districtCode);
  };

  const handleSubdivisionChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const subdivCode = event.target.value;
    setSelectedSubdivId(subdivCode);
    setSelectedBlockId("");
    setBlocks([]);
    resetReportState();

    if (!subdivCode) {
      return;
    }
    await fetchBlocks(selectedDistId, subdivCode);
  };

  const generateReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!selectedDistId) {
      setError("District is required.");
      return;
    }

    if (!fromDate || !toDate) {
      setTableData([]);
      setError("Date fields are required.");
      return;
    }

    if (fromDate > toDate) {
      setTableData([]);
      setError("From date cannot be after to date.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        reportName: "COURTCASE_REPORT",
        district: selectedDistId,
        subDivision: selectedSubdivId,
        block: selectedBlockId,
        fromDate,
        toDate,
      };

      const res = await axios.post(`${API_BASE}reports/administrative`, payload);
      const response = res.data ?? {};
      const reportColumns =
        Array.isArray(response.columns) && response.columns.length > 0
          ? response.columns
          : DEFAULT_COLUMNS;
      const mappedRows = buildTableRows(response);

      setTableColumns(buildTableColumns(reportColumns));
      if (!mappedRows.length) {
        setTableData([createEmptyRow()]);
        setError("No report data available.");
      } else {
        setTableData(mappedRows);
      }
    } catch (err) {
      console.error("Courtcase report API error:", err);
      setTableColumns(buildTableColumns(DEFAULT_COLUMNS));
      setTableData([createEmptyRow()]);
      setError("Unable to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!tableData.length) return;

    const wb = XLSX.utils.book_new();
    const rows: any[][] = [];

    // Title Row
    rows.push(["COURT CASE REGISTER REPORT"]);

    // Header Row
    rows.push([
      "SL.NO.",
      "COURTCASE ID",
      "DATE OF SUBMISSION OF COURT CASE",
      "ESTABLISHMENT NAME",
      "ESTABLISHMENT ADDRESS",
      "INSPECTION ACT",
      "ALC REMARKS",
      "FINE AMOUNT",
      "CLAIM AMOUNT",
      "WORKERS INVOLVED",
      "STATUS",
    ]);

    // Data Rows
    tableData.forEach((r, idx) => {
      rows.push([
        idx + 1,
        r.courtcaseId,
        r.dateOfSubmissionOfCourtCase,
        r.establishmentName,
        r.establishmentAddress,
        r.inspectionAct,
        r.alcRemarks,
        r.fineAmount,
        r.claimAmount,
        r.workersInvolved,
        r.status,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    const border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    const range = XLSX.utils.decode_range(ws["!ref"] || "");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (!cell) continue;

        if (R === 1) {
          cell.s = {
            border,
            fill: { fgColor: { rgb: "3F86A8" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
            alignment: { vertical: "center", horizontal: "center", wrapText: true },
          };
        } else if (R === 0) {
          cell.s = {
            border,
            font: { bold: true, size: 14 },
            alignment: { vertical: "center", horizontal: "center" },
          };
        } else {
          cell.s = {
            border,
            alignment: {
              vertical: "center",
              horizontal: C === 3 || C === 4 || C === 5 || C === 6 ? "left" : "center",
              wrapText: true,
            },
          };
        }
      }
    }

    ws["!cols"] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 40 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
    ];

    ws["!rows"] = [{ hpt: 30 }, { hpt: 25 }];

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Court Case Register");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Court_Case_Register_${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className="w-full p-2 font-sans">
      <h2 className="mb-3 text-2xl">Prosecution Cases Report</h2>

      <div className="w-full overflow-x-auto">
        <form
          onSubmit={generateReport}
          className="rounded border-t-4 border-blue-500 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block font-semibold">
                Select District <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded border px-2 py-2"
                value={selectedDistId}
                onChange={handleDistrictChange}
                required
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={String(district.code)}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Select Subdivision
              </label>
              <select
                className="w-full rounded border px-2 py-2 disabled:bg-gray-100"
                value={selectedSubdivId}
                onChange={handleSubdivisionChange}
                disabled={!selectedDistId}
              >
                <option value="">
                  {!selectedDistId ? "Select District First" : "Select Subdivision"}
                </option>
                {subdivisions.map((subdiv) => (
                  <option key={String(subdiv.code)} value={String(subdiv.code)}>
                    {subdiv.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Select Block/Municipality
              </label>
              <select
                className="w-full rounded border px-2 py-2 disabled:bg-gray-100"
                value={selectedBlockId}
                onChange={(e) => {
                  setSelectedBlockId(e.target.value);
                  resetReportState();
                }}
                disabled={!selectedSubdivId}
              >
                <option value="">
                  {!selectedSubdivId ? "Select Subdivision First" : "Select Block"}
                </option>
                {blocks.map((block) => (
                  <option key={String(block.block_code)} value={String(block.block_code)}>
                    {block.block_mun_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded border px-2 py-2 cursor-pointer"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  resetReportState();
                }}
                onClick={openNativeDatePicker}
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded border px-2 py-2 cursor-pointer"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  resetReportState();
                }}
                onClick={openNativeDatePicker}
                required
              />
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "GENERATING..." : "GENERATE"}
          </button>
        </form>

        <div className="mt-5 rounded border-t-4 border-blue-500 bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg text-gray-700">Records of Court Case Register</span>
            <button
              onClick={exportExcel}
              disabled={
                !tableData.length ||
                (tableData.length === 1 && tableData[0].courtcaseId === "0")
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded text-sm transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Download Excel
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="w-full min-w-[0]">
              <DataTable
                columns={tableColumns}
                data={tableData}
                pagination
                dense
                striped
                highlightOnHover
                responsive
                fixedHeader
                fixedHeaderScrollHeight="450px"
                progressPending={loading}
                noDataComponent={loading ? "Loading report..." : "No report data available."}
                customStyles={{
                  table: {
                    style: {
                      width: "100%",
                      tableLayout: "fixed" as const,
                    },
                  },
                  headCells: {
                    style: {
                      backgroundColor: "#cececeff",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "12px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflow: "visible",
                      lineHeight: "1.2",
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LcCourtCaseReport;
