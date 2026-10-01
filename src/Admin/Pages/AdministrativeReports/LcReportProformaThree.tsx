import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import * as Yup from "yup";
import {
  AlertCircle,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import ReportDatePicker from "@/Components/ReportDatePicker";

/** -------------------------------
 * Types
 --------------------------------*/
interface ApplicantFormValues {
  fromDate: string;
  toDate: string;
  district: string;
  subdivision: string;
  block_municipality: string;
  inspection_act: string;
  status: string;
}

interface ApiOption {
  id: number;
  name: string;
}

interface ReportRow {
  id: number;
  applicant_name: string;
  inspection_date: string;
  district: string;
  subdivision: string;
  block: string;
}

interface RowData {
  sl: string;
  particular: string;

  mw_agri: number;
  mw_non_agri: number;

  child_labour: number;
  equal_remuneration: number;
  payment_wages: number;
  motor_transport: number;
  wb_house_rent: number;
  sales_promotion: number;
  inter_state: number;
  beedi: number;
  gratuity: number;
  contract_labour: number;
  bocw: number;
  wb_shops: number;
  bonus: number;
  maternity: number;
  welfare_fund: number;
  total: number;
}

interface RowDataIII {
  sl: string;
  particular: string;
  mtw: number | string;
  clra_reg: number | string;
  clra_lic: number | string;
  ismw_reg: number | string;
  ismw_lic: number | string;
  bocwa: number | string;
}

const SECTION_HEADINGS: Record<string, string> = {
  "5": "LICENCE",
  "12": "RENEWAL",
  "14": "AMENDMENTS/CHANGES/DUPLICATE/WINDING UP",
};

const emptySectionRow = (particular: string): RowDataIII => ({
  sl: "",
  particular,
  mtw: "",
  clra_reg: "",
  clra_lic: "",
  ismw_reg: "",
  ismw_lic: "",
  bocwa: "",
});

const insertSectionHeadings = (rows: RowDataIII[]): RowDataIII[] => {
  const result: RowDataIII[] = [];

  rows.forEach((row) => {
    result.push(row);
    const heading = SECTION_HEADINGS[row.sl];
    if (heading) {
      result.push(emptySectionRow(heading));
    }
  });

  return result;
};

/** -------------------------------
 * Initial Values
 --------------------------------*/
const initialValues: ApplicantFormValues = {
  fromDate: "",
  toDate: "",
  district: "",
  subdivision: "",
  block_municipality: "",
  inspection_act: "",
  status: "",
};

const validationSchema = Yup.object({
  district: Yup.string().required("District is required"),
  fromDate: Yup.string().required("From Date is required"),
  toDate: Yup.string()
    .required("To Date is required")
    .test(
      "date-range",
      "To Date cannot be earlier than From Date",
      function (value) {
        const { fromDate } = this.parent as ApplicantFormValues;
        if (!fromDate || !value) return true;
        return value >= fromDate;
      }
    ),
});

const controlClass =
  "h-9 w-full rounded border border-[#d2d6de] bg-white px-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/25 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const invalidControlClass =
  "border-red-500 focus:border-red-500 focus:ring-red-200";

function fieldClass(hasError: boolean) {
  return `${controlClass} ${hasError ? invalidControlClass : ""}`;
}

const ROMAN_HEADERS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
];

const NUMERIC_KEYS: (keyof RowDataIII)[] = [
  "mtw",
  "clra_reg",
  "clra_lic",
  "ismw_reg",
  "ismw_lic",
  "bocwa",
];

const COL_WIDTH = {
  sl: 72,
  particular: 350,
  mtw: 120,
  clra_reg: 120,
  clra_lic: 120,
  ismw_reg: 120,
  ismw_lic: 120,
  bocwa: 120,
} as const;

const REPORT_TABLE_STYLES = `
  .proforma-three-report-scroll {
    width: 100%;
    overflow-x: auto;
  }
  .proforma-three-report-table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
    table-layout: auto;
  }
  .proforma-three-report-table thead th {
    white-space: normal;
    word-break: normal;
    overflow-wrap: normal;
    line-height: 1.35;
    vertical-align: middle;
  }
  .proforma-three-report-table tbody td {
    white-space: normal;
    word-break: normal;
    overflow-wrap: break-word;
  }
`;

const thClass =
  "border border-white bg-[#3c8dbc] px-2 py-3 text-center text-xs font-semibold uppercase";
