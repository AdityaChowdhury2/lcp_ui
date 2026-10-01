import { FC, useState, useEffect, useMemo } from "react";
import { getUserRole, getAuthToken } from "../../../utils/auth";

import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { encryptionDecryptionFun } from "../../../utils/encryption";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
// import StatusBadge from "../StatusBadge";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  principal_employer_details: string;
  license_details: string;
  office_details: string;
  status: string;
  highlight?: boolean;
}

const CLRALicenseList: FC = () => {
  const navigate = useNavigate();

  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  // DEMO DATA (typed)
  const demoTableData: TableRow[] = [
    
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
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>PRINCIPAL EMPLOYER DETAILS</div>,
    selector: (row: TableRow) => row.principal_employer_details,
    sortable: true,
    cell: (row: TableRow) => <div>{row.principal_employer_details}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>LICENSE DETAILS</div>,
    width: "200px",
    selector: (row: TableRow) => row.license_details,
    sortable: true,
    cell: (row: TableRow) => <div>{row.license_details}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>OFFICE DETAILS</div>,
    width: "250px",
    selector: (row: TableRow) => row.office_details,
    sortable: true,
    cell: (row: TableRow) => <div>{row.office_details}</div>,
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
      row.status === "Pending" ?
      <img
        src={`${IMAGE_BASE}btn-applied.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Final Submitted" ?
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
      row.status === "Rectification" ?
      <img
        src={`${IMAGE_BASE}btn-rectification.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Rejected" ?
      <img
        src={`${IMAGE_BASE}btn-reject.png`}
        alt="logo"
        className="object-contain"
      /> :
      row.status === "Forwarded" &&
      <img
        src={`${IMAGE_BASE}btn-to-alc.png`}
        alt="logo"
        className="object-contain"
      /> 
    ),
  },
  {
    name: "OPERATIONS",
    width: "170px",
    cell: () => ( <div className="flex-col">
      <button 
        className="hover:text-blue-900 text-blue-600 px-2 py-1 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
        onClick={() => navigate("/alc-visible-applications")}>
        <div className="text-green-400"><MdOutlineRadioButtonChecked /></div> View Application
      </button>
      <button 
        className="hover:text-blue-900 text-blue-600 px-2 py-1 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
        onClick={() => navigate("/alc-visible-applications")}>
        <div className="text-green-400"><MdOutlineRadioButtonChecked /></div> View Applicant Profile
      </button> </div>
    ),
  },
];

 
  // ------------------------------------
  // FETCH DATA
  // ------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setHeaderText("LICENSE LISTS UNDER CLRA ACT");
        // const encryptedType = await encryptAES({ act_id: 1, status: 0 });

        const encryptedType = await encryptionDecryptionFun('encrypt', JSON.stringify({ act_id: 1, status: 0 })) ?? "";
        const safeEncryptedType = encodeURIComponent(encryptedType);
        
        // Use encrypted value in URL
        const response = await axios.get<any>(
          `${API_BASE}receivedapplications/${safeEncryptedType}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            params: {
              type: "",
            }
          }
        );

        const applications = response.data.applications || [];
        console.log("Received data", applications);

        const mappedData: TableRow[] = applications.map((item: any) => ({
          id_no: item.identification_number,
          regnodate: `${item.registration_number} ${new Date(item.registration_date).toLocaleDateString()}`,
          bmcnasez: item.village_name,
          establishment: item.unit_name,
          applydate: new Date(item.apply_date).toLocaleDateString(),
          status: item.status_label
        }));

        console.log("Mapped Table Data:", mappedData);

        setAllTableData(mappedData);
      } catch (err) {
        console.error("Failed to get data: ", err);
      }
    };
    fetchData();
  }, []);
  

  // filtering data for search
  useEffect(() => {
    // Apply search on baseData
    if (searchText.trim() === "") {
      setTableData(allTableData);
    } else {
      const filteredData = allTableData.filter((item) =>
        item.principal_employer_details?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.license_details?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.office_details?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase())
      );

      setTableData(filteredData);
    }
  }, [searchText, allTableData]);

  // Handle tab change
  // const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
  //   setTabValue(newValue);
  // };

  return (
    <div className="overflow-x-auto">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">
        {headerText}
      </h1>

      <div className="bg-[#fff] p-[10px] rounded-md border-t-3 border-blue-600">
        {demoTableData.length > 0 && <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-2 w-80"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />}

        {/* ----------------------------
            PURE HTML TAB PANELS
        ----------------------------- */}
        {/* {Object.keys(tabHeaders).map((tab) =>
          tabValue === tab ? ( */}
            <div className="pt-2 mb-2 overflow-x-auto">
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
          {/* ) : null
        )} */}

      </div>
    </div>
  );
};

export default CLRALicenseList;
