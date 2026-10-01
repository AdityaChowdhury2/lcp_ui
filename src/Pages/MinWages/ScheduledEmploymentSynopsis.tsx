import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { ArrowLeft, Search, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

interface EmploymentSynopsisRow {
  employmentId?: number;
  employment: string;
  fileUrl: string | null;
  hasFile: boolean;
  /** 0 = draft — upload/re-upload allowed; 1 = published — view only */
  status: number;
}

/** Upload allowed only when status is 0 (not yet finalized). */
const canUploadOrReupload = (row: EmploymentSynopsisRow) =>
  Number(row.status) === 0;

const UPLOAD_URL = `${API_BASE}minimum-wages/admin/upload-minimum-wage-file`;
const FINAL_SUBMIT_URL = `${API_BASE}minimum-wages/admin/final-submit`;
const PDF_ACCEPT = "application/pdf,.pdf";

const TABLE_CUSTOM_STYLES: TableStyles = {
  table: {
    style: {
      backgroundColor: "#ffffff",
      borderRadius: "6px",
      overflow: "hidden",
    },
  },
  headRow: {
    style: {
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      minWidth: "80px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      minHeight: "56px",
      color: "#1e293b",
      borderBottom: "1px solid #f1f5f9",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8fafc",
      transition: "background-color 0.15s ease",
    },
  },
  cells: {
    style: {
      paddingTop: "14px",
      paddingBottom: "14px",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#475569",
      minHeight: "52px",
    },
  },
};

const ScheduledEmploymentSynopsis: FC = () => {
  const { month: monthParam, year: yearParam } = useParams<{
    month: string;
    year: string;
  }>();
  const location = useLocation();
  const listTitle = (location.state as { title?: string } | null)?.title;

  const month = monthParam ? decodeURIComponent(monthParam) : "";
  const year = yearParam ? Number(yearParam) : NaN;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingEmploymentIdRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState<EmploymentSynopsisRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<EmploymentSynopsisRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [uploadingEmploymentId, setUploadingEmploymentId] = useState<
    number | null
  >(null);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  /** At least one row with status 0 — uploads allowed */
  const hasDraftRows = useMemo(
    () => rows.some((row) => Number(row.status) === 0),
    [rows],
  );

  /** Every active employment has an uploaded PDF */
  const allEmploymentsHaveFile = useMemo(
    () =>
      rows.length > 0 &&
      rows.every((row) => row.hasFile && Boolean(row.fileUrl?.trim())),
    [rows],
  );

  /** Can finalize only when drafts exist and every employment has a file */
  const canFinalSubmit = hasDraftRows && allEmploymentsHaveFile;

  /** Every row status 1 — finalized; view/download only */
  const isPeriodFinalized = rows.length > 0 && !hasDraftRows;

  const pageHeading = useMemo(() => {
    if (listTitle) return listTitle;
    if (month && Number.isFinite(year)) {
      return `The Minimum Rates of Wages in Scheduled Employments in West Bengal as on ${month}, ${year}`;
    }
    return "Scheduled Employment — Employment-wise Minimum Wages";
  }, [listTitle, month, year]);

  const loadSynopsis = useCallback(async () => {
    if (!month || !Number.isFinite(year)) {
      setErrorMsg("Invalid month or year in URL.");
      setRows([]);
      setFilteredRows([]);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const response = await fetch(
        `${API_BASE}minimum-wages/get-employment-wise-minimum-wages/${encodeURIComponent(month)}/${year}`,
      );

      const result = (await response.json().catch(() => null)) as
        | EmploymentSynopsisRow[]
        | { message?: string | string[] }
        | null;

      if (!response.ok) {
        const message = Array.isArray(
          (result as { message?: string[] })?.message,
        )
          ? (result as { message: string[] }).message.join(", ")
          : (result as { message?: string })?.message;
        throw new Error(message || "Failed to load employment-wise wages.");
      }

      const data: EmploymentSynopsisRow[] = Array.isArray(result)
        ? result.map((item) => ({
          ...item,
          status: Number(item.status ?? 0),
        }))
        : [];
      setRows(data);
      setFilteredRows(data);
    } catch (error) {
      console.error("Employment-wise minimum wages API error:", error);
      setRows([]);
      setFilteredRows([]);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Failed to load employment-wise minimum wages.",
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadSynopsis();
  }, [loadSynopsis]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredRows(rows);
    } else {
      const q = searchText.toLowerCase();
      setFilteredRows(
        rows.filter((item) =>
          item.employment?.toLowerCase().includes(q),
        ),
      );
    }
    setPage(1);
  }, [searchText, rows]);

  const openFilePicker = (employmentId: number) => {
    if (!hasDraftRows) {
      toast.info("This period is finalized. Upload is not allowed.");
      return;
    }
    pendingEmploymentIdRef.current = employmentId;
    fileInputRef.current?.click();
  };

  const uploadFile = async (employmentId: number, file: File) => {
    if (!hasDraftRows) {
      toast.error("This period is finalized. Upload is not allowed.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("month", month);
    formData.append("year", String(year));
    formData.append("employmentId", String(employmentId));

    setUploadingEmploymentId(employmentId);

    try {
      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const body = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string | string[];
      } | null;

      if (!response.ok) {
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message;
        throw new Error(message || "File upload failed.");
      }

      toast.success(
        typeof body?.message === "string"
          ? body.message
          : "File uploaded successfully.",
      );
      await loadSynopsis();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "File upload failed.",
      );
    } finally {
      setUploadingEmploymentId(null);
      pendingEmploymentIdRef.current = null;
    }
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const employmentId = pendingEmploymentIdRef.current;
    event.target.value = "";

    if (!file || employmentId == null) return;
    await uploadFile(employmentId, file);
  };

  const handleFinalSubmit = async () => {
    // if (!canFinalSubmit) {
    //   const missing = rows.filter(
    //     (r) => !r.hasFile || !r.fileUrl?.trim(),
    //   ).length;
    //   toast.error(
    //     missing > 0
    //       ? `Upload PDF for all scheduled employments (${missing} remaining).`
    //       : "This period cannot be finalized.",
    //   );
    //   return;
    // }

    if (!month || !Number.isFinite(year)) {
      toast.error("Invalid month or year.");
      return;
    }

    const confirmed = window.confirm(
      `Final submit for ${month} ${year}? All ${rows.length} employments have files uploaded. After submit, uploads will be locked.`,
    );
    if (!confirmed) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    setSubmittingFinal(true);

    try {
      const response = await fetch(FINAL_SUBMIT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ month, year }),
      });

      const body = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string | string[];
      } | null;

      if (!response.ok) {
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message;
        throw new Error(message || "Final submit failed.");
      }

      toast.success(
        typeof body?.message === "string"
          ? body.message
          : "Final submit successful.",
      );
      await loadSynopsis();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Final submit failed.",
      );
    } finally {
      setSubmittingFinal(false);
    }
  };

  const columns: TableColumn<EmploymentSynopsisRow>[] = useMemo(() => {
    const baseColumns: TableColumn<EmploymentSynopsisRow>[] = [
      {
        name: "Sl. No.",
        width: "90px",
        center: true,
        cell: (_row, index) => (
          <span className="text-slate-600 font-medium tabular-nums">
            {(page - 1) * limit + (index ?? 0) + 1}
          </span>
        ),
      },
      {
        name: "Scheduled Employments",
        grow: 2,
        minWidth: "280px",
        cell: (row) => (
          <span className="text-slate-800 leading-snug">{row.employment}</span>
        ),
        wrap: true,
      },
      {
        name: "Download",
        width: "110px",
        center: true,
        cell: (row) =>
          row.hasFile && row.fileUrl ? (
            <button
              type="button"
              title="Download PDF"
              onClick={() => window.open(row.fileUrl!, "_blank")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <img
                src={`${IMAGE_BASE}pdf.png`}
                alt="Download PDF"
                className="h-5 w-5"
              />
            </button>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          ),
      },
    ];

    if (hasDraftRows) {
      baseColumns.push({
        name: "Upload",
        width: "140px",
        center: true,
        cell: (row) => {
          const employmentId = row.employmentId;

          if (employmentId == null || !canUploadOrReupload(row)) {
            return (
              <span
                className="text-slate-400 text-xs"
                title="Published — view only"
              >
                —
              </span>
            );
          }

          const isUploading = uploadingEmploymentId === employmentId;
          const label = row.hasFile ? "Re-upload" : "Upload";

          return (
            <button
              type="button"
              disabled={isUploading}
              title={row.hasFile ? "Replace PDF file" : "Upload PDF file"}
              onClick={() => openFilePicker(employmentId)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white bg-[#3c8dbc] hover:bg-[#357ca5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Upload size={14} />
              {isUploading ? "Uploading…" : label}
            </button>
          );
        },
      });
    }

    return baseColumns;
  }, [hasDraftRows, limit, page, uploadingEmploymentId]);

  return (
    <div className="w-full max-w-full">
      {hasDraftRows ? (
        <input
          ref={fileInputRef}
          type="file"
          accept={PDF_ACCEPT}
          className="hidden"
          onChange={handleFileInputChange}
        />
      ) : null}

      <Link
        to="/min-wages/scheduled-employment"
        className="inline-flex items-center gap-2 text-sm text-[#3c8dbc] hover:text-[#357ca5] mb-4"
      >
        <ArrowLeft size={16} />
        Back to Scheduled Employment
      </Link>

      <h1 className="text-[20px] md:text-[22px] font-medium text-slate-800 mb-1 leading-snug">
        {pageHeading}
      </h1>
      <p className="text-sm text-slate-500 mb-4">Minimum Wages Module</p>

      <div className="bg-white border border-slate-200 border-t-[3px] border-t-[#3c8dbc] rounded-md shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm md:text-base font-semibold text-slate-700 m-0">
            Employment-wise list
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-center sm:ml-auto">
            {!loading && (
              <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">
                {filteredRows.length} employment
                {filteredRows.length === 1 ? "" : "s"}
              </span>
            )}
            {/* {canFinalSubmit ? (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || submittingFinal}
                title="Publish all uploaded files for this month"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white bg-[#00a65a] hover:bg-[#008d4c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submittingFinal ? "Submitting…" : "Final Submit"}
              </button>
            ) : hasDraftRows && !allEmploymentsHaveFile ? (
              <span
                className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5"
                title="Upload a PDF for every employment before final submit"
              >
                {rows.filter((r) => !r.hasFile || !r.fileUrl?.trim()).length}{" "}
                upload(s) pending
              </span>
            ) : isPeriodFinalized ? (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                Finalized — view only
              </span>
            ) : null} */}
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading || submittingFinal}
              title="Publish all uploaded files for this month"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white bg-[#00a65a] hover:bg-[#008d4c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submittingFinal ? "Submitting…" : "Final Submit"}
            </button>
          </div>
        </div>

        {errorMsg ? (
          <div className="mx-4 mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : null}

        <div className="px-4 py-3 border-b border-slate-100 bg-white">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search employment..."
              className="h-[38px] w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#3c8dbc] focus:ring-2 focus:ring-[#3c8dbc]/20"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="p-3 md:p-4 pb-5 bg-slate-50 min-h-[200px]">
          <div className="rounded-md border border-slate-200 bg-white overflow-visible shadow-sm mb-1">
            <DataTable
              columns={columns}
              data={filteredRows}
              progressPending={loading}
              striped
              highlightOnHover
              responsive
              pagination
              paginationPerPage={limit}
              paginationRowsPerPageOptions={[10, 25, 50]}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(newLimit, p) => {
                setLimit(newLimit);
                setPage(p);
              }}
              noDataComponent={
                <div className="py-12 text-center text-slate-500 text-sm">
                  {loading ? "Loading..." : "No records found."}
                </div>
              }
              customStyles={TABLE_CUSTOM_STYLES}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledEmploymentSynopsis;
