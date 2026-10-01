import { FC, useEffect, useState } from "react";
import { getAuthToken, getUserRole } from "../../../utils/auth";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

interface TableRow {
  sl_no: number;
  renewal_id_enc: string;
  license_id_enc: string;
  formv_refno: string;
  contractor_name: string;
  license_details: string;
  establishment_details: string;
  regno: string;
  bmcnasez: string;
  validupto?: string;
  application_date: string;
  status: string;
  highlight?: boolean;
}

interface RenewalListItem {
  sl_no: number;
  renewal_id: number | string;
  license_id: number | string;
  renewal_id_enc: string;
  license_id_enc: string;
  contractor?: {
    name?: string;
    serial_label?: string;
  };
  establishment?: {
    name?: string;
    registration_number?: string;
  };
  worksite?: {
    block?: string;
  };
  license?: {
    info?: string;
    valid_till?: string;
  };
  dates?: {
    applied_on?: string;
  };
  status?: string;
}

interface RenewalListResponse {
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  data?: RenewalListItem[];
}

const formatDate = (value?: string) => {
  if (!value) return "";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-GB");
};

const mapApiStatusToLabel = (status?: string) => {
  switch (status) {
    case "F":
      return "Pending";
    case "FW":
      return "Forwarded";
    case "B":
      return "Rectification";
    case "U":
      return "Final Submit";
    case "A":
      return "Approved";
    case "P":
      return "Fees Paid";
    case "I":
      return "Issued";
    case "R":
      return "Rejected";
    default:
      return status || "";
  }
};

const renderStatusImage = (status: string) => {
  if (status === "Approved" || status === "V") {
    return (
      <img
        src={`${IMAGE_BASE}btn-approved.png`}
        alt="Approved"
        className="object-contain"
      />
    );
  }

  if (status === "Applied" || status === "Pending") {
    return (
      <img
        src={`${IMAGE_BASE}btn-applied.png`}
        alt="Pending"
        className="object-contain"
      />
    );
  }

  if (status === "Fees Paid" || status === "T") {
    return (
      <img
        src={`${IMAGE_BASE}btn-fees-paid.png`}
        alt="Fees Paid"
        className="object-contain"
      />
    );
  }

  if (status === "Fees Pending") {
    return (
      <img
        src={`${IMAGE_BASE}btn-fees-pending.png`}
        alt="Fees Pending"
        className="object-contain"
      />
    );
  }

  if (status === "Final Submitted" || status === "Final Submit") {
    return (
      <img
        src={`${IMAGE_BASE}btn-final-submit.png`}
        alt="Final Submit"
        className="object-contain"
      />
    );
  }

  if (status === "Issued") {
    return (
      <img
        src={`${IMAGE_BASE}btn-issued.png`}
        alt="Issued"
        className="object-contain"
      />
    );
  }

  if (status === "Rectification") {
    return (
      <img
        src={`${IMAGE_BASE}btn-rectification.png`}
        alt="Rectification"
        className="object-contain"
      />
    );
  }

  if (status === "Rejected") {
    return (
      <img
        src={`${IMAGE_BASE}btn-reject.png`}
        alt="Rejected"
        className="object-contain"
      />
    );
  }

  if (status === "Forwarded") {
    return (
      <img
        src={`${IMAGE_BASE}btn-to-alc.png`}
        alt="Forwarded"
        className="object-contain"
      />
    );
  }

  return <span>{status}</span>;
};

