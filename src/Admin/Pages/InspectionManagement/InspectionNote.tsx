import { FC, useState } from "react";
import { Eye } from "lucide-react";

import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { Button } from "../../../Components/ui/button";
import { CiSquarePlus } from "react-icons/ci";
import { IoListOutline } from "react-icons/io5";

interface TableRow {
  id_no: number;
  regnodate: string;
  bmcnasez: string;
  establishment: string;
  applydate: string;
  status: string;
  highlight?: boolean;
}

const InspectionNote: FC = () => {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);

  const demoTableData: TableRow[] = [
    {
      id_no: 100,
      regnodate: "100 20 Dec 2025",
      bmcnasez: "ABCD",
      establishment: "ABCD Limited",
      applydate: "20 Dec 2025",
      status: "Approved",
    },
    {
      id_no: 101,
      regnodate: "101 20 Dec 2025",
      bmcnasez: "ABCW",
      establishment: "ABCW Limited",
      applydate: "20 Dec 2025",
      status: "Final Submit",
    },
  ];

  // Initialize filtered data (only once)
  useState(() => {
    setFilteredData(demoTableData);
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    const lower = value.toLowerCase();

    const filtered = demoTableData.filter((row) =>
      row.id_no.toString().includes(lower) ||
      row.regnodate.toLowerCase().includes(lower) ||
      row.bmcnasez.toLowerCase().includes(lower) ||
      row.establishment.toLowerCase().includes(lower) ||
      row.applydate.toLowerCase().includes(lower) ||
      row.status.toLowerCase().includes(lower)
    );

    setFilteredData(filtered);
  };

  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          SL NO.
        </div>
      ),
      selector: (row: TableRow) => row.id_no,
      sortable: true,
      cell: (row: TableRow) => <div>{row.id_no}</div>,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          File No./Date
        </div>
      ),
      selector: (row: TableRow) => row.regnodate,
      sortable: true,
      cell: (row: TableRow) => <div>{row.regnodate}</div>,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          Name of the Establishment/ Industry/ Shop
        </div>
      ),
      selector: (row: TableRow) => row.bmcnasez,
      sortable: true,
      cell: (row: TableRow) => <div>{row.bmcnasez}</div>,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>
          Inspection Note
        </div>
      ),
      selector: (row: TableRow) => row.establishment,
      sortable: true,
      cell: (row: TableRow) => <div>{row.establishment}</div>,
    },
  ];

  return (
    <div className="w-full pl-[20px] pt-5 pb-5 pr-5 bg-[#ededed]">

      <h1 className="text-2xl mb-4 text-gray-800">
        Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970
      </h1>

      {/* Search */}
      <div className="flex justify-start mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-1.5 rounded w-64 text-sm"
        />
      </div>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <DataTable
          columns={tableColumns}
          data={filteredData}
          pagination
          striped
          highlightOnHover
          responsive
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
    </div>
  );
};

export default InspectionNote;
