import { FC, useState, useEffect, useRef } from "react";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUserRole } from "../../../utils/auth";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  application_id: string;
  applicantUserId: string;
  id_no: string;
  reg_no: string;
  reg_date: string;
  bmcnasez: string;
  establishment: string;
  applydate: string;
  status: string;
  highlight?: boolean;
}


// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const ApplicationListBOCWA: FC = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);

  // Only the newest request may write to state — a slow tab's response used to land
  // after a faster one and paint the wrong (or a partial) list.
  const requestIdRef = useRef<number>(0);

  const userRole = Number(getUserRole());
  const TYPE = "bocwa";
  const serialOffset = (page - 1) * limit;

  // Badge per status. Keys cover both the formatted labels and the raw workflow codes
  // (V / VA / T / U / BI) the API passes straight through.
  const statusBadges: Record<string, string> = {
    Approved: "btn-approved.png",
    VA: "btn-approved.png",
    Applied: "btn-applied.png",
    Pending: "btn-applied.png",
    "Fees Paid": "btn-fees-paid.png",
    T: "btn-fees-paid.png",
    "Fees Pending": "btn-fees-pending.png",
    V: "btn-fees-pending.png",
    "Final Submitted": "btn-final-submit.png",
    BI: "btn-inspector.png",
    Issued: "btn-issued.png",
    Rectification: "btn-rectification.png",
    Rejected: "btn-reject.png",
    U: "btn-rectify-signed-form.png",
    Forwarded: "btn-to-alc.png",
  };
  const tableLoader = (
    <div className="flex flex-col items-center justify-center gap-2 p-12 text-gray-500">
      <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E73BE] border-t-transparent" />
      <p className="text-xs font-semibold mt-1">Loading applications...</p>
    </div>
  );

  // ------------------------------------
  // TABLE COLUMNS (typed)
  // ------------------------------------
  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: "SL NO.",
      width: "100px",
      selector: (_row: TableRow, index?: number) => serialOffset + (index ?? 0) + 1,
      cell: (_row: TableRow, index?: number) => (
        <div className="w-full">{serialOffset + (index ?? 0) + 1}</div>
      ),
      sortable: true,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>ID NUMBER</div>,
      minWidth: "220px",
      selector: (row: TableRow) => row.id_no,
      sortable: true,
      cell: (row: TableRow) => <div>{row.id_no}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>REG NO. & DATE</div>,
      minWidth: "180px",
      selector: (row: TableRow) => row.reg_no,
      sortable: true,
      cell: (row: TableRow) =>
        <div className="grid gap-1">
          <p className="font-semibold">{row.reg_no}</p>
          <p>{row.reg_date}</p>
        </div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>B/M/C/NA/SEZ</div>,
      minWidth: "180px",
      selector: (row: TableRow) => row.bmcnasez,
      sortable: true,
      cell: (row: TableRow) => <div>{row.bmcnasez}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>ESTABLISHMENT NAME</div>,
      minWidth: "250px",
      selector: (row: TableRow) => row.establishment,
      sortable: true,
      cell: (row: TableRow) => <div>{row.establishment}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>APPLY DATE</div>,
      width: "130px",
      selector: (row: TableRow) => row.applydate,
      sortable: true,
      cell: (row: TableRow) => <div>{row.applydate}</div>,
    },
    {
      name: "STATUS",
      width: "150px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) =>
        statusBadges[row.status] ? (
          <img
            src={`${IMAGE_BASE}${statusBadges[row.status]}`}
            alt={row.status}
            className="object-contain"
          />
        ) : (
          // Never leave the cell blank for a status we have no badge for.
          <span className="text-xs text-gray-600">{row.status || "-"}</span>
        ),
    },
    {
      name: "ACTION",
      width: "140px",
      omit: userRole === 7,
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => row?.id_no.toLowerCase().includes("AMEND".toLowerCase()) ?
            navigate(`/alc_receivedapplications_bocwa_amendment/${row.application_id}/${row.applicantUserId}`)
            : navigate(`/alc_receivedapplications_bocwa/${row.application_id}/${row.applicantUserId}`)}>
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];


  // ------------------------------------
  // TAB HEADERS
  // ------------------------------------
  const tabHeaders: Record<string, string> = {
    All: "Application for Registration of Establishment under BOCWA",
    Pending: "Pending Application for Registration of Establishment under BOCWA",
    "Sent Back for Rectification": "Rectification Application for Registration of Establishment under BOCWA",
    Forward: "Forwarded Application for Registration of Establishment under BOCWA",
    "Final Submit": "Final Submitted Application for Registration of Establishment under BOCWA",
    Issued: "Issued Application for Registration of Establishment under BOCWA",
    Rejected: "Rejected Application for Registration of Establishment under BOCWA",
  };

  const tabValueStatusCode: Record<string, number> = {
    All: 6,
    Pending: 0,
    "Sent Back for Rectification": 1,
    Forward: 2,
    "Final Submit": 3,
    Issued: 4,
    Rejected: 5,
  };

  // ------------------------------------
  // FETCH DATA
  // ------------------------------------
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const isStale = () => requestId !== requestIdRef.current;

    const fetchData = async () => {
      try {
        setHeaderText(tabHeaders[tabValue] || "");
        setLoading(true);
        setErrorText("");
        // Drop the previous tab's rows so a slow response can never be read as this tab's data.
        setAllTableData([]);

        const encryptedType = await encryptionDecryptionFun('encrypt', JSON.stringify({ act_id: 2, status: tabValueStatusCode[tabValue] })) ?? "";

        // Use encrypted value in URL
        const response = await axios.get<any>(
          `${API_BASE}receivedapplications`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            params: {
              encrypted: encryptedType,
              type: "",
              page,
              limit,
            },
            signal: controller.signal,
          }
        );

        if (isStale()) return;

        // The API answers { ok:false, message } for jurisdiction / token problems —
        // treating that as an empty list showed a blank table with no explanation.
        if (response.data?.ok === false) {
          setAllTableData([]);
          setTotalRows(0);
          setErrorText(response.data.message || "Unable to load applications.");
          return;
        }

        const applications = response.data.applications || [];
        const meta = response.data.meta;

        const mappedData: TableRow[] = applications.map((item: any) => ({
          application_id: item.id,
          applicantUserId: item.user_id,
          id_no: item.identification_number,
          reg_no: item.registration_number ? `${item.registration_number}` : `NEW APPLICATION`,
          reg_date: item.registration_date ? `${new Date(item.registration_date).toLocaleDateString()}` : ``,
          bmcnasez: item.block_name,
          establishment: item.unit_name,
          applydate: item.apply_date ? new Date(item.apply_date).toLocaleDateString() : ``,
          status: item.status_label
        }));

        setAllTableData(mappedData);
        setTotalRows(Number(meta?.total ?? 0));
      } catch (err) {
        if (axios.isCancel(err) || isStale()) return;
        console.error("Failed to get data: ", err);
        setAllTableData([]);
        setTotalRows(0);
        setErrorText("Failed to load applications. Please try again.");
      } finally {
        if (!isStale()) setLoading(false);
      }
    };
    fetchData();

    return () => controller.abort();
  }, [tabValue, page, limit]);


  // filtering data for different tab changes
  useEffect(() => {
    // Apply search on baseData
    if (searchText.trim() === "") {
      setTableData(allTableData);
    } else {
      const filteredData = allTableData.filter((item) =>
        item.id_no?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.reg_no?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.bmcnasez?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.establishment?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.applydate?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase())
      );

      setTableData(filteredData);
    }
  }, [searchText, tabValue, allTableData]);


  // Handle tab change
  // const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
  //   setTabValue(newValue);
  // };

  return (
    <div className="w-full overflow-x-auto">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">
        {headerText}
      </h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 w-1/5"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {loading ? (
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#1E73BE] border-t-transparent" />
              Loading...
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              {totalRows} application{totalRows === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {errorText && (
          <div className="mb-2 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorText}
          </div>
        )}

        {/* ----------------------------
            PURE HTML TAB HEADERS
        ----------------------------- */}
        <div className="flex gap-0 border-b border-gray-300 bg-white justify-start p-0">
          {Object.keys(tabHeaders).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTabValue(tab);
                setPage(1);
              }}
              className={`
                px-5 py-2 text-sm font-medium rounded-none border-b-2 transition-all
                ${tabValue === tab
                  ? "border-[#1E73BE] text-gray-800 bg-white"
                  : "border-transparent text-[#F2A33C] hover:text-blue-500"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ----------------------------
            PURE HTML TAB PANELS
        ----------------------------- */}
        {Object.keys(tabHeaders).map((tab) =>
          tabValue === tab ? (
            <div key={tab} className="pt-2">
              <DataTable
                columns={tableColumns}
                data={tableData || []}
                progressPending={loading}
                progressComponent={tableLoader}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={limit}
                paginationDefaultPage={page}
                paginationRowsPerPageOptions={[10, 20, 50]}
                onChangePage={(currentPage) => {
                  if (currentPage !== page) setPage(currentPage);
                }}
                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                  if (currentRowsPerPage !== limit) setLimit(currentRowsPerPage);
                  if (currentPage !== page) setPage(currentPage);
                }}
                striped
                highlightOnHover
                dense
                noDataComponent="No applications found"
                customStyles={{
                  headCells: {
                    style: {
                      background: "#3C8DBC",
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
                conditionalRowStyles={[
                  {
                    when: (row) => row.highlight === true,
                    style: {
                      backgroundColor: "#e3994bff",
                    },
                  },
                ]}
              />
            </div>
          ) : null
        )}

      </div>
    </div>
  );
};

export default ApplicationListBOCWA;
