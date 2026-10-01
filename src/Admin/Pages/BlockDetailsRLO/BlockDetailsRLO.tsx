import { FC, useEffect, useState } from "react";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface District {
  district_code: number;
  district_name: string;
}

interface SubDivision {
  sub_div_code: number;
  sub_div_name: string;
}

interface Block {
  block_mun_name: string;
}

interface TableRow {
  district_name: string;
  sub_div_name: string;
  area_name: string;
}

const BlockDetailsRLO: FC = () => {
  const [headerText] = useState("Block Details of RLO");
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [distCode, setDistCode] = useState<number | null>();
  const [subDivCode, setSubDivCode] = useState<string | null>();

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
      name: "DISTRICT NAME",
      selector: (row) => row.district_name,
      sortable: true,
    },
    {
      name: "SUBDIVISION NAME",
      selector: (row) => row.sub_div_name,
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
      if (!distCode || !subDivCode) return;

      setIsTableLoading(true);
      try {
        // 1️⃣ District
        const districtRes = await axios.get<District>(
          `${API_BASE}district/${distCode}`
        );

        // 2️⃣ Subdivision
        const subDivRes = await axios.get<SubDivision>(
          `${API_BASE}subdivision/${distCode}/${subDivCode}`
        );

        const districtName = districtRes.data.district_name;
        const subDivName = subDivRes.data.sub_div_name;

        const areaTypes = ["b", "m", "c"];
        const rows: TableRow[] = [];

        // 3️⃣ Blocks / Municipality / Corporation
        for (const type of areaTypes) {
          const blockRes = await axios.get<Block[]>(
            `${API_BASE}block/${distCode}/${subDivCode}/${type}`
          );

          blockRes.data.forEach((block) => {
            rows.push({
              district_name: districtName,
              sub_div_name: subDivName,
              area_name: block.block_mun_name,
            });
          });
        }

        setAllTableData(rows);
        setTableData(rows);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setIsTableLoading(false);
      }
    };

    fetchData();
  }, [distCode, subDivCode]);


  // Get User District and Subdivision code
  // Get district and subdivision code of User
  useEffect(() => {
    const fetchUserDistrictSubdiv = async () => {
      const response = await axios.get<any>(
        `${API_BASE}user-district-subdiv`
      );

      const data = await response.data?.result;
      setDistCode(data.district_code);
      setSubDivCode(data.sub_div_code);
    }

    fetchUserDistrictSubdiv();
  }, [])

  // ------------------------------------
  // SEARCH FILTER
  // ------------------------------------
  useEffect(() => {
    if (!searchText.trim()) {
      setTableData(allTableData);
      return;
    }

    const filtered = allTableData.filter((row) =>
      row.district_name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.sub_div_name.toLowerCase().includes(searchText.toLowerCase()) ||
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
        {!isTableLoading && tableData.length > 0 &&
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-3 w-80"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />}

        <DataTable
          columns={tableColumns}
          data={tableData}
          progressPending={isTableLoading}
          progressComponent={
            <div className="py-6 text-sm font-medium text-gray-600">
              Loading...
            </div>
          }
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

export default BlockDetailsRLO;
