import { FC, useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface AlcAnnualReturnRow {
  slno: number;
  wizardId: string;
  userId: string;
  establishmentName: string;
  services: string[];
  applyYear: string;
}

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const AnnualReturnList: FC = () => {
  const [tableData, setTableData] = useState<AlcAnnualReturnRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleViewDetails = async (row: AlcAnnualReturnRow) => {
    const key = `${row.wizardId}|${row.userId}`;
    // Open the tab synchronously (within the click gesture) so the popup
    // blocker doesn't kill it after the async PDF fetch; then point it at the
    // blob once ready.
    const tab = window.open("", "_blank");
    setViewingId(key);
    try {
      const res = await axios.get<Blob>(
        `${API_BASE}annual-return-ll/alc/pdf/${encodeURIComponent(
          row.wizardId
        )}/${encodeURIComponent(row.userId)}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      const url = URL.createObjectURL(res.data);
      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      console.error("Failed to open annual return PDF: ", err);
      toast.error("Failed to open the annual return PDF.");
    } finally {
      setViewingId(null);
    }
  };

  // ------------------------------------
  // TABLE COLUMNS
  // ------------------------------------
  const tableColumns: TableColumn<AlcAnnualReturnRow>[] = [
    {
      name: "SL NO.",
      width: "90px",
      center: true,
      selector: (row) => row.slno,
      sortable: true,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          NAME OF THE ESTABLISHMENT
        </div>
      ),
      width: "250px",
      selector: (row) => row.establishmentName,
      sortable: true,
      cell: (row) => <div>{row.establishmentName || "—"}</div>,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          NAME OF SERVICES
        </div>
      ),
      cell: (row) =>
        row.services.length ? (
          <ul className="list-decimal py-2 pl-4 text-[12px] leading-relaxed">
            {row.services.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400">—</span>
        ),
      wrap: true,
      grow: 2,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          APPLY YEAR
        </div>
      ),
      width: "130px",
      center: true,
      selector: (row) => row.applyYear,
      sortable: true,
      cell: (row) => <div>{row.applyYear || "—"}</div>,
    },
    {
      name: "ACTIONS",
      width: "150px",
      cell: (row) => {
        const key = `${row.wizardId}|${row.userId}`;
        return (
          <button
            type="button"
            onClick={() => handleViewDetails(row)}
            disabled={viewingId === key}
            className="text-blue-600 hover:text-blue-900 py-1 text-sm font-medium flex whitespace-nowrap disabled:opacity-50"
          >
            {viewingId === key ? "Opening…" : "View Details"}
          </button>
        );
      },
    },
  ];

  // ------------------------------------
  // FETCH DATA
  // ------------------------------------
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const response = await axios.get<AlcAnnualReturnRow[]>(
          `${API_BASE}annual-return-ll/alc/list`,
          { headers: { Authorization: `Bearer ${getAuthToken()}` } }
        );
        if (active) {
          setTableData(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Failed to get annual return list: ", err);
        if (active) setTableData([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full pl-[20px] pt-5 pb-5 pr-5 bg-[#ededed]">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">Annual Return List</h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <DataTable
          columns={tableColumns}
          data={tableData}
          progressPending={loading}
          pagination
          striped
          highlightOnHover
          dense
          noDataComponent={
            <div className="py-6 text-[13px] text-gray-500">No data found!</div>
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
      </div>
    </div>
  );
};

export default AnnualReturnList;