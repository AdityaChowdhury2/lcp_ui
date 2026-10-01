import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaList, FaFilePdf, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

/* =======================
   TYPES (extended based on your backend)
======================= */
interface ReturnItem {
  returnYear: number;
  finalStatus: boolean;
  statusCode: string;
  allowedActions: string[];
  submissionDate?: string | null;
}

interface InitialStateOfTU {
  registrationNumber: string | null;
  returnType: string | null;
  hasFinalReturn: boolean;
  returns: ReturnItem[];
}

interface CheckResponse {
  decision:
  | "ALLOW_START"
  | "ALREADY_SUBMITTED"
  | "BLOCKED_FORM_E"
  | "BLOCKED_CANCELLED";
  returnType: string;
  returnYear: number;
  statusCode?: string;
  message?: string;
}

function getReturnStatusLabel(statusCode: string): string {
  switch (statusCode) {
    case "APPROVED_BY_FEDERATION":
      return "Approved by Federation";
    case "APPROVED_BY_CTU":
      return "Approved by Central Trade Union";
    case "APPROVED":
      return "Approved";
    case "BACK_FOR_CORRECTION":
      return "Sent back for correction";
    case "NOT_SUBMITTED":
      return "Return Not Submitted";
    case "REJECTED_CTU":
      return "Rejected by Central Trade Union";
    case "PENDING_ADMIN":
      return "Pending at Admin";
    case "PENDING_FEDERATION":
      return "Pending at Federation";
    case "PENDING_CTU":
      return "Pending at Central Trade Union End";
    default:
      return "";
  }
}

function getReturnStatusColor(statusCode: string): string {
  switch (statusCode) {
    case "APPROVED_BY_FEDERATION":
    case "APPROVED_BY_CTU":
    case "APPROVED":
      return "#008000"; // Deep Green
    case "PENDING_ADMIN":
    case "PENDING_FEDERATION":
    case "PENDING_CTU":
      return "#0000ff"; // Blue
    case "BACK_FOR_CORRECTION":
      return "#d97706"; // Amber / Orange
    case "REJECTED_CTU":
      return "#dc2626"; // Red
    default:
      return "#0000ff";
  }
}