const thSubClass =
  "border border-white bg-[#3c8dbc] px-2 py-2 text-center text-xs font-semibold uppercase";
const romanThClass =
  "border border-gray-200 bg-gray-50 px-1 py-1.5 text-center text-xs font-semibold";

// const months = [
//   "Jan","Feb","Mar","Apr","May","Jun",
//   "Jul","Aug","Sep","Oct","Nov","Dec",
// ];

// const getDaysInMonth = (year: number, month: number): number =>
//   new Date(year, month, 0).getDate();

/** -------------------------------
 * Component
 --------------------------------*/
const LCReportProformaThree: React.FC = () => {
  const formikRef = useRef<FormikProps<ApplicantFormValues> | null>(null);

  const [districts, setDistricts] = useState<ApiOption[]>([]);
  const [subdivisions, setSubdivisions] = useState<ApiOption[]>([]);
  const [blocks, setBlocks] = useState<ApiOption[]>([]);
  const [selectedDistId, setSelectedDistId] = useState<string | null>("");
  const [selectedSubdivId, setSelectedSubdivId] = useState<string | null>("");
  const [reportData, setReportData] = useState<RowDataIII[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const resetReportState = () => {
    setReportData([]);
    setHasSearched(false);
    setError(false);
  };

  // Demo Table Data for Reports
  const data: RowDataIII[] = [
    {
      sl: "1",
      particular: "No. of registered units at the beginning of this period",
      mtw: 0,
      clra_reg: 0,
      clra_lic: 0,
      ismw_reg: 0,
      ismw_lic: 0,
      bocwa: 0,
    },
    {
      sl: "2",
      particular: "No. of new registration granted during this period",
      mtw: 0,
      clra_reg: 0,
      clra_lic: 0,
      ismw_reg: 0,
      ismw_lic: 0,
      bocwa: 0,
    },
    {
      sl: "3",
      particular: "No. of workers covered by new registration",
      mtw: 0,
      clra_reg: 0,
      clra_lic: 0,
      ismw_reg: 0,
      ismw_lic: 0,
      bocwa: 0,
    },
    {
      sl: "4",
      particular: "Amount of Fees realised",
      mtw: 0,
      clra_reg: 0,
      clra_lic: 0,
      ismw_reg: 0,
      ismw_lic: 0,
      bocwa: 0,
    },
    {
      sl: "5",
      particular: "Total no. of registered units at the end of this period",
      mtw: 0,
      clra_reg: 0,
      clra_lic: 0,
      ismw_reg: 0,
      ismw_lic: 0,
      bocwa: 0,
    },

    // LICENCE section (header row)
    {
      sl: "",
      particular: "LICENCE",
      mtw: "",
      clra_reg: "",
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },

    {
      sl: "6",
      particular: "Total no of licenced units at the beginning of this period",
      mtw: "",
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "7",
      particular: "No of New Licences issued during this period",
      mtw: "",
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "8",
      particular: "No. of workers covered by new licence",
      mtw: "",
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "9",
      particular: "Amount of fees realised",
      mtw: "",
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "10",
      particular:
        "Amount of security money deposited during this period (including security deposit for amendment during this period)",
      mtw: "",
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "11",
      particular:
        "Amount of security money deposit refunded during this period",
      mtw: "",
      clra_reg: "",
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "12",
      particular: "Total no of licenced units at the end of this period",
      mtw: "",
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },

    // RENEWAL section
    {
      sl: "",
      particular: "RENEWAL",
      mtw: "",
      clra_reg: "",
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "13",
      particular: "No. of Registration / Licences renewed during this period",
      mtw: 0,
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "14",
      particular: "Amount of renewal fees realised",
      mtw: 0,
      clra_reg: "",
      clra_lic: 0,
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },

    // AMENDMENTS section
    {
      sl: "",
      particular: "AMENDMENTS/CHANGES/DUPLICATE/WINDING UP",
      mtw: "",
      clra_reg: "",
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "15",
      particular: "No. of units where amendments/changes/duplicate made",
      mtw: "",
      clra_reg: 0,
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "16",
      particular: "No of units where winding up of business took place",
      mtw: "",
      clra_reg: "",
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
    {
      sl: "17",
      particular:
        "Amount of fees realised for amendment, duplicate fees & other fees received",
      mtw: "",
      clra_reg: 0,
      clra_lic: "",
      ismw_reg: "",
      ismw_lic: "",
      bocwa: "",
    },
  ];

  // const exportToExcel = (values: ApplicantFormValues) => {
  //   const districtName =
  //     districts.find((d) => String(d.id) === String(values.district))?.name ||
  //     "";

  //   const subdivisionName =
  //     subdivisions.find((s) => String(s.id) === String(values.subdivision))
  //       ?.name || "";

  //   const blockName =
  //     blocks.find((b) => String(b.id) === String(values.block_municipality))
  //       ?.name || "";

  //   const wb = XLSX.utils.book_new();

  //   const today = new Date().toLocaleDateString("en-GB");

  //   const title = `Monthly Consolidated Report on Enforcement of Various Labour Laws for Block/Municipality (${blockName}), Sub-Division (${subdivisionName}) (District : ${districtName}), for the month of (${values.fromDate} TO ${values.toDate}) AS ON ${today}`;

  //   const rows: any[][] = [];

  //   // ---------------- HEADER ----------------
  //   rows.push(["PROFORMA III"]);
  //   rows.push([title]);

  //   rows.push([
  //     "Sl.No",
  //     "Particulars",
  //     "MTW Act, 1961",
  //     "WB Shops Act, 1963",
  //     "Beedi & Cigar Act, 1966",
  //     "CLRA Act, 1970",
  //     "",
  //     "ISMW Act, 1979",
  //     "",
  //     "BOCW Act, 1996",
  //   ]);

  //   rows.push([
  //     "",
  //     "",
  //     "Registration",
  //     "Registration",
  //     "Registration",
  //     "Registration",
  //     "Licence",
  //     "Registration",
  //     "Licence",
  //     "Registration",
  //   ]);

  //   rows.push(["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);

  //   // ---------------- CLEAN FUNCTION ----------------
  //   const clean = (val: any) => {
  //     if (val === null || val === undefined || val === "NA" || val === "")
  //       return "";
  //     return val;
  //   };

  //   // ✅ USE API DATA
  //   const exportData = reportData.length ? reportData : data;

  //   // ---------------- DATA ROWS ----------------
  //   exportData.forEach((r) => {
  //     rows.push([
  //       r.sl,
  //       r.particular,
  //       clean(r.mtw),
  //       "", // WB Shops (not in API)
  //       "", // Beedi (not in API)
  //       clean(r.clra_reg),
  //       clean(r.clra_lic),
  //       clean(r.ismw_reg),
  //       clean(r.ismw_lic),
  //       clean(r.bocwa),
  //     ]);
  //   });

  //   // ---------------- CREATE SHEET ----------------
  //   const ws = XLSX.utils.aoa_to_sheet(rows);

  //   // ---------------- COLUMN WIDTHS ----------------
  //   ws["!cols"] = [
  //     { wch: 6 }, // Sl
  //     { wch: 45 }, // Particular
  //     { wch: 12 }, // MTW
  //     { wch: 18 }, // WB Shops
  //     { wch: 18 }, // Beedi
  //     { wch: 12 }, // CLRA Reg
  //     { wch: 12 }, // CLRA Lic
  //     { wch: 12 }, // ISMW Reg
  //     { wch: 12 }, // ISMW Lic
  //     { wch: 12 }, // BOCW
  //   ];

  //   // ---------------- ROW HEIGHTS ----------------
  //   ws["!rows"] = [{ hpt: 28 }, { hpt: 45 }];

  //   // ---------------- MERGES ----------------
  //   ws["!merges"] = [
  //     // Title
  //     { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
  //     { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },

  //     // CLRA (Reg + Lic)
  //     { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } },

  //     // ISMW (Reg + Lic)
  //     { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } },
  //   ];

  //   const merges = ws["!merges"] ?? [];
  //   ws["!merges"] = merges;

  //   // ---------------- SECTION MERGES (LICENCE etc.) ----------------
  //   exportData.forEach((r, index) => {
  //     if (r.sl === "") {
  //       const rowIndex = index + 5; // offset (header rows)

  //       merges.push({
  //         s: { r: rowIndex, c: 0 },
  //         e: { r: rowIndex, c: 9 },
  //       });
  //     }
  //   });

  //   // ---------------- STYLING ----------------
  //   const border = {
  //     top: { style: "thin" },
  //     bottom: { style: "thin" },
  //     left: { style: "thin" },
  //     right: { style: "thin" },
  //   };

  //   const range = XLSX.utils.decode_range(ws["!ref"] || "");

  //   for (let R = range.s.r; R <= range.e.r; ++R) {
  //     for (let C = range.s.c; C <= range.e.c; ++C) {
  //       const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
  //       if (!cell) continue;

  //       cell.s = {
  //         border,
  //         alignment: {
  //           vertical: "center",
  //           horizontal: R <= 1 ? "center" : C === 1 ? "left" : "center",
  //           wrapText: true,
  //         },
  //         font: {
  //           size: R === 0 ? 14 : 10,
  //           bold: R <= 2,
  //         },
  //       };
  //     }
  //   }

  //   // ---------------- EXPORT ----------------
  //   XLSX.utils.book_append_sheet(wb, ws, "Proforma-III");

  //   const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });

  //   saveAs(blob, "PROFORMA_III_REPORT.xlsx");
  // };
  
  const exportToExcel = (values: ApplicantFormValues) => {
    const districtName =
      districts.find((d) => String(d.id) === String(values.district))?.name ||
      "";

    const subdivisionName =
      subdivisions.find((s) => String(s.id) === String(values.subdivision))
        ?.name || "";

    const blockName =
      blocks.find((b) => String(b.id) === String(values.block_municipality))
        ?.name || "";

    const wb = XLSX.utils.book_new();

    const today = new Date().toLocaleDateString("en-GB");
    const LAST_COL = 7;

    const emptyRow = () => ["", "", "", "", "", "", "", ""];

    const rows: any[][] = [];

    rows.push(["PROFORMA-III", ...emptyRow().slice(1)]);
    rows.push([
      "Monthly Report on Registration , Licence , Renewal , Amendments under MTW Act , 1961 , B & C Workers(C of E) Act, 1996 , W.B. shops & Establishments Act , 1963",
      ...emptyRow().slice(1),
    ]);
    rows.push([
      "Contract Labour (R & A) Act, 1970 , ISMW (RECS) Act, 1979, BOCW(RECS) Act, 1996",
      ...emptyRow().slice(1),
    ]);
    rows.push([
      `For the Month of : (${values.fromDate} TO ${values.toDate}) AS ON ${today}`,
      ...emptyRow().slice(1),
    ]);
    rows.push([
      `Name of the Region : Block/Municipality (${blockName}) , Sub-Division (${subdivisionName}) (${districtName})`,
      ...emptyRow().slice(1),
    ]);

    rows.push([
      "Sl. No.",
      "Particular",
      "MTW",
      "CLRA",
      "",
      "ISMW",
      "",
      "BOCWA",
    ]);

    rows.push([
      "",
      "",
      "REGISTRATION",
      "REGISTRATION",
      "LICENCE",
      "REGISTRATION",
      "LICENCE",
      "REGISTRATION",
    ]);

    rows.push(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]);

    const clean = (val: any) => {
      if (val === null || val === undefined || val === "") {
        return "NA";
      }
      return val;
    };

    const exportData = reportData.length ? reportData : data;
    const HEADER_ROWS = 8;

    exportData.forEach((r) => {
      if (r.sl === "") {
        rows.push([r.particular, "", "", "", "", "", "", ""]);
        return;
      }

      rows.push([
        r.sl,
        r.particular,
        clean(r.mtw),
        clean(r.clra_reg),
        clean(r.clra_lic),
        clean(r.ismw_reg),
        clean(r.ismw_lic),
        clean(r.bocwa),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rows.length - 1, c: LAST_COL },
    });

    ws["!cols"] = [
      { wch: 8 },
      { wch: 50 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
    ];

    ws["!rows"] = [
      { hpt: 28 },
      { hpt: 38 },
      { hpt: 32 },
      { hpt: 25 },
      { hpt: 25 },
      { hpt: 28 },
      { hpt: 28 },
      { hpt: 25 },
    ];

    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: LAST_COL } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: LAST_COL } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: LAST_COL } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: LAST_COL } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: LAST_COL } },
      { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
      { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
      { s: { r: 5, c: 3 }, e: { r: 5, c: 4 } },
      { s: { r: 5, c: 5 }, e: { r: 5, c: 6 } },
    ];

    exportData.forEach((r, index) => {
      if (r.sl === "") {
        merges.push({
          s: { r: index + HEADER_ROWS, c: 0 },
          e: { r: index + HEADER_ROWS, c: LAST_COL },
        });
      }
    });

    ws["!merges"] = merges;

    const border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    const sectionRowIndexes = new Set(
      exportData
        .map((r, index) => (r.sl === "" ? index + HEADER_ROWS : -1))
        .filter((index) => index >= 0),
    );

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = 0; C <= LAST_COL; ++C) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) {
          ws[addr] = { t: "s", v: "" };
        }

        const cell = ws[addr];
        const isTitle = R <= 4;
        const isTableHeader = R >= 5 && R <= 7;
        const isSection = sectionRowIndexes.has(R);
        const isParticular = C === 1 && !isTitle && !isTableHeader && !isSection;

        cell.s = {
          border,
          alignment: {
            vertical: "center",
            horizontal: isParticular ? "left" : isSection ? "left" : "center",
            wrapText: true,
          },
          font: {
            size: R === 0 ? 14 : isTitle ? 10 : 10,
            bold: isTitle || isTableHeader || isSection,
          },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Proforma-III");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "PROFORMA_III_REPORT.xlsx");
  };

  /** -------------------------------
   * Load Districts
   --------------------------------*/
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await axios.get(`${API_BASE}district`); // `${API_BASE}tokens/generate?type=${TYPE}`
        // console.log("district: ", res.data);
        const distList = Array.isArray(res.data)
          ? res.data.map((d: any) => ({
              id: d.district_code,
              name: d.district_name,
            }))
          : [];
        setDistricts(distList); // District completed
      } catch (e) {
        console.error("District API error:", e);
      }
    };
    loadDistricts();
  }, []);

  /** -------------------------------
   * Date Validation (Safe Hook)
   --------------------------------*/
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!formikRef.current) return;
  //     const { values, setFieldValue } = formikRef.current;

  //     const mIdx = months.indexOf(values.toMonth);
  //     const fIdx = months.indexOf(values.fromMonth);

  //     const yearTo = parseInt(values.toYear);
  //     const yearFrom = parseInt(values.fromYear);

  //     const maxTo = getDaysInMonth(yearTo, mIdx + 1);
  //     const maxFrom = getDaysInMonth(yearFrom, fIdx + 1);

  //     if (+values.toDay > maxTo) {
  //       setFieldValue("toDay", maxTo.toString());
  //     }
  //     if (+values.fromDay > maxFrom) {
  //       setFieldValue("fromDay", maxFrom.toString());
  //     }
  //   }, 300);

  //   return () => clearInterval(interval);
  // }, []);

  /** -------------------------------
   * Dependent API calls
   --------------------------------*/
  const fetchSubdivisions = async (districtId: string) => {
    if (!districtId) return;
    try {
      setSelectedDistId(districtId);
      const res = await axios.get(`${API_BASE}subdivision/${districtId}`);
      console.log("subdiv: ", res);
      const subdivList = Array.isArray(res.data)
        ? res.data.map((sd: any) => ({
            id: sd.sub_div_code,
            name: sd.sub_div_name,
          }))
        : [];
      setSubdivisions(subdivList); // Subdiv completed
      // setSubdivisions(Array.isArray(res.data) ? res.data : []);
      setBlocks([]);
    } catch (e) {
      console.error("Subdivision API error:", e);
    }
  };

  const fetchBlocks = async (subdivisionId: string) => {
    if (!subdivisionId) return;
    try {
      setSelectedSubdivId(subdivisionId);
      const [resb, resm, resc] = await Promise.all([
        axios.get(`${API_BASE}block/${selectedDistId}/${subdivisionId}/b`),
        axios.get(`${API_BASE}block/${selectedDistId}/${subdivisionId}/m`),
        axios.get(`${API_BASE}block/${selectedDistId}/${subdivisionId}/c`),
      ]);
      const data_block = resb.data || [];
      const data_mun = resm.data || [];
      const data_corp = resc.data || [];
      console.log("data block: ", data_block, data_mun, data_corp);

      // const res = await axios.get(`${API_BASE}block/${selectedDistId}/${subdivisionId}/b`);

      const mergedRes = [...data_block, ...data_mun, ...data_corp];
      console.log("merged", mergedRes);
      const blockList = Array.isArray(mergedRes)
        ? mergedRes.map((b: any) => ({
            id: b.block_code,
            name: b.block_mun_name,
          }))
        : [];
      setBlocks(Array.isArray(blockList) ? blockList : []); // block completed
    } catch (e) {
      console.error("Blocks API error:", e);
    }
  };

  /** -------------------------------
   * Report API
   --------------------------------*/
  const fetchReport = async (values: ApplicantFormValues) => {
    try {
      setLoading(true);
      setError(false);
      setHasSearched(true);

      const payload = {
        reportName: "PROFORMA_THREE",
        district:
          String(districts.find((d) => String(d.id) === values.district)?.id) || "",
        subDivision:
          String(subdivisions.find((s) => String(s.id) === values.subdivision)?.id) || "",
        block:
          String(blocks.find((b) => String(b.id) === values.block_municipality)?.id) || "",
        fromDate: values.fromDate,
        toDate: values.toDate,
      };

      const res = await axios.post(
        `${API_BASE}reports/administrative`,
        payload,
      );

      const apiData = res.data;

      if (!apiData || !apiData.rows) {
        setReportData([]);
        return;
      }

      // 🔥 MAP API → TABLE
      const mappedData: RowDataIII[] = apiData.rows.map((row: any) => ({
        sl: String(row.slNo),
        particular: row.particular,

        mtw: row.values["MTW Act, 1961 - Registration"] || 0,

        clra_reg: row.values["Contract Labour Act, 1970 - Registration"] || 0,

        clra_lic: row.values["Contract Labour Act, 1970 - Licence"] || 0,

        ismw_reg: row.values["ISMW Act, 1979 - Registration"] || 0,

        ismw_lic: row.values["ISMW Act, 1979 - Licence"] || 0,

        bocwa: row.values["BOCW Act, 1996 - Registration"] || 0,
      }));

      console.log("API DATA:", apiData);
      console.log("MAPPED:", mappedData);

      setReportData(insertSectionHeadings(mappedData));
    } catch (e) {
      console.error("Report API error:", e);

      setReportData([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /** -------------------------------
   * Submit
   --------------------------------*/
  const handleSubmit = (values: ApplicantFormValues) => {
    fetchReport(values);
  };

  const handleExport = () => {
    if (!formikRef.current) return;
    setExporting(true);
    try {
      exportToExcel(formikRef.current.values);
    } finally {
      setExporting(false);
    }
  };

  const showTable = !loading && !error && reportData.length > 0;

  return (
    <div className="min-h-screen p-3 md:p-4">
      <style>{REPORT_TABLE_STYLES}</style>
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-gray-800 md:text-2xl">
        Generate & Download Monthly Inspection report for different labour law
      </h1>

      <div className="flex flex-col gap-4 min-[992px]:flex-row">
        {/* Filter Panel */}
        <div className="w-full shrink-0 min-[992px]:w-[280px] xl:w-[300px]">
          <div className="overflow-visible rounded-[3px] border-t-[3px] border-t-[#3c8dbc] bg-white p-4 shadow">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
              }: FormikProps<ApplicantFormValues>) => (
                <Form>
                  {/* District */}
                  <div className="mb-3">
                    <label
                      htmlFor="district"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      District <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        id="district"
                        name="district"
                        className={`${fieldClass(!!(errors.district && touched.district))} appearance-none pr-8`}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const val = e.target.value;
                          if (val !== values.district) {
                            resetReportState();
                          }
                          setFieldValue("district", val);
                          setFieldValue("subdivision", "");
                          setFieldValue("block_municipality", "");
                          fetchSubdivisions(val);
                        }}
                      >
                        <option value="">- Select -</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </Field>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                    {errors.district && touched.district && (
                      <p className="mt-1 text-xs text-red-600">{errors.district}</p>
                    )}
                  </div>

                  {/* Subdivision */}
                  <div className="mb-3">
                    <label
                      htmlFor="subdivision"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      Sub Division
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        id="subdivision"
                        name="subdivision"
                        disabled={!values.district}
                        className={`${controlClass} appearance-none pr-8`}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const val = e.target.value;
                          if (val !== values.subdivision) {
                            resetReportState();
                          }
                          setFieldValue("subdivision", val);
                          setFieldValue("block_municipality", "");
                          fetchBlocks(val);
                        }}
                      >
                        <option value="">
                          {!values.district ? "Select District First" : "- Select -"}
                        </option>
                        {subdivisions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Field>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  {/* Block */}
                  <div className="mb-3">
                    <label
                      htmlFor="block_municipality"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      Block / Municipality
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        id="block_municipality"
                        name="block_municipality"
                        disabled={!values.subdivision}
                        className={`${controlClass} appearance-none pr-8`}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const val = e.target.value;
                          if (val !== values.block_municipality) {
                            resetReportState();
                          }
                          setFieldValue("block_municipality", val);
                        }}
                      >
                        <option value="">
                          {!values.subdivision
                            ? "Select Sub Division First"
                            : "-- Select --"}
                        </option>
                        {blocks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Field>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>

                  {/* From Date */}
                  <div className="mb-3">
                    <label
                      htmlFor="fromDate"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <ReportDatePicker
                      id="fromDate"
                      value={values.fromDate}
                      onChange={(next) => {
                        if (next !== values.fromDate) {
                          resetReportState();
                        }
                        setFieldValue("fromDate", next).then(() => {
                          setFieldTouched("fromDate", true, false);
                          if (values.toDate) {
                            formikRef.current?.validateField("toDate");
                          }
                        });
                      }}
                      rangeEnd={values.toDate}
                      hasError={!!(errors.fromDate && touched.fromDate)}
                    />
                    {errors.fromDate && touched.fromDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.fromDate}</p>
                    )}
                  </div>

                  {/* To Date */}
                  <div className="mb-3">
                    <label
                      htmlFor="toDate"
                      className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <ReportDatePicker
                      id="toDate"
                      value={values.toDate}
                      onChange={(next) => {
                        if (next !== values.toDate) {
                          resetReportState();
                        }
                        setFieldValue("toDate", next).then(() => {
                          setFieldTouched("toDate", true, false);
                        });
                      }}
                      rangeStart={values.fromDate}
                      hasError={!!(errors.toDate && touched.toDate)}
                    />
                    {errors.toDate && touched.toDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.toDate}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded bg-[#3c8dbc] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#357ca5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c8dbc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Search
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Report Section */}
        <div className="min-w-0 flex-1">
          <div className="rounded-[3px] border-t-[3px] border-t-[#3c8dbc] bg-white p-4 shadow">
            {showTable && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800">Proforma III</h2>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  {exporting ? "Exporting..." : "Export Excel"}
                </button>
              </div>
            )}

            {loading && (
              <div className="py-2">
                {/* <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
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

            {!loading && error && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-gray-800">
                  Unable to generate report
                </p>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Something went wrong while loading the inspection report. Please
                  try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (formikRef.current) {
                      fetchReport(formikRef.current.values);
                    }
                  }}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#3c8dbc] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#357ca5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c8dbc] focus-visible:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && !hasSearched && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3c8dbc]/10 text-[#3c8dbc]">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-gray-800">
                  Generate Inspection Report
                </p>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Select the required filters and date range, then click Search to
                  generate the report.
                </p>
              </div>
            )}

            {!loading && !error && hasSearched && reportData.length === 0 && (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-gray-800">
                  No records found
                </p>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  No inspection records were found for the selected filters and date
                  range.
                </p>
              </div>
            )}

            {showTable && (
              <div className="w-full rounded border border-gray-200">
                <div
                  className="proforma-three-report-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Inspection report"
                >
                  <table className="proforma-three-report-table">
                    <colgroup>
                      <col style={{ width: COL_WIDTH.sl, minWidth: COL_WIDTH.sl }} />
                      <col
                        style={{
                          width: COL_WIDTH.particular,
                          minWidth: COL_WIDTH.particular,
                        }}
                      />
                      {NUMERIC_KEYS.map((key) => (
                        <col
                          key={key}
                          style={{
                            width: COL_WIDTH[key],
                            minWidth: COL_WIDTH[key],
                          }}
                        />
                      ))}
                    </colgroup>
                    <thead>
                      <tr className="bg-[#3c8dbc] text-white">
                        <th
                          rowSpan={2}
                          style={{ width: COL_WIDTH.sl, minWidth: COL_WIDTH.sl }}
                          className={thClass}
                        >
                          Sl. No.
                        </th>
                        <th
                          rowSpan={2}
                          style={{
                            width: COL_WIDTH.particular,
                            minWidth: COL_WIDTH.particular,
                          }}
                          className={thClass}
                        >
                          Particular
                        </th>
                        <th
                          style={{ width: COL_WIDTH.mtw, minWidth: COL_WIDTH.mtw }}
                          className={thClass}
                        >
                          MTW
                        </th>
                        <th
                          colSpan={2}
                          style={{
                            width: COL_WIDTH.clra_reg + COL_WIDTH.clra_lic,
                            minWidth: COL_WIDTH.clra_reg + COL_WIDTH.clra_lic,
                          }}
                          className={thClass}
                        >
                          CLRA
                        </th>
                        <th
                          colSpan={2}
                          style={{
                            width: COL_WIDTH.ismw_reg + COL_WIDTH.ismw_lic,
                            minWidth: COL_WIDTH.ismw_reg + COL_WIDTH.ismw_lic,
                          }}
                          className={thClass}
                        >
                          ISMW
                        </th>
                        <th
                          style={{ width: COL_WIDTH.bocwa, minWidth: COL_WIDTH.bocwa }}
                          className={thClass}
                        >
                          BOCWA
                        </th>
                      </tr>
                      <tr className="bg-[#3c8dbc] text-white">
                        <th
                          style={{ width: COL_WIDTH.mtw, minWidth: COL_WIDTH.mtw }}
                          className={thSubClass}
                        >
                          Registration
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.clra_reg,
                            minWidth: COL_WIDTH.clra_reg,
                          }}
                          className={thSubClass}
                        >
                          Registration
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.clra_lic,
                            minWidth: COL_WIDTH.clra_lic,
                          }}
                          className={thSubClass}
                        >
                          Licence
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.ismw_reg,
                            minWidth: COL_WIDTH.ismw_reg,
                          }}
                          className={thSubClass}
                        >
                          Registration
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.ismw_lic,
                            minWidth: COL_WIDTH.ismw_lic,
                          }}
                          className={thSubClass}
                        >
                          Licence
                        </th>
                        <th
                          style={{ width: COL_WIDTH.bocwa, minWidth: COL_WIDTH.bocwa }}
                          className={thSubClass}
                        >
                          Registration
                        </th>
                      </tr>
                      <tr className="bg-gray-50 text-gray-700">
                        <th
                          style={{ width: COL_WIDTH.sl, minWidth: COL_WIDTH.sl }}
                          className={romanThClass}
                        >
                          {ROMAN_HEADERS[0]}
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.particular,
                            minWidth: COL_WIDTH.particular,
                          }}
                          className={romanThClass}
                        >
                          {ROMAN_HEADERS[1]}
                        </th>
                        {NUMERIC_KEYS.map((key, index) => (
                          <th
                            key={key}
                            style={{
                              width: COL_WIDTH[key],
                              minWidth: COL_WIDTH[key],
                            }}
                            className={romanThClass}
                          >
                            {ROMAN_HEADERS[index + 2]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, index) => {
                        if (row.sl === "") {
                          return (
                            <tr key={`${row.particular}-${index}`} className="bg-gray-200">
                              <td
                                colSpan={8}
                                className="border border-gray-200 px-2 py-2 text-center align-middle text-xs font-semibold uppercase leading-snug"
                              >
                                {row.particular}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={`${row.sl}-${index}`}
                            className={
                              index % 2 === 0
                                ? "bg-white hover:bg-[#e8f4fa]"
                                : "bg-gray-50 hover:bg-[#e8f4fa]"
                            }
                          >
                            <td
                              style={{ width: COL_WIDTH.sl, minWidth: COL_WIDTH.sl }}
                              className="border border-gray-200 px-2 py-2 text-center align-middle text-xs leading-snug"
                            >
                              {row.sl}
                            </td>
                            <td
                              style={{
                                width: COL_WIDTH.particular,
                                minWidth: COL_WIDTH.particular,
                              }}
                              className="border border-gray-200 px-2 py-2 text-left align-middle text-xs leading-snug"
                            >
                              {row.particular}
                            </td>
                            {NUMERIC_KEYS.map((key) => (
                              <td
                                key={key}
                                style={{
                                  width: COL_WIDTH[key],
                                  minWidth: COL_WIDTH[key],
                                }}
                                className="border border-gray-200 px-2 py-2 text-center align-middle text-xs leading-snug"
                              >
                                {row[key]}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCReportProformaThree;
