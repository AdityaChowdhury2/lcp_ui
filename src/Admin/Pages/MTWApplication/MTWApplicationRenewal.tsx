import { FC, useState, useEffect, useMemo } from "react";
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
// import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { getAuthToken } from "../../../utils/auth";
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
const MTWApplicationRenewal: FC = () => {
  const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const navigate = useNavigate();

  const TYPE = "mtw";
  const serialOffset = (page - 1) * limit;

  // DEMO DATA (typed)
  // const demoTableData: TableRow[] = [
  //   {
  //     id_no: "100",
  //     reg_no: "100 20 Dec 2025",
  //     bmcnasez: "ABCD",
  //     establishment: "ABCD Limited",
  //     applydate: "20 Dec 2025",
  //     status: "Approved",
  //   },
  //   {
  //     id_no: "101",
  //     reg_no: "101 20 Dec 2025",
  //     bmcnasez: "ABCW",
  //     establishment: "ABCW Limited",
  //     applydate: "20 Dec 2025",
  //     status: "Final Submit",
  //   },
  // ];

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
      minWidth: "180px",
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
      minWidth: "150px",
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
      width: "150px",
      selector: (row: TableRow) => row.applydate,
      sortable: true,
      cell: (row: TableRow) => <div>{row.applydate}</div>,
    },
    {
      name: "STATUS",
      width: "150px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) => (
        row.status === "Approved" || row.status === "VA" ?
          <img
            src={`${IMAGE_BASE}btn-approved.png`}
            alt="logo"
            className="object-contain"
          /> :
          row.status === "Applied" ?
            <img
              src={`${IMAGE_BASE}btn-applied.png`}
              alt="logo"
              className="object-contain"
            /> :
            row.status === "Fees Paid" || row.status === "T" ?
              <img
                src={`${IMAGE_BASE}btn-fees-paid.png`}
                alt="logo"
                className="object-contain"
              /> :
              row.status === "Fees Pending" || row.status === "V" ?
                <img
                  src={`${IMAGE_BASE}btn-fees-pending.png`}
                  alt="logo"
                  className="object-contain"
                /> :
                (row.status === "Pending") ?
                  <img
                    src={`${IMAGE_BASE}btn-pending.png`}
                    alt="logo"
                    className="object-contain"
                  /> :
                  (row.status === "Renewal" || row.status === "RN") ?
                    <img
                      src={`${IMAGE_BASE}btn-applied.png`}
                      alt="logo"
                      className="object-contain"
                    /> :
                    row.status === "Final Submitted" ?
                      <img
                        src={`${IMAGE_BASE}btn-final-submit.png`}
                        alt="logo"
                        className="object-contain"
                      /> :
                      row.status === "Issued" ?
                        <img
                          src={`${IMAGE_BASE}btn-issued.png`}
                          alt="logo"
                          className="object-contain"
                        /> :
                        row.status === "Rectification" ?
                          <img
                            src={`${IMAGE_BASE}btn-rectification.png`}
                            alt="logo"
                            className="object-contain"
                          /> :
                          row.status === "Rejected" ?
                            <img
                              src={`${IMAGE_BASE}btn-reject.png`}
                              alt="logo"
                              className="object-contain"
                            /> :
                            row.status === "U" ?
                              <img
                                src={`${IMAGE_BASE}btn-rectify-signed-form.png`}
                                alt="logo"
                                className="object-contain"
                              /> :
                              row.status === "Forwarded" &&
                              <img
                                src={`${IMAGE_BASE}btn-to-alc.png`}
                                alt="logo"
                                className="object-contain"
                              />
      ),
    },
    {
      name: "ACTION",
      width: "140px",
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => { navigate(`/alc-mtw-renewal-details/${row.application_id}/${row.applicantUserId}`) }}
        >
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];


  // ------------------------------------
  // TAB HEADERS
  // ------------------------------------
  const tabHeaders: Record<string, string> = {
    All: "Renewal Application for Registration of Motor Transport Undertaking",
    Pending: "List of Pending Application for Renewal of Registration Certificate under Motor Transport Undertaking",
    Forward: "List of Forwared Application for Renewal of Registration Certificate under Motor Transport Undertaking",
    "Final Submit": "List of Final Submitted Application for Renewal of Registration Certificate under Motor Transport Undertaking",
    Issued: "List of Issued Application for Renewal of Registration Certificate under Motor Transport Undertaking",
    Rejected: "List of Rejected Application for Renewal of Registration Certificate under Motor Transport Undertaking",
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
    const fetchData = async () => {
      try {
        setHeaderText(tabHeaders[tabValue] || "");
        setLoading(true);
        const encryptedType = await encryptionDecryptionFun('encrypt', JSON.stringify({ act_id: 3, status: tabValueStatusCode[tabValue] })) ?? "";

        const response = await axios.get<any>(
          `${API_BASE}receivedapplications`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            params: {
              encrypted: encryptedType,
              type: "renewal",
              page,
              limit,
            }
          }
        );

        const applications = response.data.applications || [];
        const meta = response.data.meta;

        const mappedData: TableRow[] = applications.map((item: any) => ({
          application_id: item.id,
          applicantUserId: item.user_id,
          id_no: item.identification_number,
          reg_no: item.registration_number
            ? `${item.registration_number}`
            : `NEW APPLICATION`,
          reg_date: item.registration_date
            ? new Date(item.registration_date).toLocaleDateString()
            : "",
          bmcnasez: item.block_name,
          establishment: item.unit_name,
          applydate: item.apply_date ? new Date(item.apply_date).toLocaleDateString() : "",
          status: item.status_label,
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
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-2 w-1/5"
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
            <div key={tab} className="pt-2">
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

export default MTWApplicationRenewal;
