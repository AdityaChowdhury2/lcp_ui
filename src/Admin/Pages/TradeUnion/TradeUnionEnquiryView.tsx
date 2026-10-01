import { FC, useState, useEffect, useMemo } from "react";
import { FaEye } from "react-icons/fa";
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
const TradeUnionEnquiryView: FC = () => {
//   const [tabValue, setTabValue] = useState<string>("Pending");
//   const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // DEMO DATA (typed)
  const demoTableData: TableRow[] = [
    {
        area_name: "Barrackpore-II",
        inspector_name: "Anup Chakraborty",
        from_date: "30-11-2016",
        
    },
    {
        area_name: "North Barrackpore Municipality",
        inspector_name: "Ashis Mitra",
        from_date: "Not Scheduled",
       
    }
  ];

  // ------------------------------------
  // TABLE COLUMNS (typed)
  // ------------------------------------
  const tableColumns: TableColumn<TableRow>[] = [
  {
    name: "PARAMETERS",
    width: "40%",
    selector: (_row, index) => (index ?? 0) + 1,
  },
  {
   name: "INPUTS",
    selector: (row) => row.area_name,
    wrap: true,
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
    //   setHeaderText("Randomization Schedule (GP/Ward & Inspector)");

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
        Enquiry Details
      </h1>

      <div className=" border-t-[4px] border-t-[#3c8dbc]" style={{ backgroundColor: "#fff", padding: "10px" }}>
        <DataTable
         className="w-full no-ellipsis"
  columns={tableColumns}
  data={demoTableData}
  pagination
  striped
  highlightOnHover
  dense
 
  customStyles={{
    table: {
      style: {
        width: "100%",
      },
    },
    headCells: {
      style: {
        background: "#1E73BE",
        color: "white",
        fontWeight: "200",
        fontSize: "12px",
        borderRight: "1px solid #c9c9c9",
         whiteSpace: "normal",        
        wordBreak: "break-word",     
        overflow: "visible !important",    
        lineHeight: "1.2",
        paddingTop: "8px",
        paddingBottom: "8px",
      },
    },
    rows: {
      style: {
        fontSize: "12px",
        borderBottom: "1px solid #e5e7eb",
        width: "100%",
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

        {/* </TabPanel> */}
      </div>
    </div>
  );
};

export default TradeUnionEnquiryView;
