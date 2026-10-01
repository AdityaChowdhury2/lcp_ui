import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  TableColumn,
  TableStyles,
} from "react-data-table-component";
import { Eye, Search } from "lucide-react";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

const SCHEDULED_TITLE_MARKER =
  "Minimum Rates of Wages in Scheduled Employments in West Bengal";

export type MinimumWagesEmploymentMode = "scheduled" | "non-scheduled";

/** GET minimum-wages/admin/get-minimum-wages-list */
export interface AdminMinimumWageListItem {
  title: string;
  month: string;
  year: number;
  monthint: number;
  synopsisUrl: string;
}

interface WageRow {
  type: "dynamic" | "static";
  title: string;
  month?: string | null;
  year?: string | number | null;
  monthint?: number;
  synopsisUrl?: string;
  fileUrl?: string | null;
  isNew?: boolean;
}

const ADMIN_MINIMUM_WAGES_LIST_URL = `${API_BASE}minimum-wages/admin/get-minimum-wages-list`;

function mapAdminListToRows(items: AdminMinimumWageListItem[]): WageRow[] {
  const currentYear = new Date().getFullYear();
  return items.map((item) => ({
    type: "dynamic" as const,
    title: item.title,
    month: item.month,
    year: item.year,
    monthint: item.monthint,
    synopsisUrl: item.synopsisUrl,
    isNew: item.year === currentYear,
  }));
}

async function fetchAdminMinimumWagesList(
  token: string,
): Promise<AdminMinimumWageListItem[]> {
  const response = await fetch(ADMIN_MINIMUM_WAGES_LIST_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const body = (await response.json().catch(() => null)) as
    | AdminMinimumWageListItem[]
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const message = Array.isArray((body as { message?: string[] })?.message)
      ? (body as { message: string[] }).message.join(", ")
      : (body as { message?: string })?.message;
    throw new Error(message || "Failed to load scheduled employment list.");
  }

  if (!Array.isArray(body)) {
    throw new Error("Invalid response from scheduled employment list API.");
  }

  return body;
}

interface ScheduledEmploymentListProps {
  mode: MinimumWagesEmploymentMode;
}

const PAGE_TITLES: Record<MinimumWagesEmploymentMode, string> = {
  scheduled: "Scheduled Employment",
  "non-scheduled": "Non Scheduled Employment",
};

const CARD_SUBTITLES: Record<MinimumWagesEmploymentMode, string> = {
  scheduled:
    "Minimum rates of wages in scheduled employments in West Bengal (month-wise)",
  "non-scheduled": "Other minimum wages notices and circulars (PDF)",
};

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
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
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

const MinimumWagesEmploymentList: FC<ScheduledEmploymentListProps> = ({
  mode,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<WageRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<WageRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const columns: TableColumn<WageRow>[] = useMemo(
    () => [
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
        name: "Description",
        grow: 2,
        minWidth: "280px",
        cell: (row) => (
          <div className="flex items-center justify-between gap-4 w-full min-w-0">
            <p className="text-slate-800 leading-snug m-0 flex-1 min-w-0">
              {row.title}
            </p>
            {row.isNew ? (
              <span
                className="shrink-0 rotate-[7deg] animate-blink text-white text-[9px] font-bold px-3 py-0.5 shadow-md tracking-wide bg-red-600 uppercase whitespace-nowrap"
                aria-label="New"
              >
                NEW
              </span>
            ) : null}
          </div>
        ),
        wrap: true,
      },
      {
        name: "Action",
        width: "100px",
        center: true,
        cell: (row) => {
          if (row.type === "static" && row.fileUrl) {
            return (
              <button
                type="button"
                title="Open PDF"
                onClick={() => window.open(row.fileUrl!, "_blank")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <img
                  src={`${IMAGE_BASE}pdf.png`}
                  alt="Open PDF"
                  className="h-5 w-5"
                />
              </button>
            );
          }

          if (row.type === "dynamic" && row.month && row.year != null) {
            return (
              <button
                type="button"
                title="View employment-wise minimum wages"
                onClick={() =>
                  navigate(
                    `/min-wages/scheduled-employment/${encodeURIComponent(String(row.month))}/${row.year}`,
                    { state: { title: row.title } },
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#3c8dbc] text-white hover:bg-[#357ca5] transition-colors shadow-sm"
              >
                <Eye size={16} strokeWidth={2} />
              </button>
            );
          }

          return <span className="text-slate-400">—</span>;
        },
      },
    ],
    [limit, navigate, page],
  );

  const isScheduledRow = (title?: string) => Boolean(title?.includes(SCHEDULED_TITLE_MARKER));

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        if (mode === "scheduled") {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Session expired. Please log in again.");
          }

          const list = await fetchAdminMinimumWagesList(token);
          const formatted = mapAdminListToRows(list);

          setRows(formatted);
          setFilteredRows(formatted);
          return;
        }

        const response = await fetch(
          `${API_BASE}minimum-wages/get-minimum-wages-list?type=static`,
        );
        const result = await response.json();

        const formatted: WageRow[] = (result ?? []).map(
          (item: WageRow & { type?: string }) => ({
            type: item.type === "static" ? "static" : "dynamic",
            title: item.title,
            month: item.month,
            year: item.year,
            fileUrl: item.fileUrl,
            isNew: item.isNew,
          }),
        );

        const forMode = formatted.filter(
          (item) => !isScheduledRow(item.title),
        );

        setRows(forMode);
        setFilteredRows(forMode);
      } catch (error) {
        console.error("Minimum wages list API error:", error);
        setRows([]);
        setFilteredRows([]);
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Failed to load minimum wages list.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [mode]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredRows(rows);
    } else {
      const q = searchText.toLowerCase();
      setFilteredRows(
        rows.filter((item) => item.title?.toLowerCase().includes(q)),
      );
    }
    setPage(1);
  }, [searchText, rows]);

  const pageTitle = PAGE_TITLES[mode];
  const cardSubtitle = CARD_SUBTITLES[mode];

  return (
    <div className="w-full max-w-full">
      <h1 className="text-[22px] md:text-[24px] font-medium text-slate-800 mb-1">
        {pageTitle}
      </h1>
      <p className="text-sm text-slate-500 mb-4">Minimum Wages Module</p>

      <div className="bg-white border border-slate-200 border-t-[3px] border-t-[#3c8dbc] rounded-md shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50 px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-slate-700 m-0">
              {pageTitle} List
            </h2>
            <p className="text-xs text-slate-500 mt-1 m-0">{cardSubtitle}</p>
          </div>
          {!loading && (
            <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1 self-start sm:self-center">
              {filteredRows.length} record{filteredRows.length === 1 ? "" : "s"}
            </span>
          )}
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
              placeholder="Search by title..."
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

export default MinimumWagesEmploymentList;
