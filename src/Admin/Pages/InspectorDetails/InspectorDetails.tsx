import { FC, useEffect, useState } from "react";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";

// ------------------
// TYPE DEFINITIONS
// ------------------

interface SubDivision {
  sub_div_code: number;
  subdivision_name: string;
}

interface Block {
  block_mun_name: string;
}

interface TableRow {
  inspector_name: string;
  mobile_no: string;
  department: string;
  subdivision_name: string;
  area_name: string;
}

const InspectorDetails: FC = () => {
  const [headerText] = useState("Inspector Details");
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  // ------------------------------------
  // TABLE COLUMNS
  // ------------------------------------
  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: "SL NO.",
      width: "80px",
      cell: (_row, index) => <div>{(index ?? 0) + 1}</div>,
    },
    {
      name: "INSPECTOR NAME",
      width: "200px",
      selector: (row) => row.inspector_name,
      sortable: true,
    },
    {
      name: "MOBILE NO",
      width: "150px",
      selector: (row) => row.mobile_no,
      sortable: true,
    },
    {
      name: "DEPARTMENT",
      selector: (row) => row.department,
      sortable: true,
    },
    {
      name: "SUBDIVISION NAME",
      width: "170px",
      selector: (row) => row.subdivision_name,
      sortable: true,
    },
    {
      name: "AREA NAME",
      selector: (row) => row.area_name,
      sortable: true,
    },
  ];

  // ------------------------------------
  // FETCH + MERGE DATA
  // ------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inspectorRes = await axios.get(
          `${API_BASE}rlo_insp_details`
        );
        const rows: TableRow[] = inspectorRes.data?.result;

        setAllTableData(rows);
        setTableData(rows);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchData();
  }, []);

  // ------------------------------------
  // SEARCH FILTER
  // ------------------------------------
  useEffect(() => {
    if (!searchText.trim()) {
      setTableData(allTableData);
      return;
    }

    const filtered = allTableData.filter((row) =>
      row.inspector_name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.mobile_no.toLowerCase().includes(searchText.toLowerCase()) ||
      row.department.toLowerCase().includes(searchText.toLowerCase()) ||
      row.subdivision_name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.area_name.toLowerCase().includes(searchText.toLowerCase())
    );

    setTableData(filtered);
  }, [searchText, allTableData]);

  // ------------------------------------
  // RENDER
  // ------------------------------------
  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl mb-4 text-gray-800">{headerText}</h1>

      <div className="bg-white p-4 rounded-md border-t-4 border-blue-600">
        
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-3 w-80"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <DataTable
          columns={tableColumns}
          data={tableData}
          pagination
          striped
          highlightOnHover
          dense
          customStyles={{
            headCells: {
              style: {
                background: "#1E73BE",
                color: "#fff",
                fontSize: "12px",
              },
            },
            rows: {
              style: {
                fontSize: "12px",
              },
            },
          }}
        />

        <button className="text-orange-400 hover:text-orange-600" onClick={() => {navigate("/dashboard")}}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default InspectorDetails;
