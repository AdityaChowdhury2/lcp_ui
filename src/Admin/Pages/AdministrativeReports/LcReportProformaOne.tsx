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

type CellValue = number | string;

interface RowData {
  sl: string;
  particular: string;

  mw_agri: CellValue;
  mw_non_agri: CellValue;

  child_labour: CellValue;
  equal_remuneration: CellValue;
  payment_wages: CellValue;
  motor_transport: CellValue;
  wb_house_rent: CellValue;
  sales_promotion: CellValue;
  inter_state: CellValue;
  beedi: CellValue;
  gratuity: CellValue;
  contract_labour: CellValue;
  bocw: CellValue;
  wb_shops: CellValue;
  bonus: CellValue;
  maternity: CellValue;
  welfare_fund: CellValue;
  total: CellValue;
}

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

const ACT_HEADERS = [
  "Child Labour (P&R) Act, 1986",
  "Equal Remuneration Act, 1976 thereunder",
  "Payment of Wages Act, 1936",
  "Motor Transport Workers Act, 1961",
  "The West Bengal Workmen's House-Rent Allowance Act, 1974",
  "Sales Promotion Emp.(C.S) Act, 1976",
  "Inter State Migrant Workers (RE&CS) Act, 1979",
  "Beedi & Cigar Workers (RE&CS) Act, 1966",
  "Payment of Gratuity Act, 1972",
  "Contract Labour (R&A) Act, 1976",
  "BOCW(RE&CS) Act, 1996",
  "W.B. Shops & Establishments Act, 1963",
  "The Payment of Bonus Act, 1965",
  "Maternity Benefit Act, 1961",
  "The West Bengal Labour Welfare Fund Act, 1974",
];

const ROMAN_HEADERS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

const NUMERIC_KEYS: (keyof RowData)[] = [
  "mw_agri",
  "mw_non_agri",
  "child_labour",
  "equal_remuneration",
  "payment_wages",
  "motor_transport",
  "wb_house_rent",
  "sales_promotion",
  "inter_state",
  "beedi",
  "gratuity",
  "contract_labour",
  "bocw",
  "wb_shops",
  "bonus",
  "maternity",
  "welfare_fund",
  "total",
];

const COL_WIDTH = {
  sl: 72,
  particular: 260,
  mw_agri: 90,
  mw_non_agri: 96,
  child_labour: 140,
  equal_remuneration: 148,
  payment_wages: 140,
  motor_transport: 150,
  wb_house_rent: 168,
  sales_promotion: 150,
  inter_state: 156,
  beedi: 150,
  gratuity: 140,
  contract_labour: 148,
  bocw: 132,
  wb_shops: 156,
  bonus: 140,
  maternity: 140,
  welfare_fund: 168,
  total: 80,
} as const;

const REPORT_TABLE_STYLES = `
  .proforma-one-report-scroll {
    width: 100%;
    overflow-x: auto;
  }
  .proforma-one-report-table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
    table-layout: auto;
  }
  .proforma-one-report-table thead th {
    white-space: normal;
    word-break: normal;
    overflow-wrap: normal;
    line-height: 1.35;
    vertical-align: middle;
  }
  .proforma-one-report-table tbody td {
    white-space: normal;
    word-break: normal;
    overflow-wrap: break-word;
  }
`;

// const months = [
//   "Jan","Feb","Mar","Apr","May","Jun",
//   "Jul","Aug","Sep","Oct","Nov","Dec",
// ];

// const getDaysInMonth = (year: number, month: number): number =>
//   new Date(year, month, 0).getDate();

/** -------------------------------
 * Component
 --------------------------------*/
