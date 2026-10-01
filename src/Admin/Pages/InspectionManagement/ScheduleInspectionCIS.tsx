import { FC, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { RefreshCw } from "lucide-react";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

interface InspectionRow {
  id: number;
  factoryName: string;
  boilerRegistrationNo: string;
  district: string;
  inspectionDate: string;
  createdAt: string;
}

interface InspectionListResponse {
  data: InspectionRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const tableStyles = {
  headCells: {
    style: {
      background: "#1E73BE",
      color: "white",
      fontWeight: 600,
      fontSize: "12px",
      borderRight: "1px solid #c9c9c9",
      // whiteSpace: "normal" as const,
      wordBreak: "break-word" as const,
      overflow: "visible",
      textOverflow: "unset",
      overflowWrap: "break-word" as const,
      display: "block",
      maxWidth: "none",
      whiteSpace: "normal",
      lineHeight: "1.2",
      paddingTop: "8px",
      paddingBottom: "8px",
    },
  },
  rows: {
    style: {
      fontSize: "12px",
      borderBottom: "1px solid #e5e7eb",
    },
  },
  cells: {
    style: {
      paddingTop: "12px",
      paddingBottom: "12px",
      borderRight: "1px solid #e5e7eb",
    },
  },
};

const formatDisplayDate = (value: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

import type { RootState } from "@/store/store";

const ScheduleInspectionCIS: FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Allow either the specific user or any authenticated user with role 12.
  const userRole = Number(user?.role);
  const isAllowedUser =
    !!user &&
    (
      ((String(user.uid) === "18045") &&
        user.mail === "nc@yopmail.com") ||
      userRole === 12
    );
  if (!isAllowedUser) {
    return <Navigate to="/forbidden" replace />;
  }
  const [tableData, setTableData] = useState<InspectionRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchInspections = useCallback(
    async (nextPage: number, nextLimit: number) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.get<InspectionListResponse>(
          `${API_BASE}inspections`,
          {
            params: { page: nextPage, limit: nextLimit },
            headers: getAuthHeaders(),
          },
        );

        const rows = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setTableData(rows);
        setTotalRows(Number(response.data?.pagination?.total ?? rows.length));
      } catch (error) {
        setTableData([]);
        setTotalRows(0);
        setErrorMessage(
          getApiErrorMessage(error, "Failed to load inspection records."),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchInspections(page, limit);
  }, [fetchInspections, limit, page]);

  const tableColumns: TableColumn<InspectionRow>[] = [
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
          }}
        >
          SL NO.
        </div>
      ),
      width: "90px",
      selector: (_row, index) => (page - 1) * limit + (index ?? 0) + 1,
      cell: (_row, index) => (
        <div className="w-full">{(page - 1) * limit + (index ?? 0) + 1}</div>
      ),
      sortable: true,
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
          }}
        >
          BOILER NAME
        </div>
      ),
      selector: (row) => row.factoryName,
      sortable: true,
      wrap: true,
      grow: 2,
      minWidth: "180px",
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
          }}
        >
          BOILER REGISTRATION NO.
        </div>
      ),
      selector: (row) => row.boilerRegistrationNo,
      sortable: true,
      wrap: true,
      grow: 1.4,
      minWidth: "170px",
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
          }}
        >
          DISTRICT
        </div>
      ),
      selector: (row) => row.district || "",
      sortable: true,
      wrap: true,
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
          }}
        >
          INSPECTION DATE
        </div>
      ),
      selector: (row) => row.inspectionDate,
      sortable: true,
      cell: (row) => <div>{formatDisplayDate(row.inspectionDate)}</div>,
      minWidth: "120px",
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
          }}
        >
          CREATED AT
        </div>
      ),
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => <div>{formatDisplayDate(row.createdAt)}</div>,
      minWidth: "120px",
    },
  ];

  return (
    <div className="w-full bg-[#ededed] pb-5 pl-[20px] pr-5 pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-gray-800">Inspection List</h1>
        <button
          type="button"
          onClick={() => void fetchInspections(page, limit)}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-[#1E73BE] bg-white px-3 py-2 text-sm font-medium text-[#1E73BE] disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white p-3">
        {errorMessage ? (
          <div className="mb-3 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <DataTable
          columns={tableColumns}
          data={tableData}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={page}
          paginationPerPage={limit}
          paginationRowsPerPageOptions={[10, 20, 50]}
          onChangePage={(nextPage) => setPage(nextPage)}
          onChangeRowsPerPage={(nextLimit, nextPage) => {
            setLimit(nextLimit);
            setPage(nextPage);
          }}
          progressPending={loading}
          striped
          highlightOnHover
          dense
          responsive
          customStyles={tableStyles}
          noDataComponent="No inspection records found."
        />
      </div>
    </div>
  );
};

export default ScheduleInspectionCIS;
