import { FC, useState, useMemo } from "react";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";

interface TableRow {
  name: string;
  designation: string;
  emp_id: string;
  mobile: string;
  current_posted_office: string;
  date_of_birth: string;
}

const AllOfficeEmployeeList: FC = () => {
  const demoTableData: TableRow[] = [
    {
      name: "XYZ Nandy",
      designation: "Inspector",
      emp_id: "6473821234",
      mobile: "9831231234",
      current_posted_office: "Dinhata, Coochbehar",
      date_of_birth: "08/10/1996",
    },
    {
      name: "ABC Chowdhury",
      designation: "ALC",
      emp_id: "5612345671",
      mobile: "8981223762",
      current_posted_office: "Arambagh, Hoogly",
      date_of_birth: "02/07/1986",
    },
  ];

  // 🔍 search state
  const [searchText, setSearchText] = useState<string>("");

  // 🔍 Filtered Data
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return demoTableData;

    const lower = searchText.toLowerCase();

    return demoTableData.filter((row) =>
      row.name.toLowerCase().includes(lower) ||
      row.designation.toLowerCase().includes(lower) ||
      row.emp_id.toLowerCase().includes(lower) ||
      row.mobile.toLowerCase().includes(lower) ||
      row.current_posted_office.toLowerCase().includes(lower) ||
      row.date_of_birth.toLowerCase().includes(lower)
    );
  }, [searchText, demoTableData]);

  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: <div className="text-center w-full">SL NO.</div>,
      selector: (_row, index) => (index ?? 0) + 1,
      sortable: true,
      center: true,
      grow: 0.5
    },
    {
      name: <div className="text-center w-full">NAME</div>,
      selector: row => row.name,
      sortable: true,
      center: true,
      grow: 1.5
    },
    {
      name: <div className="text-center w-full">DESIGNATION</div>,
      selector: row => row.designation,
      sortable: true,
      center: true,
      grow: 1.3
    },
    {
      name: <div className="text-center w-full">EMP. ID</div>,
      selector: row => row.emp_id,
      sortable: true,
      center: true,
    },
    {
      name: <div className="text-center w-full">MOBILE</div>,
      selector: row => row.mobile,
      sortable: true,
      center: true,
    },
    {
      name: <div className="text-center w-full">CURRENT POSTED OFFICE</div>,
      selector: row => row.current_posted_office,
      sortable: true,
      center: true,
      wrap: true,
      grow: 1.5
    },
    {
      name: <div className="text-center w-full">DATE OF BIRTH</div>,
      selector: row => row.date_of_birth,
      sortable: true,
      center: true,
    },
    {
      name: <div className="text-center w-full">ACTION</div>,
      center: true,
      cell: () => (
        <button
          className="bg-[#3d9970] hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 whitespace-nowrap"
          style={{ cursor: "pointer" }}
        >
          <Eye size={16} /> View Info
        </button>
      ),
    },
  ];

  return (
    <div className="w-full pl-5 pt-5 pb-5 pr-5 bg-[#ededed]">

      <h1 className="text-2xl mb-4 text-gray-800">Employee List</h1>

      {/* Search Input */}
      <div className="mb-3 flex">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-64"
        />
      </div>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <DataTable
          columns={tableColumns}
          data={filteredData}
          pagination
          striped
          highlightOnHover
          dense
          responsive
          customStyles={{
            headCells: {
              style: {
                background: "#1E73BE",
                color: "white",
                fontWeight: "200",
                fontSize: "12px",
                textAlign: "center",
                justifyContent: "center",
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "20px",
                paddingTop: "8px",
                paddingBottom: "8px",
              },
            },
            cells: {
              style: {
                textAlign: "center",
                justifyContent: "center",
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "20px",
                paddingTop: "12px",
                paddingBottom: "12px",
                borderRight: "1px solid #e5e7eb",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AllOfficeEmployeeList;
