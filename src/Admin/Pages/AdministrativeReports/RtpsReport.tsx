import React, { useRef, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { AlertCircle, ChevronDown, FileSpreadsheet, FileText, Loader2, Search } from "lucide-react";
import ReportDatePicker from "@/Components/ReportDatePicker";

interface FormValues {
  service: string;
  month: string;
}

interface RTPSRow {
  pending: number;
  received: number;
  provided: number;
  rejected: number;
  disposed: number;
  sentBack: number;
}

const services = [
  {
    id: "0001",
    name: "Registration of Principal Employers Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0011",
    name: "Amendment of Principal Employers Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0002",
    name: "Licensing for Contractors Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0012",
    name: "Amendment of License for Contractors Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0003",
    name: "Renewal of License of Contractors Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0004",
    name: "Registration of Establishments Under Building and Other Construction Workers (Regulation of Employment & Conditions of Service) Act, 1996",
  },
  {
    id: "0014",
    name: "Amendment of Register Establishments Under Building and Other Construction Workers (Regulation of Employment & Conditions of Service) Act, 1996",
  },
  {
    id: "0005",
    name: "Registration of Motor Transport Workers under Motor Transport Workers Act, 1961",
  },
  {
    id: "0015",
    name: "Renewal of Register Motor Transport Workers under Motor Transport Workers Act, 1961",
  },
  {
    id: "0006",
    name: "Registration of Establishments employing Inter-State Migrant Workmen (RE&CS) Act, 1979",
  },
  {
    id: "0007",
    name: "Licensing for Contractors Under Inter-State Migrant Workmen (RE&CS) Act, 1979 for Recruitment",
  },
  {
    id: "0008",
    name: "Licensing for Contractors Under Inter-State Migrant Workmen (RE&CS) Act, 1979 for Employment",
  },
  {
    id: "0009",
    name: "Renewal of License for Contractors Under Inter-State Migrant Workmen (RE&CS) Act, 1979 for Recruitment",
  },
  {
    id: "0010",
    name: "Renewal of License for Contractors Under Inter-State Migrant Workmen (RE&CS) Act, 1979 for Employment",
  },
];

const initialValues: FormValues = {
  service: "",
  month: "",
};

const validationSchema = Yup.object({
  service: Yup.string().required("Service is required"),
  month: Yup.string().required("Month is required"),
});

const TABLE_HEADERS = [
  "Pending as on 1st day of the month reported",
  "Received during the month reported",
  "Service provided during the month reported",
  "Rejected during the Month reported",
  "Disposed of within stipulated time period",
  "Send back to Applicant and out of coverage of RTPS",
] as const;

const controlClass =
  "h-9 w-full rounded border border-[#d2d6de] bg-white px-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/25 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

const invalidControlClass =
  "border-red-500 focus:border-red-500 focus:ring-red-200";

function fieldClass(hasError: boolean) {
  return `${controlClass} ${hasError ? invalidControlClass : ""}`;
}

const RTPSReport: React.FC = () => {
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [data, setData] = useState<RTPSRow[]>([]);

  const resetReportState = () => {
    setData([]);
    setHasSearched(false);
    setFetchError(false);
  };

  const fetchReports = async (values: FormValues) => {
    try {
      setLoading(true);
      setHasSearched(true);
      setFetchError(false);

      const payload = {
        reportName: "RTPS_REPORT",
        serviceName: services.find((s) => s.id === values.service)?.name || "",
        serviceId: services.find((s) => s.id === values.service)?.id || "",
        month: values.month,
      };

      const res = await axios.post(
        `${API_BASE}reports/administrative`,
        payload,
      );

      const apiData = res.data;

      if (!apiData || !apiData.rows || !apiData.rows.length) {
        setData([]);
        return;
      }

      const rowValues = apiData.rows[0].values;


      const mapped: RTPSRow = {
        pending: rowValues["Pending as on 1st day of the month reported"] || 0,
        received: rowValues["Received during the month reported"] || 0,
        provided: rowValues["Service provided during the month reported"] || 0,
        rejected: rowValues["Rejected during the Month reported"] || 0,
        disposed: rowValues["Disposed of within stipulated time period"] || 0,
        sentBack:
          rowValues["Sent back to Applicant and out of coverage of RTPS"] || 0,
      };

      setData([mapped]);
    } catch (err) {
      console.error("RTPS API error:", err);
      setData([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!data.length) return;

    const values = formikRef.current?.values;

    const serviceName =
      services.find((s) => s.id === values?.service)?.name || "";

    const wb = XLSX.utils.book_new();

    const rows: (string | number)[][] = [];

    rows.push([`Service Name : ${serviceName}`]);

    rows.push([
      "Name of the Department",
      "Name of Services",
      "Pending as on 1st day of the month reported",
      "Received during the month reported",
      "Service provided during the month reported",
      "Rejected during the Month reported",
      "Disposed of within stipulated time period",
      "Send back to Applicant and out of coverage of RTPS",
      "Remarks",
    ]);

    rows.push([
      "Col.1",
      "Col.2",
      "Col.3",
      "Col.4",
      "Col.5",
      "Col.6",
      "Col.7",
      "Col.8",
      "Col.9",
    ]);

    data.forEach((r) => {
      rows.push([
        "LABOUR COMMISSIONERATE",
        serviceName,
        r.pending,
        r.received,
        r.provided,
        r.rejected,
        r.disposed,
        r.sentBack,
        "",
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
            fill: {
              fgColor: { rgb: "3F86A8" },
            },
            font: {
              bold: true,
              color: { rgb: "FFFFFF" },
              size: 11,
            },
            alignment: {
              vertical: "center",
              horizontal: "center",
              wrapText: true,
            },
          };
        } else if (R === 2) {
          cell.s = {
            border,
            font: { bold: true },
            alignment: {
              vertical: "center",
              horizontal: "center",
            },
          };
        } else if (R === 0) {
          cell.s = {
            border,
            font: { bold: true, size: 14 },
            alignment: {
              vertical: "center",
              horizontal: "center",
            },
          };
        } else {
          cell.s = {
            border,
            alignment: {
              vertical: "center",
              horizontal: C === 1 ? "left" : "center",
              wrapText: true,
            },
          };
        }
      }
    }

    ws["!cols"] = [
      { wch: 28 },
      { wch: 60 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
      { wch: 26 },
      { wch: 18 },
      { wch: 15 },
    ];

    ws["!rows"] = [{ hpt: 32 }, { hpt: 45 }];

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    XLSX.utils.book_append_sheet(wb, ws, "RTPS Report");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const monthValue = values?.month;

    let formattedMonth = "Report";

    if (monthValue) {
      const [year, month] = monthValue.split("-");
      const date = new Date(Number(year), Number(month) - 1);

      formattedMonth = date.toLocaleString("en-GB", {
        month: "short",
        year: "2-digit",
      });
    }

    const fileName = `Monthly Report for the Month of ${formattedMonth.replace(
      " ",
      "-",
    )}(1).xlsx`;

    saveAs(blob, fileName);
  };

  const handleSubmit = (values: FormValues) => {
    fetchReports(values);
  };

  const showTable = !loading && !fetchError && data.length > 0;

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">RTPS Report</h1>
      </div>

      <div className="bg-white shadow border-t-4 border-[#3c8dbc] rounded mb-6">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <span className="font-semibold text-gray-700">
            Search For RTPS report
          </span>
        </div>

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
          }: FormikProps<FormValues>) => (
            <Form className="p-4 grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label
                  htmlFor="service"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  Search By Service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    id="service"
                    name="service"
                    className={`${fieldClass(!!(errors.service && touched.service))} appearance-none pr-8`}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      if (e.target.value !== values.service) {
                        resetReportState();
                      }
                      setFieldValue("service", e.target.value);
                    }}
                  >
                    <option value="">- Select -</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Field>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
                {errors.service && touched.service && (
                  <p className="mt-1 text-xs text-red-600">{errors.service}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="month"
                  className="mb-1.5 block text-sm font-semibold text-gray-800"
                >
                  Choose Month <span className="text-red-500">*</span>
                </label>
                <ReportDatePicker
                  id="month"
                  picker="month"
                  value={values.month}
                  onChange={(next) => {
                    if (next !== values.month) {
                      resetReportState();
                    }
                    setFieldValue("month", next).then(() => {
                      setFieldTouched("month", true, false);
                    });
                  }}
                  hasError={!!(errors.month && touched.month)}
                />
                {errors.month && touched.month && (
                  <p className="mt-1 text-xs text-red-600">{errors.month}</p>
                )}
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded bg-[#3c8dbc] px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#357ca5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c8dbc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <div className="bg-white shadow border-t-4 border-[#3c8dbc] rounded p-4">
        {showTable && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-800">
              Records of RTPS report
            </h2>
            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </button>
          </div>
        )}

        {loading && (
          <div className="py-2">
            <div className="overflow-hidden rounded border border-gray-200">
              <div className="h-10 animate-pulse bg-[#3c8dbc]/80" />
              {Array.from({ length: 4 }).map((_, i) => (
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
              Something went wrong while loading the RTPS report. Please try
              again.
            </p>
            <button
              type="button"
              onClick={() => {
                if (formikRef.current) {
                  fetchReports(formikRef.current.values);
                }
              }}
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
              Generate RTPS Report
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Select the required filters, then click Search to view the report.
            </p>
          </div>
        )}

        {!loading && !fetchError && hasSearched && data.length === 0 && (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              No records found
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              No report records were found for the selected service and month.
            </p>
          </div>
        )}

        {showTable && (
          <div
            className="w-full overflow-x-auto overflow-y-hidden border rounded"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="w-max min-w-max table-fixed border-collapse text-sm md:w-full md:min-w-full">
              <colgroup>
                {TABLE_HEADERS.map((header) => (
                  <col
                    key={header}
                    className="w-[200px] min-w-[200px] md:w-auto md:min-w-0"
                  />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-[#3f86a8] text-white text-xs">
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header}
                      className="w-[200px] min-w-[200px] px-4 py-3 border text-left font-semibold leading-snug uppercase whitespace-normal md:w-auto md:min-w-0"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="w-[200px] min-w-[200px] px-4 py-3 border text-center md:w-auto md:min-w-0">
                      {row.pending}
                    </td>
                    <td className="w-[200px] min-w-[200px] px-4 py-3 border text-center md:w-auto md:min-w-0">
                      {row.received}
                    </td>
                    <td className="w-[200px] min-w-[200px] px-4 py-3 border text-center md:w-auto md:min-w-0">
                      {row.provided}
                    </td>
                    <td className="w-[200px] min-w-[200px] px-4 py-3 border text-center md:w-auto md:min-w-0">
                      {row.rejected}
                    </td>
                    <td className="w-[200px] min-w-[200px] px-4 py-3 border text-center md:w-auto md:min-w-0">
                      {row.disposed}
                    </td>
                    <td className="w-[200px] min-w-[200px] px-4 py-3 border text-center md:w-auto md:min-w-0">
                      {row.sentBack}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RTPSReport;
