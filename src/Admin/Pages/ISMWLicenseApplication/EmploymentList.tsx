import { FC, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface ApiRow {
  sl: number;
  id: number;
  formSix: string;
  contractorName: string;
  establishmentName: string;
  establishmentAddress: string;
  registrationNumber: string;
  registrationDate: string | null;
  applicationDate: string | null;
  referenceNo: string;
  license:
    | { licenseNumber: string; issuedOn: string | null; validTill: string | null }
    | null;
  status: string;
  rawStatus: string;
}

const fmtDate = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const EmploymentList: FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const res = await axios.get(
          `${API_BASE}ismw-license/alc/employment-applications`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );

        if (res.data?.ok === false) {
          setNotice(res.data?.message || "No jurisdiction assigned.");
          setRows([]);
        } else {
          setRows(Array.isArray(res.data?.applications) ? res.data.applications : []);
        }
      } catch (err: any) {
        const message = err?.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message[0]
            : message || "Failed to load employment applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!search) return rows;
    const lower = search.toLowerCase();
    return rows.filter((r) =>
      [r.formSix, r.establishmentName, r.registrationNumber, r.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(lower)
    );
  }, [search, rows]);

  const tableColumns: TableColumn<ApiRow>[] = [
    {
      name: "SL NO.",
      width: "80px",
      cell: (_row, index) => (index ?? 0) + 1,
    },
    {
      name: "FORM-VI",
      width: "140px",
      selector: (row) => row.formSix,
      sortable: true,
      cell: (row) => <div className="font-semibold">{row.formSix || "—"}</div>,
    },
    {
      name: "ESTABLISHMENT / REG. NO.",
      grow: 2,
      cell: (row) => (
        <div className="py-1">
          <div className="font-semibold">{row.establishmentName || "—"}</div>
          <div className="text-xs text-gray-500">
            {row.registrationNumber}
            {row.registrationDate ? ` · ${fmtDate(row.registrationDate)}` : ""}
          </div>
        </div>
      ),
      wrap: true,
    },
    {
      name: "LICENSE DETAILS",
      grow: 1.5,
      cell: (row) =>
        row.license ? (
          <div className="py-1">
            <div className="font-semibold">{row.license.licenseNumber}</div>
            <div className="text-xs text-gray-500">
              {fmtDate(row.license.issuedOn)} – {fmtDate(row.license.validTill)}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">UNDER PROCESS</span>
        ),
      wrap: true,
    },
    {
      name: "APPLY DATE",
      width: "130px",
      selector: (row) => fmtDate(row.applicationDate) || "—",
      sortable: true,
    },
    {
      name: "STATUS",
      width: "170px",
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 rounded bg-[#eaf2f8] text-[#1E73BE] text-xs font-semibold">
          {row.status}
        </span>
      ),
    },
    {
      name: "ACTION",
      width: "150px",
      cell: (row) => (
        <button
          onClick={() =>
            navigate(`/ismwlicense-list/employment-details/${row.id}`)
          }
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 whitespace-nowrap"
        >
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];

  return (
    <div className="w-full pl-5 pt-5 pb-5 pr-5 bg-[#ededed]">
      <h1 className="text-2xl mb-4 text-gray-800">
        Applications List for Grant of License for Employment Under ISMW
      </h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <div className="flex items-center justify-between mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="border px-3 py-1.5 rounded text-sm w-64"
          />
        </div>

        {notice ? (
          <div className="border border-amber-300 bg-amber-50 text-amber-800 text-sm px-4 py-3 rounded">
            {notice}
          </div>
        ) : (
          <DataTable
            columns={tableColumns}
            data={filteredData}
            pagination
            striped
            highlightOnHover
            dense
            progressPending={loading}
            persistTableHead
            noDataComponent={
              <div className="py-4 text-sm text-gray-500 w-full text-left px-3">
                No applications found in your jurisdiction.
              </div>
            }
            customStyles={{
              headCells: {
                style: {
                  background: "#1E73BE",
                  color: "white",
                  fontWeight: "200",
                  fontSize: "12px",
                  borderRight: "1px solid #c9c9c9",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflow: "visible",
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
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EmploymentList;
