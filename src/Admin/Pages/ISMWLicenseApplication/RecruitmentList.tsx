import { FC, useState, useEffect, useMemo } from "react";
// import {
//   Tabs,
//   Tab,
//   Box,
// } from "@mui/material";

import { Eye } from "lucide-react";

import DataTable, { TableColumn } from "react-data-table-component";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import StatusBadge from "../StatusBadge";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  form_vi: string;
  contractor_details: string;
  establishment_details: string;
  license_details: string;
  apply_date: string;
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

// const TabPanel: FC<TabPanelProps> = ({ children }) => {
//   return <Box sx={{ pt: 2 }}>{children}</Box>;
// };

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const RecruitmentList: FC = () => {
//   const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // DEMO DATA (typed)
  const demoTableData: TableRow[] = [
    {
        form_vi: "[ FORM-V : 00870704 ] GANAPATI BAGS",
        contractor_details: "BKP19/CLR/000733",
        establishment_details: "Barrackpore-II",
        license_details: "",
        apply_date: "24th Nov, 2025",
        status: "Final Submit",
    },
    {
        form_vi: "",
        contractor_details: "BKP19/CLR/000733",
        establishment_details: "",
        license_details: "",
        apply_date: "24th Nov, 2025",
        status: "Final Submit",
    },
  ];

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
    name: "FORM-VI",
    width: "160px",
    selector: (row: TableRow) => row.form_vi,
    sortable: true,
    cell: (row: TableRow) => <div>{row.form_vi}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>CONTRACTOR DETAILS</div>,
    width: "150px",
    selector: (row: TableRow) => row.contractor_details,
    sortable: true,
    cell: (row: TableRow) => <div>{row.contractor_details}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>ESTABLISHMENT DETAILS</div>,
    width: "200px",
    selector: (row: TableRow) => row.establishment_details,
    sortable: true,
    cell: (row: TableRow) => <div>{row.establishment_details}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>LICENSE DETAILS</div>,
    selector: (row: TableRow) => row.license_details,
    sortable: true,
    cell: (row: TableRow) => <div>{row.license_details}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>APPLY DATE</div>,
    width: "130px",
    selector: (row: TableRow) => row.apply_date,
    sortable: true,
    cell: (row: TableRow) => <div>{row.apply_date}</div>,
  },
  {
    name: "STATUS",
    width: "150px",
    selector: (row: TableRow) => row.status,
    cell: (row: TableRow) => (
      row.status === "Approved" ?
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
      row.status === "Fees Paid" ?
      <img
        src={`${IMAGE_BASE}btn-fees-paid.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Fees Pending" ?
      <img
        src={`${IMAGE_BASE}btn-fees-pending.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Final Submit" ?
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
      row.status === "For Rectification" ?
      <img
        src={`${IMAGE_BASE}btn-rectification.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Reject" ?
      <img
        src={`${IMAGE_BASE}btn-reject.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Forward" &&
      <img
        src={`${IMAGE_BASE}btn-to-alc.png`}
        alt="logo"
        className="object-contain"
      /> 
    ),
  },
  {
    name: "ACTION",
    width: "150px",
    cell: () => (
      <button className="bg-[#1E73BE] hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 whitespace-nowrap">
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
      setHeaderText("Applications List for Grant of License for Recruitment Under ISMW");

      try {
        const response = await axios.get<TableRow[]>(
          `${API_BASE}ismwlicense-list/recruitment`
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
    <div className="w-full pl-[20px] pt-5 pb-5 pr-5 bg-[#ededed]">
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
            data={demoTableData || []}
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

export default RecruitmentList;
