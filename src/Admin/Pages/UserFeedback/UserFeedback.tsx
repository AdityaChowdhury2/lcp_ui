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
import { API_BASE } from "@/constants/constants";
// import StatusBadge from "../StatusBadge";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  received_from: string;
  subject: string;
  received: string;
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
const UserFeedback: FC = () => {
  const [tabValue, setTabValue] = useState<string>("All");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // DEMO DATA (typed)
  const demoTableData: TableRow[] = [
    {
        received_from: "Mahendra Singh",
        subject: "Renewal Payment Not Process",
        received: "28/11/2025 08 28:30 PM",
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
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>RECEIVED FROM</div>,
    width: "250px",
    selector: (row: TableRow) => row.received_from,
    sortable: true,
    cell: (row: TableRow) => <div>{row.received_from}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>SUBJECT</div>,
    selector: (row: TableRow) => row.subject,
    sortable: true,
    cell: (row: TableRow) => <div>{row.subject}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>RECEIVED</div>,
    width: "250px",
    selector: (row: TableRow) => row.received,
    sortable: true,
    cell: (row: TableRow) => <div>{row.received}</div>,
  },
  {
    name: "ACTION",
    width: "150px",
    cell: () => (
      <button className="text-blue-500 hover:text-blue-800 py-1 text-sm font-medium flex whitespace-nowrap">
        <Eye size={16} /> View
      </button>
    ),
  },
];


  // ------------------------------------
  // TAB HEADERS
  // ------------------------------------
  const tabHeaders: Record<string, string> = {
    All: "USER FEEDBACK",
    "Todays Pending": "USER FEEDBACK",
    "All Pending": "USER FEEDBACK",
    Forwarded: "USER FEEDBACK",
    Solved: "USER FEEDBACK",
    Rejected: "USER FEEDBACK",
  };

  const tabvalue2url: Record<string, string> = {
    All: "",
    "Todays Pending": "/todayspending",
    "All Pending": "/pending",
    Forwarded: "/forward",
    Solved: "/solved",
    Rejected: "/rejected",
  };

  // ------------------------------------
  // FETCH DATA
  // ------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setHeaderText(tabHeaders[tabValue] || "");

      try {
        const response = await axios.get<TableRow[]>(
          `${API_BASE}mailbox/user-feedback/list${tabvalue2url[tabValue]}`
        );

        setTableData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to get data: ", err);
      }
    };

    fetchData();
  }, [tabValue]);

  // Handle tab change
  // const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
  //   setTabValue(newValue);
  // };

  return (
    <div className="w-full pl-[20px] pt-5 pb-5 pr-5 bg-[#ededed]">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">
        {headerText}
      </h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>

        {/* ----------------------------
            PURE HTML TAB HEADERS
        ----------------------------- */}
        <div className="flex gap-0 border-b border-gray-300 bg-white justify-start p-0">
          {Object.keys(tabHeaders).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabValue(tab)}
              className={`
                px-5 py-2 text-sm font-medium rounded-none border-b-2 transition-all
                ${
                  tabValue === tab
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

export default UserFeedback;
