import { FC, useState, useEffect, ReactElement } from "react";
import { getUserRole, getAuthToken } from "../../../utils/auth";
// import {
//   Tabs,
//   Tab,
//   Box,
// } from "@mui/material";

// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "../../../Components/ui/tabs";

import { Eye } from "lucide-react";


import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import StatusBadge from "../StatusBadge";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  application_id: string;
  applicantUserId: string;
  formv_refno: string;
  contractor_name: string;
  pe_regno_date: string;
  licenseno: string;
  license_date: string;
  bmcnasez: string;
  validupto?: string;
  application_date: string;
  status: string;
  highlight?: boolean;
}

interface ApplicationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApplicationListResponse {
  ok?: boolean;
  applications?: any[];
  meta?: ApplicationListMeta;
}

function renderLicenseStatusBadge(status: string): ReactElement | null {
  if (!status) return null;

  let imageFile: string | null = null;

  switch (status) {
    case "Approved":
    case "V":
      imageFile = "btn-approved.png";
      break;
    case "Applied":
      imageFile = "btn-applied.png";
      break;
    case "Fees Paid":
    case "T":
      imageFile = "btn-fees-paid.png";
      break;
    case "Fees Pending":
      imageFile = "btn-fees-pending.png";
      break;
    case "Pending":
      imageFile = "btn-applied.png";
      break;
    case "Final Submitted":
    case "Final Submit":
      imageFile = "btn-final-submit.png";
      break;
    case "Issued":
      imageFile = "btn-issued.png";
      break;
    case "Rectification":
      imageFile = "btn-rectification.png";
      break;
    case "Rejected":
      imageFile = "btn-reject.png";
      break;
    case "Forwarded":
      imageFile = "btn-to-alc.png";
      break;
    default:
      return (
        <span className="text-xs text-gray-700 whitespace-nowrap">{status}</span>
      );
  }

  return (
    <img
      src={`${IMAGE_BASE}${imageFile}`}
      alt={status}
      className="object-contain"
    />
  );
}

// ------------------------------------
// REUSABLE TAB PANEL (Typed)
// ------------------------------------
// interface TabPanelProps {
//   value: string;
//   children: React.ReactNode;
// }


// const TabPanel: FC<TabPanelProps> = ({ value, children }) => (
//   <TabsContent value={value}>
//     <div className="pt-2">{children}</div>
//   </TabsContent>
// );


// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const LicenseListCLRA: FC = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);

  const userRole = Number(getUserRole());

  const serialOffset = (page - 1) * limit;

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
      name:
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }} className="grid gap-1">
          <p>FORM-V / REF.NO.</p> <p>CONTRACTOR NAME</p>
        </div>,
      minWidth: "200px",
      selector: (row: TableRow) => row.formv_refno,
      sortable: true,
      cell: (row: TableRow) => <div className="grid gap-2"><p className="font-semibold">{row.formv_refno}</p> <p>{row.contractor_name}</p></div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>PE REGISTRATION NO.</div>,
      minWidth: "180px",
      selector: (row: TableRow) => row.pe_regno_date,
      sortable: true,
      cell: (row: TableRow) => <div>{row.pe_regno_date}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>B/M/C/NA/SEZ</div>,
      minWidth: "200px",
      selector: (row: TableRow) => row.bmcnasez,
      sortable: true,
      cell: (row: TableRow) => <div>{row.bmcnasez}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>LICENSE NUMBER & DATE</div>,
      minWidth: "200px",
      selector: (row: TableRow) => row.licenseno,
      sortable: true,
      cell: (row: TableRow) => <div className="grid gap-2"><p>{row.licenseno}</p> <p>{row.license_date}</p></div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>APPLICATION DATE</div>,
      selector: (row: TableRow) => row.application_date,
      sortable: true,
      cell: (row: TableRow) => <div>{row.application_date}</div>,
    },
    {
      name: "STATUS",
      width: "150px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) => renderLicenseStatusBadge(row.status),
    },
    {
      name: "ACTION",
      width: "140px",
      omit: userRole === 7,
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => { navigate(`/alc-view-license/${row.application_id}/${row.applicantUserId}`) }}>
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];


  // ------------------------------------
  // TAB HEADERS
  // ------------------------------------
  const tabHeaders: Record<string, string> = {
    All: "Application for Contractor License under The Contract Labour (R&A) Act, 1970",
    Pending: "Pending Application for Contractor License under The Contract Labour (R&A) Act, 1970",
    Forward: "Forwarded Application for Contractor License under The Contract Labour (R&A) Act, 1970",
    "Final Submit": "Final Submitted Application for Contractor License under The Contract Labour (R&A) Act, 1970",
    Issued: "Issued Application for Contractor License under The Contract Labour (R&A) Act, 1970",
    Rejected: "Rejected Application for Contractor License under The Contract Labour (R&A) Act, 1970",
  };

  const tabValueStatusCode: Record<string, number> = {
    All: 6,
    Pending: 0,
    Forward: 2,
    "Final Submit": 3,
    Issued: 4,
    Rejected: 5,
  };


  // ------------------------------------
  // FETCH DATA (server pagination)
  // ------------------------------------
  useEffect(() => {
    setHeaderText(tabHeaders[tabValue] || "");
  }, [tabValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApplicationListResponse>(
          `${API_BASE}contractor-license/alc/application-list`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            params: {
              status: tabValueStatusCode[tabValue],
              page,
              limit,
            },
          }
        );

        const applications = response.data.applications || [];
        const meta = response.data.meta;

        const mappedData: TableRow[] = applications.map((item: any) => ({
          application_id: item.id,
          applicantUserId: item.user_id,
          formv_refno: item.identification_number,
          contractor_name: item.contractor_name ?? "-",
          pe_regno_date:
            item.registration_number
              ? `${item.registration_number}${item.registration_date ? ` ${new Date(item.registration_date).toLocaleDateString()}` : ""}`
              : "-",
          bmcnasez: item.village_name,
          licenseno: item.unit_name,
          license_date: item.license_date ? new Date(item.license_date).toLocaleDateString() : "-",
          application_date: item.apply_date ? new Date(item.apply_date).toLocaleDateString() : "-",
          status: item.status_label
        }));

        setAllTableData(mappedData);
        setTotalRows(Number(meta?.total ?? 0));
      } catch (err) {
        console.error("Failed to get data: ", err);
        setAllTableData([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tabValue, page, limit]);


  // filtering data for search
  useEffect(() => {
    // Apply search on baseData
    if (searchText.trim() === "") {
      setTableData(allTableData);
    } else {
      const filteredData = allTableData.filter((item) =>
        item.formv_refno?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.contractor_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.pe_regno_date?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.bmcnasez?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.licenseno?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.application_date?.toLowerCase().includes(searchText.toLowerCase()) ||
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
    <div className="overflow-x-auto">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">
        {headerText}
      </h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-2 w-80"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

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
            <div key={tab} className="pt-2 mb-2 overflow-x-auto">
              <DataTable
                columns={tableColumns}
                data={tableData || []}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={limit}
                paginationDefaultPage={page}
                paginationRowsPerPageOptions={[10, 20, 50]}
                onChangePage={(currentPage) => setPage(currentPage)}
                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                  setLimit(currentRowsPerPage);
                  setPage(currentPage);
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

export default LicenseListCLRA;
