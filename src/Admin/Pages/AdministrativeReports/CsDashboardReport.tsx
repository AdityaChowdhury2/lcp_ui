import React, { useRef, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { AlertCircle, FileText, Loader2, Search } from "lucide-react";
import { API_BASE } from "@/constants/constants";
import ReportDatePicker from "@/Components/ReportDatePicker";

interface FilterFormValues {
  service: string;
  fromDate: string;
  toDate: string;
}

interface ReportRow {
  id: number;
  dayCount: number;
  monthCount: number;
  yearCount: number;
  totalCount: number;
  transactionDate: string;
  status: string;
}

interface ReportResponse {
  reportName?: string;
  filters?: {
    service?: string;
    fromDate?: string;
    toDate?: string;
  };
  columns?: string[];
  rows?: Array<{
    serial?: number;
    dayCount?: number;
    monthCount?: number;
    yearCount?: number;
    totalCount?: number;
    transactionDate?: string;
    status?: string;
  }>;
}

const services = [
  {
    id: "0001",
    name: "Registration of Principal Employers Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0002",
    name: "Licensing for Contractors Under Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0003",
    name: "Renewal of Licence of Contractors Under the Contract Labour (Regulation & Abolition) Act, 1970",
  },
  {
    id: "0004",
    name: "Registration of Establishments Under Building and Other Construction Workers Act, 1996",
  },
  {
    id: "0005",
    name: "Registration of Motor Transport Workers under Motor Transport Workers Act, 1996",
  },
  {
    id: "0006",
    name: "Registration of Establishments employing Inter-State Migrant Workmen Act, 1979",
  },
  {
    id: "0007",
    name: "Licensing for Contractors Under Inter-State Migrant Workmen (RE&CS) Act, 1979 for Recruitment",
  },
  {
    id: "0008",
    name: "Licensing for Contractors Under Inter-State Migrant Workmen (RE&CS) Act, 1979 for Employment",
  },
];

const initialValues: FilterFormValues = {
  service: "",
  fromDate: "",
  toDate: "",
};

const validationSchema = Yup.object({
  service: Yup.string().required("Service is required"),
  fromDate: Yup.string().required("From Date is required"),
  toDate: Yup.string()
    .required("To Date is required")
    .test(
      "date-range",
      "To Date cannot be earlier than From Date",
      function (value) {
        const { fromDate } = this.parent as FilterFormValues;
        if (!fromDate || !value) return true;
        return value >= fromDate;
      },
    ),
});

const controlClass =
  "h-9 w-full border rounded px-3 py-2 text-sm text-gray-800 outline-none";

const invalidControlClass = "border-red-500";

function fieldClass(hasError: boolean) {
  return `${controlClass} ${hasError ? invalidControlClass : ""}`;
}

const CSReports: React.FC = () => {
  const formikRef = useRef<FormikProps<FilterFormValues> | null>(null);
  const [appliedService, setAppliedService] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [data, setData] = useState<ReportRow[]>([]);

  const resetReportState = () => {
    setData([]);
    setHasSearched(false);
    setFetchError(false);
    setAppliedService("");
  };

  const handleSearch = async (values: FilterFormValues) => {
    try {
      setLoading(true);
      setFetchError(false);
      setHasSearched(true);
      setAppliedService(values.service);

      const payload = {
        reportName: "CS_REPORT",
        service: values.service,
        fromDate: values.fromDate,
        toDate: values.toDate,
      };

      const res = await axios.post<ReportResponse>(
        `${API_BASE}reports/administrative`,
        payload,
      );

      const rows = Array.isArray(res.data?.rows) ? res.data.rows : [];
      const mapped: ReportRow[] = rows.map((row, index) => ({
        id: Number(row.serial ?? index + 1),
        dayCount: Number(row.dayCount ?? 0),
        monthCount: Number(row.monthCount ?? 0),
        yearCount: Number(row.yearCount ?? 0),
        totalCount: Number(row.totalCount ?? 0),
        transactionDate: String(row.transactionDate ?? ""),
        status: String(row.status ?? ""),
      }));

      setData(mapped);
    } catch (err) {
      console.error("CS report API error:", err);
      setData([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const showTable = !loading && !fetchError && hasSearched && data.length > 0;

  const selectedServiceName =
    services.find((s) => s.id === appliedService)?.name || "";

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">CS Reports</h1>
      </div>

      <div className="bg-white shadow border-t-4 border-blue-500 rounded mb-6">
        <div className="border-b px-4 py-3 flex items-center gap-2">
          <span className="font-semibold text-gray-700">
            Search For Data Send to CS Dashboard
          </span>
        </div>

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSearch}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            setFieldTouched,
          }: FormikProps<FilterFormValues>) => (
            <Form className="p-4 grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label
                  htmlFor="service"
                  className="block text-sm font-semibold mb-1"
                >
                  Search By Service <span className="text-red-500">*</span>
                </label>
                <Field
                  as="select"
                  id="service"
                  name="service"
                  className={fieldClass(!!(errors.service && touched.service))}
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
                {errors.service && touched.service && (
                  <p className="mt-1 text-xs text-red-600">{errors.service}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fromDate"
                  className="block text-sm font-semibold mb-1"
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

              <div>
                <label
                  htmlFor="toDate"
                  className="block text-sm font-semibold mb-1"
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

      <div className="bg-white shadow border-t-4 border-blue-500 rounded p-4">
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

        {!loading && fetchError && (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              Unable to generate report
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Something went wrong while loading the CS report. Please try
              again.
            </p>
            <button
              type="button"
              onClick={() => formikRef.current?.submitForm()}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-[#3c8dbc] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#357ca5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c8dbc] focus-visible:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        {showTable && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Records of Data Send to CS Dashboard
              </h2>
              <h5 className="mt-2 font-semibold">
                Service Name : {selectedServiceName}
              </h5>
            </div>

            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#3f86a8] text-white text-xs uppercase">
                    <th className="px-4 py-3 border text-left w-[8%]">SL. NO.</th>
                    <th className="px-4 py-3 border text-left">
                      SERVICE COUNT ON THAT DAY
                    </th>
                    <th className="px-4 py-3 border text-left">
                      SERVICE COUNT THIS MONTH
                    </th>
                    <th className="px-4 py-3 border text-left">
                      SERVICE COUNT CURRENT YEAR
                    </th>
                    <th className="px-4 py-3 border text-left">
                      SERVICE COUNT TILL DATE SINCE INCEPTION
                    </th>
                    <th className="px-4 py-3 border text-left w-[12%]">
                      TRANSACTION DATE
                    </th>
                    <th className="px-4 py-3 border text-left w-[10%]">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {data.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 border">{index + 1}</td>
                      <td className="px-4 py-3 border text-center">
                        {row.dayCount}
                      </td>
                      <td className="px-4 py-3 border text-center">
                        {row.monthCount}
                      </td>
                      <td className="px-4 py-3 border text-center">
                        {row.yearCount}
                      </td>
                      <td className="px-4 py-3 border text-center">
                        {row.totalCount}
                      </td>
                      <td className="px-4 py-3 border text-center">
                        {row.transactionDate}
                      </td>
                      <td className="px-4 py-3 border text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            row.status === "Sent"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && !fetchError && !hasSearched && (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3c8dbc]/10 text-[#3c8dbc]">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              Generate CS Report
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Select the required filters and date range, then click Search to
              view the report.
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
              No report records were found for the selected filters and date
              range.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSReports;