const LCReportProformaOne: React.FC = () => {
  const formikRef = useRef<FormikProps<ApplicantFormValues> | null>(null);

  const [districts, setDistricts] = useState<ApiOption[]>([]);
  const [subdivisions, setSubdivisions] = useState<ApiOption[]>([]);
  const [blocks, setBlocks] = useState<ApiOption[]>([]);
  const [selectedDistId, setSelectedDistId] = useState<string | null>("");
  const [selectedSubdivId, setSelectedSubdivId] = useState<string | null>("");
  const [reportData, setReportData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const resetReportState = () => {
    setReportData([]);
    setHasSearched(false);
    setError(false);
  };

const data: RowData[] = [
  {
    sl: "1",
    particular: "No. of Inspections conducted",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "2.a",
    particular: "No. of infringements detected",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "2.b",
    particular: "No. of infringements pending disposal at the end of the previous month",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "2.c",
    particular: "Total no. of infringements(2a+2b) handled",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "3",
    particular: "No. of infringements let off after compliance",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "4",
    particular: "No. of Court cases launched",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "5",
    particular: "No. of infringements pending disposal at the end of the month",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "6",
    particular: "No. of Court cases brought forward from the previous month",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "7",
    particular: "No. of Court cases disposed by way of",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "7.a",
    particular: "Conviction",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "7.b",
    particular: "Acquittal",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "8",
    particular: "Amount of fine imposed by court",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "9",
    particular: "No. of Court cases pending at the end of the month[(4+6)-7)",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "10",
    particular: "No. of claim cases brought forward from the previous month",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "11.a",
    particular: "No. of claim cases filed",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "11.b",
    particular: "No. of workers involved",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "12",
    particular: "No. of claim cases disposed off",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "13.a",
    particular: "Amount of claim decreed",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "13.b",
    particular: "No. of workers involved",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "14",
    particular: "No. of claim cases pending at Courts at the end of the month",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "15.a",
    particular: "No. of claim cases disposed of at the intervention of Labour Commissionerate Officers",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "15.b",
    particular: "No. of workers involved",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "16.a",
    particular: "Amount of money paid to the workers at such intervention",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
  {
    sl: "16.b",
    particular: "No. of workers involved",
    mw_agri: 0, mw_non_agri: 0, child_labour: 0, equal_remuneration: 0,
    payment_wages: 0, motor_transport: 0, wb_house_rent: 0, sales_promotion: 0,
    inter_state: 0, beedi: 0, gratuity: 0, contract_labour: 0, bocw: 0,
    wb_shops: 0, bonus: 0, maternity: 0, welfare_fund: 0, total: 0,
  },
];
  const exportToExcel = (values: ApplicantFormValues) => {
    // Convert selected IDs to names
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

    const title = `Monthly Consolidated Report on Enforcement of Various Labour Laws for Block/Municipality (${blockName}), Sub-Division (${subdivisionName}) (District : ${districtName}), for the month of (${values.fromDate} TO ${values.toDate}) AS ON ${today}`;

    const rows: any[][] = [];

    rows.push(["PROFORMA I"]);
    rows.push([title]);

    rows.push([
      "SL NO",
      "PARTICULARS",
      "Minimum Wages Act, 1948",
      "",
      "Child Labour (P&R) Act 1986",
      "Equal Remuneration Act, 1976",
      "Payment of Wages Act, 1936",
      "Motor Transport Workers Act, 1961",
      "The W.B Workmen’s House-Rent Allowance Act, 1974",
      "Sales Promotion Emp.(C.S) Act, 1976",
      "Inter State Migrant Workers (RE&CS) Act, 1979",
      "Beedi & Cigar Workers (RE&CS) Act, 1966",
      "Payment of Gratuity Act, 1972",
      "Contract Labour(R&A) Act, 1976",
      "BOCW(RE&CS) ACT, 1996",
      "W.B. Shops & Establishments Act, 1963",
      "The Payment of Bonus Act, 1965",
      "Maternity Benefit Act, 1961",
      "The West Bengal Labour Welfare Fund Act, 1974",
      "TOTAL",
    ]);

    rows.push([
      "",
      "",
      "Agril.",
      "Non-Agril",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    rows.push([
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
      "XIII",
      "XIV",
      "XV",
      "XVI",
      "XVII",
      "XVIII",
      "XIX",
      "XX",
    ]);

    const exportData = reportData.length ? reportData : data;

  exportData.forEach((r) => {
    rows.push([
      r.sl,
      r.particular,
      r.mw_agri,
      r.mw_non_agri,
      r.child_labour,
      r.equal_remuneration,
      r.payment_wages,
      r.motor_transport,
      r.wb_house_rent,
      r.sales_promotion,
      r.inter_state,
      r.beedi,
      r.gratuity,
      r.contract_labour,
      r.bocw,
      r.wb_shops,
      r.bonus,
      r.maternity,
      r.welfare_fund,
      r.total,

      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!rows"] = [
      { hpt: 28 }, // PROFORMA I
      { hpt: 45 }, // long title row
    ];

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

        cell.s = {
          border,
          alignment: {
            vertical: "center",
            horizontal: R <= 1 ? "center" : C === 1 ? "left" : "center",
            wrapText: true,
          },
          font: {
            size: R === 0 ? 14 : 10,
            bold: R <= 1,
          },
        };
      }
    }

    ws["!cols"] = [
      { wch: 6 },
      { wch: 45 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 10 },
    ];

    ws["!merges"] = [
      // PROFORMA I title
      { s: { r: 0, c: 0 }, e: { r: 0, c: 19 } },

      // Long report title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 19 } },

      // Minimum wages header
      { s: { r: 2, c: 2 }, e: { r: 2, c: 3 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Proforma-I");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "PROFORMA_I_REPORT.xlsx");
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
              id: d.id,
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
      reportName: "PROFORMA_ONE",
      district:
        districts.find((d) => String(d.id) === values.district)?.name || "",
      subDivision:
        subdivisions.find((s) => String(s.id) === values.subdivision)?.name ||
        "",
      block:
        blocks.find((b) => String(b.id) === values.block_municipality)?.name ||
        "",
      fromDate: values.fromDate,
      toDate: values.toDate,
    };

    const res = await axios.post(
      `${API_BASE}reports/administrative`,
      payload
    );

    const apiData = res.data;

    // -------------------------------
    // 🔥 MAP API RESPONSE → YOUR TABLE DATA
    // -------------------------------

    if (!apiData || !apiData.rows) {
      setReportData([]);
      return;
    }

    const cell = (value: unknown): CellValue => {
      if (value === undefined || value === null) return 0;
      return value as CellValue;
    };

    const mappedData: RowData[] = apiData.rows.map((row: any) => ({
      sl: String(row.slNo),
      particular: row.particular,

      mw_agri: cell(row.values["Minimum Wages Act, 1948 (Agril.)"]),
      mw_non_agri: cell(row.values["Minimum Wages Act, 1948 (Non-Agril.)"]),

      child_labour: cell(row.values["Child Labour (P&R) Act 1986"]),
      equal_remuneration: cell(row.values["Equal Remuneration Act, 1976"]),
      payment_wages: cell(row.values["Payment of Wages Act, 1936"]),
      motor_transport: cell(row.values["Motor Transport Workers Act, 1961"]),
      wb_house_rent: cell(
        row.values["W.B Workmen’s House-Rent Allowance Act, 1974"] ??
          row.values["W.B Workmen's House-Rent Allowance Act, 1974"],
      ),
      sales_promotion: cell(row.values["Sales Promotion Employees Act, 1976"]),
      inter_state: cell(row.values["Inter State Migrant Workers Act, 1979"]),
      beedi: cell(row.values["Beedi & Cigar Workers Act, 1966"]),
      gratuity: cell(row.values["Payment of Gratuity Act, 1972"]),
      contract_labour: cell(row.values["Contract Labour Act, 1976"]),
      bocw: cell(row.values["BOCW Act, 1996"]),
      wb_shops: cell(row.values["W.B Shops & Establishments Act, 1963"]),
      bonus: cell(row.values["Payment of Bonus Act, 1965"]),
      maternity: cell(row.values["Maternity Benefit Act, 1961"]),
      welfare_fund: cell(
        row.values["West Bengal Labour Welfare Fund Act, 1974"],
      ),

      total: cell(row.values["TOTAL"]),
    }));

    // 👉 IMPORTANT: override static data
    setReportData(mappedData);

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
                <h2 className="text-sm font-semibold text-gray-800">Proforma I</h2>
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
                  className="proforma-one-report-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Inspection report"
                >
                  <table className="proforma-one-report-table">
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
                          className="border border-white bg-[#3c8dbc] px-2 py-3 text-center text-xs font-semibold uppercase"
                        >
                          Sl. No.
                        </th>
                        <th
                          rowSpan={2}
                          style={{
                            width: COL_WIDTH.particular,
                            minWidth: COL_WIDTH.particular,
                          }}
                          className="border border-white bg-[#3c8dbc] px-2 py-3 text-center text-xs font-semibold uppercase"
                        >
                          Particular
                        </th>
                        <th
                          colSpan={2}
                          style={{
                            width: COL_WIDTH.mw_agri + COL_WIDTH.mw_non_agri,
                            minWidth: COL_WIDTH.mw_agri + COL_WIDTH.mw_non_agri,
                          }}
                          className="border border-white bg-[#3c8dbc] px-2 py-3 text-center text-xs font-semibold uppercase"
                        >
                          Minimum Wages Act, 1948
                        </th>
                        {ACT_HEADERS.map((title, index) => {
                          const key = NUMERIC_KEYS[index + 2];
                          return (
                            <th
                              key={title}
                              rowSpan={2}
                              style={{
                                width: COL_WIDTH[key],
                                minWidth: COL_WIDTH[key],
                              }}
                              className="border border-white bg-[#3c8dbc] px-2 py-3 text-center text-xs font-semibold uppercase"
                            >
                              {title}
                            </th>
                          );
                        })}
                        <th
                          rowSpan={2}
                          style={{ width: COL_WIDTH.total, minWidth: COL_WIDTH.total }}
                          className="border border-white bg-[#3c8dbc] px-2 py-3 text-center text-xs font-semibold uppercase"
                        >
                          Total
                        </th>
                      </tr>
                      <tr className="bg-[#3c8dbc] text-white">
                        <th
                          style={{
                            width: COL_WIDTH.mw_agri,
                            minWidth: COL_WIDTH.mw_agri,
                          }}
                          className="border border-white bg-[#3c8dbc] px-2 py-2 text-center text-xs font-semibold uppercase"
                        >
                          Agril
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.mw_non_agri,
                            minWidth: COL_WIDTH.mw_non_agri,
                          }}
                          className="border border-white bg-[#3c8dbc] px-2 py-2 text-center text-xs font-semibold uppercase"
                        >
                          Non-Agril
                        </th>
                      </tr>
                      <tr className="bg-gray-50 text-gray-700">
                        <th
                          style={{ width: COL_WIDTH.sl, minWidth: COL_WIDTH.sl }}
                          className="border border-gray-200 bg-gray-50 px-1 py-1.5 text-center text-xs font-semibold"
                        >
                          {ROMAN_HEADERS[0]}
                        </th>
                        <th
                          style={{
                            width: COL_WIDTH.particular,
                            minWidth: COL_WIDTH.particular,
                          }}
                          className="border border-gray-200 bg-gray-50 px-1 py-1.5 text-center text-xs font-semibold"
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
                            className="border border-gray-200 bg-gray-50 px-1 py-1.5 text-center text-xs font-semibold"
                          >
                            {ROMAN_HEADERS[index + 2]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, index) => (
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
                      ))}
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

export default LCReportProformaOne;
