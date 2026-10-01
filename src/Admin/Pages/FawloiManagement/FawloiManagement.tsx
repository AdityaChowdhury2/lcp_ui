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
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import StatusBadge from "../StatusBadge";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  title: string;
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
const FAWLOIManagement: FC = () => {
//   const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // DEMO DATA (typed)
  const demoTableData: TableRow[] = [
    {
        title: "No-Labr-87-(LC-Estt)-22013-57-2019 Dated 27.01.2022",
    },
    {
        title: "Constitution of Screening Committee of FAWLOI as on 18-11-2021",
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
    name: "TITLE",
    selector: (row: TableRow) => row.title,
    sortable: true,
    cell: (row: TableRow) => <div>{row.title}</div>,
  },
  {
    name: "DOWNLOAD",
    width: "150px",
    cell: () => (
      <img
        src={`${IMAGE_BASE}pdf.png`}
        alt="logo"
        className="w-5 h-5 object-contain"
        onClick={() => alert(`PDF Icon Clicked`)}
      />
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
      setHeaderText("FAWLOI Notice");

      try {
        const response = await axios.get<TableRow[]>(
          `${API_BASE}fawloi-notice/list`
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
          <h3 className="mb-2 mt-2 text-gray-800">
            Screening Committee Decision
          </h3>
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

export default FAWLOIManagement;
