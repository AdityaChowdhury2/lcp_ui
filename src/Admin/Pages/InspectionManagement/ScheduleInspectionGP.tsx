import { FC, useState, useEffect, useMemo } from "react";
// import {
//   Tabs,
//   Tab,
//   Box,
// } from "@mui/material";


// import { Eye } from "lucide-react";

import DataTable, { TableColumn } from "react-data-table-component";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { API_BASE } from "@/constants/constants";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  area_name: string;
  inspector_name: string;
  from_date: string;
  to_date: string;
  gpward_name: string;
  gpwise_randomization: string;
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
const ScheduleInspectionGP: FC = () => {
//   const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // DEMO DATA (typed)
  const demoTableData: TableRow[] = [
    {
        area_name: "Barrackpore-II",
        inspector_name: "Anup Chakraborty",
        from_date: "30-11-2016",
        to_date: "30-12-2016",
        gpward_name: "Mohanpur",
        gpwise_randomization: "Submitted",
    },
    {
        area_name: "North Barrackpore Municipality",
        inspector_name: "Ashis Mitra",
        from_date: "Not Scheduled",
        to_date: "Not Scheduled",
        gpward_name: "",
        gpwise_randomization: "Randomize",
    }
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
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>AREA NAME</div>,
    width: "200px",
    selector: (row: TableRow) => row.area_name,
    sortable: true,
    cell: (row: TableRow) => <div>{row.area_name}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>INSPECTOR NAME</div>,
    width: "300px",
    selector: (row: TableRow) => row.inspector_name,
    sortable: true,
    cell: (row: TableRow) => <div>{row.inspector_name}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>FROM DATE</div>,
    selector: (row: TableRow) => row.from_date,
    sortable: true,
    cell: (row: TableRow) => <div>{row.from_date}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>TO DATE</div>,
    selector: (row: TableRow) => row.to_date,
    sortable: true,
    cell: (row: TableRow) => <div>{row.to_date}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>GP/WARD NAME</div>,
    width: "180px",
    selector: (row: TableRow) => row.gpward_name,
    sortable: true,
    cell: (row: TableRow) => <div>{row.gpward_name}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>GP WISE RANDOMIZATION</div>,
    width: "150px",
    selector: (row: TableRow) => row.gpwise_randomization,
    cell: (row: TableRow) => row.gpwise_randomization==="Submitted" ? 
    <button className="p-1 w-19 justify-center border border-black flex font-bold items-center bg-gray-300 text-green-700">
        {row.gpwise_randomization}
    </button> : 
    <button onClick={() => onclick} className="p-1 w-19 justify-center border border-black flex font-bold items-center bg-gray-300 text-red-600">
        {row.gpwise_randomization}
    </button>
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
      setHeaderText("Randomization Schedule (GP/Ward & Inspector)");

      try {
        const response = await axios.get<TableRow[]>(
          `${API_BASE}alcrandomization`
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
          <button onClick={() => onclick} className="p-1 mb-2 justify-center border border-black flex items-center bg-gray-200">
            Generate Order
          </button>
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

export default ScheduleInspectionGP;