const RenewalLicenseCLRA: FC = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);

  const userRole = Number(getUserRole());

  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: "SL NO.",
      width: "100px",
      selector: (row: TableRow) => row.sl_no,
      cell: (row: TableRow) => <div className="w-full">{row.sl_no}</div>,
      sortable: true,
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "normal",
          }}
          className="grid gap-1"
        >
          <p>FORM-V / REF.NO.</p>
          <p>CONTRACTOR NAME</p>
        </div>
      ),
      minWidth: "200px",
      selector: (row: TableRow) => row.formv_refno,
      sortable: true,
      cell: (row: TableRow) => (
        <div className="grid gap-2">
          <p className="font-semibold">{row.formv_refno}</p>
          <p>{row.contractor_name}</p>
        </div>
      ),
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "normal",
          }}
        >
          LICENSE DETAILS
        </div>
      ),
      minWidth: "220px",
      selector: (row: TableRow) => row.license_details,
      sortable: true,
      cell: (row: TableRow) => (
        <div className="grid gap-2">
          <p>{row.license_details}</p>
          <p className="font-semibold">VALID TILL: {row.validupto || "-"}</p>
        </div>
      ),
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "normal",
          }}
        >
          B/M/C/NA/SEZ
        </div>
      ),
      minWidth: "200px",
      selector: (row: TableRow) => row.bmcnasez,
      sortable: true,
      cell: (row: TableRow) => <div>{row.bmcnasez}</div>,
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "normal",
          }}
        >
          ESTABLISHMENT DETAILS
        </div>
      ),
      minWidth: "250px",
      selector: (row: TableRow) => row.establishment_details,
      sortable: true,
      cell: (row: TableRow) => (
        <div className="grid gap-2">
          <p>PE : {row.establishment_details}</p>
          <p>REG NO : {row.regno}</p>
        </div>
      ),
    },
    {
      name: (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "normal",
          }}
        >
          APPLY DATE
        </div>
      ),
      minWidth: "150px",
      selector: (row: TableRow) => row.application_date,
      sortable: true,
      cell: (row: TableRow) => <div>{row.application_date}</div>,
    },
    {
      name: "STATUS",
      width: "150px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) => renderStatusImage(row.status),
    },
    {
      name: "ACTION",
      width: "140px",
      omit: userRole === 7,
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => {
            navigate(
              `/alc-view-contractor-license-renewal?renewalId=${encodeURIComponent(row.renewal_id_enc)}&licenseId=${encodeURIComponent(row.license_id_enc)}`
            );
          }}
        >
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];

  const tabHeaders: Record<string, string> = {
    All: "Application for Renewal of Contractor License under The Contract Labour (R&A) Act, 1970",
    Pending:
      "Pending Application for Renewal of Contractor License under The Contract Labour (R&A) Act, 1970",
    Forward:
      "Forwarded Application for Renewal of Contractor License under The Contract Labour (R&A) Act, 1970",
    "Final Submit":
      "Final Submitted Application for Renewal of Contractor License under The Contract Labour (R&A) Act, 1970",
    Issued:
      "Issued Application for Renewal of Contractor License under The Contract Labour (R&A) Act, 1970",
    Rejected:
      "Rejected Application for Renewal of Contractor License under The Contract Labour (R&A) Act, 1970",
  };

  const tabValueStatusMap: Record<string, string | undefined> = {
    All: undefined,
    Pending: "pending",
    Forward: "forwarded",
    "Final Submit": "final_submit",
    Issued: "issued",
    Rejected: "rejected",
  };

  useEffect(() => {
    setHeaderText(tabHeaders[tabValue] || "");
    setPage(1);
  }, [tabValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const status = tabValueStatusMap[tabValue];
        const response = await axios.get<RenewalListResponse>(
          `${API_BASE}contractor-license/alc/renewal-list`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            params: {
              page,
              limit,
              ...(status ? { status } : {}),
            },
          }
        );

        const result = response.data;
        const applications = result.data || [];

        const mappedData: TableRow[] = applications.map((item) => ({
          sl_no: item.sl_no,
          renewal_id_enc: String(item.renewal_id_enc ?? ""),
          license_id_enc: String(item.license_id_enc ?? ""),
          formv_refno: item.contractor?.serial_label || "-",
          contractor_name: item.contractor?.name || "-",
          license_details: item.license?.info || "In Process",
          validupto: formatDate(item.license?.valid_till),
          bmcnasez: item.worksite?.block || "-",
          establishment_details: item.establishment?.name || "-",
          regno: item.establishment?.registration_number || "-",
          application_date: item.dates?.applied_on || "",
          status: mapApiStatusToLabel(item.status),
        }));

        setAllTableData(mappedData);
        setTotalRows(result.meta?.total || 0);
      } catch (err) {
        console.error("Failed to get data: ", err);
        setAllTableData([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tabValue, page, limit]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setTableData(allTableData);
      return;
    }

    const filteredData = allTableData.filter((item) =>
      item.formv_refno?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.contractor_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.license_details?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.bmcnasez?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.establishment_details?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.application_date?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchText.toLowerCase())
    );

    setTableData(filteredData);
  }, [searchText, allTableData]);

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl mb-4 text-gray-800">{headerText}</h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-2 w-80"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="flex gap-0 border-b border-gray-300 bg-white justify-start p-0">
          {Object.keys(tabHeaders).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabValue(tab)}
              className={`
                px-5 py-2 text-sm font-medium rounded-none border-b-2 transition-all
                ${tabValue === tab
                  ? "border-[#1E73BE] text-gray-800 bg-white"
                  : "border-transparent text-[#F2A33C] hover:text-blue-500"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {Object.keys(tabHeaders).map((tab) =>
          tabValue === tab ? (
            <div key={tab} className="pt-2 mb-2 overflow-x-auto">
              <DataTable
                columns={tableColumns}
                data={tableData}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={limit}
                paginationRowsPerPageOptions={[10, 20, 50]}
                onChangePage={(currentPage) => setPage(currentPage)}
                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                  setLimit(currentRowsPerPage);
                  setPage(currentPage);
                }}
                striped
                highlightOnHover
                dense
                noDataComponent="No renewal applications found"
                customStyles={{
                  headCells: {
                    style: {
                      background: "#3C8DBC",
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

export default RenewalLicenseCLRA;
