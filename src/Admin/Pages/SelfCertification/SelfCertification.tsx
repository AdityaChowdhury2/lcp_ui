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
import { useNavigate } from "react-router-dom";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { getAuthToken } from "../../../utils/auth";
// import StatusBadge from "../StatusBadge";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  identification_no: string;
  establishment_name: string;
  apply_date: string;
  status: string;
  encId: string;
  userId: number;
  highlight?: boolean;
}

// ------------------------------------
// REUSABLE TAB PANEL (Typed)
// ------------------------------------
// interface TabPanelProps {
//   value: string;
//   children: React.ReactNode;
// }

// const TabPanel: FC<TabPanelProps> = ({ children }) => {
//   return <Box sx={{ pt: 2 }}>{children}</Box>;
// };

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const SelfCertification: FC = () => {
  //   const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const navigate = useNavigate();

  // ------------------------------------
  // TABLE COLUMNS (typed)
  // ------------------------------------
  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: "SL NO.",
      width: "100px",
      selector: (_row: TableRow, index?: number) => (index ?? 0) + 1,
      cell: (_row: TableRow, index?: number) => (
        <div className="w-full">{(index ?? 0) + 1}</div>
      ),
      sortable: true,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>IDENTIFICATION NUMBER</div>,
      width: "200px",
      selector: (row: TableRow) => row.identification_no,
      sortable: true,
      cell: (row: TableRow) => <div>{row.identification_no}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>ESTABLISHMENT NAME</div>,
      // width: "400px",
      selector: (row: TableRow) => row.establishment_name,
      sortable: true,
      cell: (row: TableRow) => <div>{row.establishment_name}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>APPLY DATE</div>,
      width: "150px",
      selector: (row: TableRow) => row.apply_date,
      sortable: true,
      cell: (row: TableRow) => <div>{row.apply_date}</div>,
    },
    {
      name: "STATUS",
      width: "150px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) => {
        const s = (row.status ?? "").trim().toUpperCase();
        if (s === "V" || s === "PAYMENT NOT MADE" || s === "A") {
          return (
            <img
              src={`${IMAGE_BASE}btn-fees-pending.png`}
              alt="Fees Pending"
              className="object-contain"
            />
          );
        }
        if (s === "0" || s === "APPLIED") {
          return (
            <img
              src={`${IMAGE_BASE}btn-applied.png`}
              alt="Applied"
              className="object-contain"
            />
          );
        }
        if (s === "APPROVED") {
          return (
            <img
              src={`${IMAGE_BASE}btn-approved.png`}
              alt="Approved"
              className="object-contain"
            />
          );
        }
        if (s === "N" || s === "INCOMPLETE") {
          return (
            <img
              src={`${IMAGE_BASE}btn-not-to-be-forwarded-to-alc.png`}
              alt="Not To Be Forwarded To ALC"
              className="object-contain"
            />
          );
        }
        if (s === "T" || s === "PAYMENT MADE" || s === "P") {
          return (
            <img
              src={`${IMAGE_BASE}btn-fees-paid.png`}
              alt="Fees Paid"
              className="object-contain"
            />
          );
        }
        if (s === "FINAL SUBMIT" || s === "S" || s === "FINAL SUBMITTED") {
          return (
            <img
              src={`${IMAGE_BASE}btn-final-submit.png`}
              alt="Final Submitted"
              className="object-contain"
            />
          );
        }
        if (s === "ISSUED" || s === "I" || s === "CERTIFICATE ISSUED") {
          return (
            <img
              src={`${IMAGE_BASE}btn-issued.png`}
              alt="Issued"
              className="object-contain"
            />
          );
        }
        return <span className="font-semibold text-gray-500">{row.status}</span>;
      },
    },
    {
      name: "ACTION",
      width: "160px",
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => { navigate(`/self-certification-application-view/${row.encId}/${row.userId}`) }}
        >
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];


  // ------------------------------------
  // TAB HEADERS
  // ------------------------------------
  //   const tabHeaders: Record<string, string> = {
  //     All: "Applications List for Grant of License for Employment Under ISMW",
  //     Pending: "Pending Applications List for Grant of License for Employment Under ISMW",
  //     "Sent Back for Rectification": "Rectification Applications List for Grant of License for Employment Under ISMW",
  //     Forward: "Forwarded Applications List for Grant of License for Employment Under ISMW",
  //     "Final Submit": "Final Submitted Applications List for Grant of License for Employment Under ISMW",
  //     Issued: "Issued Applications List for Grant of License for Employment Under ISMW",
  //     Rejected: "Rejected Applications List for Grant of License for Employment Under ISMW",
  //   };

  //   const tabvalue2url: Record<string, string> = {
  //     All: "",
  //     Pending: "/pending",
  //     "Sent Back for Rectification": "/rectification",
  //     Forward: "/forward",
  //     "Final Submit": "/finalsubmit",
  //     Issued: "/issued",
  //     Rejected: "/rejected",
  //   };

  // ------------------------------------
  // FETCH DATA
  // ------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setHeaderText("Received Self Certification Application");

      try {
        const response = await axios.get<TableRow[]>(
          `${API_BASE}self-cert/received-self-certification-application`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        setTableData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to get data: ", err);
      }
    };

    fetchData();
  }, []);

  // Handle tab change
  //   const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
  //     setTabValue(newValue);
  //   };

  return (
    <div className="w-full">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">
        {headerText}
      </h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        {/* TABS */}
        {/* <div className="border-b border-gray-300 mb-4">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              style: { backgroundColor: "#1E73BE", height: "3px" },
            }}
          >
            {Object.keys(tabHeaders).map((tab) => (
              <Tab
                key={tab}
                label={
                  <span
                    className={`text-sm font-medium ${
                      tabValue === tab ? "text-[#1E73BE]" : "text-gray-600"
                    }`}
                  >
                    {tab}
                  </span>
                }
                value={tab}
                sx={{
                  textTransform: "none",
                  fontWeight: tabValue === tab ? 600 : 500,
                  minWidth: "max-content",
                }}
              />
            ))}
          </Tabs>
        </div> */}

        {/* TABLE */}
        {/* <TabPanel value={tabValue}> */}
        <DataTable
          columns={tableColumns}
          data={tableData || []}
          pagination
          striped
          highlightOnHover
          dense
          customStyles={{
            headCells: {
              style: {
                background: "#1E73BE",
                color: "white",
                fontWeight: "200",
                fontSize: "12px",
                borderRight: "1px solid #c9c9c9",
                whiteSpace: "normal",      // allow wrapping
                wordBreak: "break-word",   // break long words
                overflow: "visible",       // no clipping
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
                // maxWidth: "max-content",
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
        {/* </TabPanel> */}
      </div>
    </div>
  );
};

export default SelfCertification;