function formatDate(dateInput?: string | number | Date | null): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
    return dateInput;
  }
  const num = Number(dateInput);
  if (!isNaN(num) && num > 0) {
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const customStyles = {
  headRow: {
    style: {
      backgroundColor: "#2c5f8a",
      color: "#ffffff",
      fontWeight: "700",
      fontSize: "13px",
      minHeight: "42px",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: 700,
      borderRight: "1px solid rgba(255, 255, 255, 0.2)",
      paddingLeft: "12px",
      paddingRight: "12px",
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
      borderRight: "1px solid #e5e7eb",
      borderBottom: "1px solid #e5e7eb",
      paddingLeft: "12px",
      paddingRight: "12px",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e5e7eb",
      fontSize: "13px",
      color: "#475569",
    },
  },
};

const validationSchema = Yup.object({
  registrationNo: Yup.number().required("Registration Number is required"),
  year: Yup.string().required("Year of Return is required"),
});

/* =======================
   COMPONENT
======================= */
const TradeUnionAnnualReturn: React.FC = () => {
  const navigate = useNavigate();
  const userId = getUserId();
  const encryptedUserId = encryptionDecryptionFun("encrypt", String(userId));

  const [initialStateOfTU, setInitialStateOfTU] =
    useState<InitialStateOfTU | null>(null);
  const [registrationNo, setRegistrationNo] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [subAnulReturn, setSubAnulReturn] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    const getAnnualReturnList = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}trade-union/annual-return/initial-state`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );

        // console.log('res ------------>', res.data);
        setInitialStateOfTU(res.data);
        if (res.data?.registrationNumber)
          setRegistrationNo(String(res.data?.registrationNumber));
      } catch (err) {
        console.log(err);
      }
    };

    getAnnualReturnList();
  }, []);

  const columns = (
    navigate: ReturnType<typeof useNavigate>,
  ): TableColumn<ReturnItem>[] => [
      {
        name: "SL. NO",
        selector: (row, ind: any) => ind + 1,
      },
      {
        name: <p className="text-wrap break-words">Year of Return Submission</p>,
        selector: (row) => row.returnYear,
      },
      {
        name: <p className="text-wrap break-words">Return Submission Date</p>,
        selector: (row) => (row.submissionDate ? formatDate(row.submissionDate) : ""),
      },
      {
        name: "Status",
        cell: (row) => (
          <span
            style={{
              color: getReturnStatusColor(row.statusCode),
              fontWeight: 600,
            }}
          >
            {getReturnStatusLabel(row.statusCode)}
          </span>
        ),
      },
      {
        name: <p className="text-wrap break-words">View Final PDF</p>,
        cell: (row) => {
          const isDownloading = downloadingKey === `combined_${row.returnYear}`;
          return (
            <div className="flex items-center justify-center w-full">
              {isDownloading ? (
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                  <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Downloading...</span>
                </div>
              ) : row.finalStatus || row.allowedActions.includes("DOWNLOAD_ACK") ? (
                <button
                  type="button"
                  disabled={Boolean(downloadingKey)}
                  className="hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                  title="Download Final PDF"
                  onClick={() => {
                    downloadCombinedAnnualReturnPdf(
                      registrationNo,
                      String(row.returnYear),
                    );
                  }}
                >
                  <FaFilePdf className="w-5 h-5 text-red-600 hover:text-red-700" />
                </button>
              ) : (
                <span className="text-slate-400 text-xs italic">No PDF Available</span>
              )}
            </div>
          );
        },
      },
      {
        name: "Action",
        cell: (row) => {
          const isDownloadingAck = downloadingKey === `ack_${row.returnYear}`;
          if (isDownloadingAck) {
            return (
              <span className="text-blue-600 font-bold inline-flex items-center gap-1.5 text-xs">
                <FaSpinner className="w-3.5 h-3.5 animate-spin" /> Downloading...
              </span>
            );
          }
          if (row.allowedActions.includes("DOWNLOAD_ACK")) {
            return (
              <button
                type="button"
                disabled={Boolean(downloadingKey)}
                className="text-blue-600 cursor-pointer hover:underline font-bold disabled:opacity-50 text-left"
                onClick={() => {
                  downloadFinalAckPdf(registrationNo, String(row.returnYear));
                }}
              >
                Download Acknowledgement
              </button>
            );
          }
          if (row.statusCode === "PENDING_CTU") {
            return (
              <span className="text-blue-600 font-bold">
                Pending at CTU
              </span>
            );
          }
          if (row.statusCode === "PENDING_FEDERATION") {
            return (
              <span className="text-blue-600 font-bold">
                Pending at Federation
              </span>
            );
          }
          if (row.allowedActions.includes("RECTIFY")) {
            return (
              <span
                className="text-blue-600 cursor-pointer hover:underline font-bold"
                onClick={() =>
                  navigate("/trade-union/annual-upload-documents", {
                    state: {
                      regNo: registrationNo,
                      returnYear: row.returnYear,
                    },
                  })
                }
              >
                Rectify Data
              </span>
            );
          }
          if (row.allowedActions.includes("EDIT")) {
            return (
              <span
                className="text-blue-600 cursor-pointer hover:underline font-bold"
                onClick={() =>
                  navigate("/trade-union/annual-upload-documents", {
                    state: {
                      regNo: registrationNo,
                      returnYear: row.returnYear,
                    },
                  })
                }
              >
                Edit
              </span>
            );
          }
          if (row.allowedActions.includes("APPLY_AGAIN")) {
            return (
              <span
                className="text-blue-600 cursor-pointer hover:underline font-bold"
                onClick={() =>
                  navigate("/trade-union/annual-upload-documents", {
                    state: {
                      regNo: registrationNo,
                      returnYear: row.returnYear,
                    },
                  })
                }
              >
                Apply Again
              </span>
            );
          }
          return null;
        },
      },
    ];

  const downloadFinalAckPdf = async (regNo: string, returnYear: string) => {
    const key = `ack_${returnYear}`;
    if (downloadingKey) return;
    setDownloadingKey(key);
    const toastId = toast.loading(`Preparing Acknowledgement PDF for ${returnYear}...`);

    try {
      const encryptedReturnYear =
        encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
      const encryptedRegId =
        encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
      const safeRegId = encodeURIComponent(encryptedRegId);
      const safeReturnYear = encodeURIComponent(encryptedReturnYear);

      const res = await axios.get(
        `${API_BASE}trade-union/annual-return/final-ack/pdf?encryptedRegId=${safeRegId}&encryptedWizardId=${safeReturnYear}&encryptedUserId=${encryptedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          responseType: "blob", // 🔥 Required for file
        },
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Final_Acknowledgement_${returnYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.update(toastId, {
        render: `Acknowledgement PDF for ${returnYear} downloaded!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Final Ack PDF download failed", error);
      toast.update(toastId, {
        render: "Unable to download Final Acknowledgement PDF",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setDownloadingKey(null);
    }
  };

  const downloadCombinedAnnualReturnPdf = async (
    regNo: string,
    returnYear: string,
  ) => {
    const key = `combined_${returnYear}`;
    if (downloadingKey) return;
    setDownloadingKey(key);
    const toastId = toast.loading(`Preparing Combined Annual Return PDF for ${returnYear}...`);

    try {
      const encryptedReturnYear =
        encryptionDecryptionFun("encrypt", String(returnYear)) ?? "";
      const encryptedRegId =
        encryptionDecryptionFun("encrypt", String(regNo)) ?? "";
      const safeRegId = encodeURIComponent(encryptedRegId);
      const safeReturnYear = encodeURIComponent(encryptedReturnYear);

      const res = await axios.get(
        `${API_BASE}trade-union/annual-return/combined/pdf?encryptedRegId=${safeRegId}&encryptedWizardId=${safeReturnYear}&encryptedUserId=${encryptedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          responseType: "blob", // 🔥 Required
        },
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Combined_Annual_Return_${returnYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.update(toastId, {
        render: `Combined Annual Return PDF for ${returnYear} downloaded!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Combined PDF download failed", error);
      toast.update(toastId, {
        render: "Unable to download Combined Annual Return PDF",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleCheckAvailability = async (formValues: {
    registrationNo: string;
    year: string;
  }) => {
    setLoading(true);
    setErrorMsg("");
    setCheckResult(null);
    if (formValues.registrationNo) {
      setRegistrationNo(String(formValues.registrationNo));
    }
    if (formValues.year) {
      setSelectedYear(String(formValues.year));
    }

    try {
      const res = await axios.post(
        `${API_BASE}trade-union/annual-return/check-availability`,
        formValues,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      setCheckResult(res.data);

      if (res.data?.decision === "ALLOW_START") {
        setSubAnulReturn(true);
        setErrorMsg("");
      } else if (res.data?.decision === "ALREADY_SUBMITTED") {
        setSubAnulReturn(false);
        setErrorMsg("");
      } else if (res.data?.decision === "BLOCKED_FORM_E") {
        setSubAnulReturn(false);
        setErrorMsg("Submission blocked: Form-E Notice Issued.");
      } else if (res.data?.decision === "BLOCKED_CANCELLED") {
        setSubAnulReturn(false);
        setErrorMsg("Submission blocked: Trade Union Cancelled.");
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Error checking availability. Please try again.";

      setSubAnulReturn(false);
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnnualReturn = async (values: {
    registrationNo: string;
    year: string;
  }) => {
    const targetRegNo = String(values?.registrationNo || registrationNo);
    const targetYear = Number(values?.year || selectedYear || checkResult?.returnYear || 0);
    navigate("/trade-union/trade_union", {
      state: {
        regNo: targetRegNo,
        returnYear: targetYear,
      },
    });
  };

  const currentYear = new Date().getFullYear();
  const returnYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="bg-[#f4f6f8] min-h-screen p-4 md:p-6 font-sans text-slate-800">
      <h2 className="text-[20px] md:text-[22px] font-semibold mb-4 text-slate-800 tracking-tight">
        INFORMATION UNDER TRADE UNION
      </h2>

      {/* FORM SECTION */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm mb-6 overflow-hidden">
        <div className="bg-[#2c5f8a] text-white px-4 py-2.5 font-semibold text-[14px]">
          ANNUAL RETURN FOR TRADE UNION
        </div>

        <Formik
          initialValues={{
            registrationNo,
            year: "",
          }}
          validationSchema={validationSchema}
          enableReinitialize // ← important for pre-filling from API
          onSubmit={handleCheckAvailability}
        >
          {({ values, isSubmitting }) => {
            return (
              <Form className="p-5 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registration Number of the Trade Union{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <Field
                      className="w-full h-[38px] border border-slate-300 rounded px-3 text-sm focus:outline-none focus:border-[#2c5f8a] focus:ring-2 focus:ring-[#2c5f8a]/20 transition-all text-slate-800 shadow-inner"
                      name="registrationNo"
                      type="text"
                      style={{ backgroundColor: registrationNo !== "" ? "#f8fafc" : "#ffffff" }}
                    />
                    <ErrorMessage
                      name="registrationNo"
                      component="div"
                      className="text-red-600 text-xs mt-1 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Year of Return <span className="text-red-600">*</span>
                    </label>
                    <Field name="year">
                      {({ field }: any) => (
                        <select
                          {...field}
                          className="w-full h-[38px] border border-slate-300 rounded px-3 text-sm focus:outline-none focus:border-[#2c5f8a] focus:ring-2 focus:ring-[#2c5f8a]/20 transition-all bg-white text-slate-800 shadow-inner"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            field.onChange(e);
                            setSubAnulReturn(false);
                            setCheckResult(null);
                            setErrorMsg("");
                            setSelectedYear(e.target.value);
                          }}
                        >
                          <option value="">- Select Year -</option>
                          {returnYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="year"
                      component="div"
                      className="text-red-600 text-xs mt-1 font-medium"
                    />
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-3.5 mt-5 rounded-r">
                  <p className="text-[#d9534f] text-xs md:text-sm font-semibold leading-relaxed">
                    Note: If you are not registered or an invalid registered
                    number is given, then please register yourself to fill online
                    return else you will be redirected to the respective
                    application to generate a registration number.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-6 py-2.5 text-white text-xs font-bold uppercase rounded bg-[#337ab7] hover:bg-[#286090] transition shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {loading ? "Checking..." : "CHECK AVAILABILITY"}
                  </button>

                  {subAnulReturn && (
                    <button
                      type="button"
                      onClick={() => handleSubmitAnnualReturn(values)}
                      className="px-6 py-2.5 text-white text-xs font-bold uppercase rounded bg-[#2c5f8a] hover:bg-[#204768] transition shadow-sm cursor-pointer active:scale-95"
                    >
                      SUBMIT ANNUAL RETURN
                    </button>
                  )}
                </div>

                {/* CONDITIONAL MESSAGES */}
                {errorMsg && (
                  <div
                    role="alert"
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-5 rounded-r text-sm font-medium"
                  >
                    {errorMsg}
                  </div>
                )}

                {checkResult?.decision === "ALREADY_SUBMITTED" &&
                  checkResult?.returnYear && (
                    <div
                      className={`border-l-4 p-4 mt-5 rounded-r text-sm font-semibold ${
                        checkResult.statusCode === "APPROVED" ||
                        checkResult.statusCode === "APPROVED_BY_CTU" ||
                        checkResult.statusCode === "APPROVED_BY_FEDERATION"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-amber-50 border-amber-500 text-amber-900"
                      }`}
                    >
                      <p>
                        {checkResult.statusCode === "APPROVED" ||
                        checkResult.statusCode === "APPROVED_BY_CTU" ||
                        checkResult.statusCode === "APPROVED_BY_FEDERATION"
                          ? "✓ "
                          : "⚠️ "}
                        {checkResult.message ||
                          `Trade Union Annual Return for the year ${checkResult.returnYear} has already been submitted.`}
                      </p>
                    </div>
                  )}

                {/* SUBMITTED ANNUAL RETURN LIST TABLE */}
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden mt-8 shadow-sm">
                  <div className="bg-[#2c5f8a] text-white px-4 py-2.5 font-semibold text-[13px] flex gap-2 items-center">
                    <FaList className="w-3.5 h-3.5 text-sky-200" />
                    <span className="uppercase tracking-wide">SUBMITTED ANNUAL RETURN LIST</span>
                  </div>

                  <div className="p-4">
                    <DataTable
                      columns={columns(navigate)}
                      data={initialStateOfTU?.returns ?? []}
                      striped
                      pagination
                      responsive
                      customStyles={customStyles}
                      noDataComponent={
                        values.year
                          ? `No return found for year ${values.year}`
                          : "No returns available"
                      }
                    />
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default TradeUnionAnnualReturn;
