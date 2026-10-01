import { FC, useEffect, useState } from "react";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUserRole } from "../../../utils/auth";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { resolveUpdatedFormV } from "@/utils/contractorLicenseRouteLinks";

type TabKey =
  | "All"
  | "Pending"
  | "Forward"
  | "Sent Back for Rectification"
  | "Final Submit"
  | "Issued"
  | "Rejected";

interface ApiRow {
  amendment_id: number;
  created_by: number;
  status: string;
  formv: number;
  updated_formv: number;
  from_date: string;
  to_date: string;
  name: string;
  licenseno: string;
  licensedate: string;
  sez: {
    code: number;
    name: string;
  };
  applicationdate: string;
  pe_regno: string;
  pe_regdate: string;
}

interface TableRow {
  application_id: string;
  created_by: string;
  formVSerialNo: string;
  updatedFormVSerialNo: string;
  formv_refno: string;
  contractor_name: string;
  pe_regno: string;
  pe_reg_date: string;
  licenseno: string;
  license_date: string;
  bmcnasez: string;
  validupto: string;
  application_date: string;
  status: string;
}

const tabHeaders: Record<TabKey, string> = {
  All: "Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
  Pending: "Pending Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
  Forward: "Forwarded Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
  "Sent Back for Rectification": "Rectification Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
  "Final Submit": "Final Submitted Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
  Issued: "Issued Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
  Rejected: "Rejected Application for Amendment of Contractor License under the Contract Labour (R&A) Act, 1970",
};

const tabStatusParam: Record<TabKey, string> = {
  All: "",
  Pending: "pending",
  Forward: "forward",
  "Sent Back for Rectification": "rectification",
  "Final Submit": "finalsubmit",
  Issued: "issued",
  Rejected: "rejected",
};

const safeText = (value: unknown): string => {
  const s = String(value ?? "").trim();
  return s || "—";
};

const toDisplayDate = (value: unknown): string => {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return safeText(value);
  return d.toLocaleDateString("en-IN");
};

const normalizeStatus = (status: unknown): string => {
  const code = String(status ?? "").trim().toUpperCase();

  switch (code) {
    case "F":
      return "Pending";
    case "B":
      return "Rectification";
    case "FW":
      return "Forwarded";
    case "U":
      return "Final Submit";
    case "I":
      return "Issued";
    case "R":
      return "Rejected";
    default:
      return "—";
  }
};

const AmendmentLicenseCLRA: FC = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState<TabKey>("Pending");
  const [headerText, setHeaderText] = useState<string>(tabHeaders.Pending);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [searchValues, setSearchValues] = useState({
    contractor_name: "",
    formv_refno: "",
    licenseno: "",
  });

  const userRole = Number(getUserRole());

  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: "SL NO.",
      width: "100px",
      selector: (_row: TableRow, index?: number) => (index ?? 0) + 1,
      cell: (_row: TableRow, index?: number) => <div className="w-full">{(index ?? 0) + 1}</div>,
      sortable: true,
    },
    {
      name: (
        <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }} className="grid gap-1">
          <p>FORM-V / REF.NO.</p> <p>CONTRACTOR NAME</p>
        </div>
      ),
      minWidth: "220px",
      selector: (row: TableRow) => row.formv_refno,
      sortable: true,
      cell: (row: TableRow) => (
        <div className="grid gap-2">
          <p className="font-semibold">{row.formv_refno}</p> <p>{row.contractor_name}</p>
        </div>
      ),
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>PE REGISTRATION NO. & DATE</div>,
      minWidth: "180px",
      selector: (row: TableRow) => row.pe_regno,
      sortable: true,
      cell: (row: TableRow) => (
        <div className="grid gap-2">
          <p>{row.pe_regno}</p> <p>{row.pe_reg_date}</p>
        </div>
      ),
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>LICENSE NO. & DATE</div>,
      minWidth: "180px",
      selector: (row: TableRow) => row.licenseno,
      sortable: true,
      cell: (row: TableRow) => (
        <div className="grid gap-2">
          <p>{row.licenseno}</p> <p>{row.license_date}</p>
        </div>
      ),
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>B/M/C/NA/SEZ</div>,
      minWidth: "200px",
      selector: (row: TableRow) => row.bmcnasez,
      sortable: true,
      cell: (row: TableRow) => <div>{row.bmcnasez}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>VALID UPTO</div>,
      minWidth: "150px",
      selector: (row: TableRow) => row.validupto,
      sortable: true,
      cell: (row: TableRow) => <div>{row.validupto}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal" }}>APPLICATION DATE</div>,
      selector: (row: TableRow) => row.application_date,
      sortable: true,
      cell: (row: TableRow) => <div>{row.application_date}</div>,
    },
    {
      name: "STATUS",
      width: "160px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) => {
        const status = row.status;
        const image =
          status === "Approved" || status === "V"
            ? "btn-approved.png"
            : status === "Applied"
              ? "btn-applied.png"
              : status === "Fees Paid" || status === "T"
                ? "btn-fees-paid.png"
                : status === "Fees Pending"
                  ? "btn-fees-pending.png"
                  : status === "Pending" || status === "F"
                    ? "btn-applied.png"
                    : status === "Final Submitted" || status === "Final Submit" || status === "U"
                      ? "btn-final-submit.png"
                      : status === "Issued" || status === "I"
                        ? "btn-issued.png"
                        : status === "Rectification" || status === "B"
                          ? "btn-rectification.png"
                          : status === "Rejected" || status === "R"
                            ? "btn-reject.png"
                            : status === "Forwarded" || status === "FW"
                              ? "btn-to-alc.png"
                              : "";

        if (!image) return <span>{status}</span>;
        return <img src={`${IMAGE_BASE}${image}`} alt={status} className="object-contain" />;
      },
    },
    {
      name: "ACTION",
      width: "140px",
      omit: userRole === 7,
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => {
            const encryptedFormV = encryptionDecryptionFun(
              "encrypt",
              String(row.formVSerialNo)
            );

            const encryptedAmendmentId = encryptionDecryptionFun(
              "encrypt",
              String(row.application_id)
            );

            // `updatedFormVSerialNo` is display text, so it is "—" when the row has no
            // newer Form-V revision. Encrypting that placeholder puts a dash into the
            // route where a serial is expected, so resolve it to a real number first.
            const encryptedUpdatedFormV = encryptionDecryptionFun(
              "encrypt",
              String(
                resolveUpdatedFormV(
                  row.updatedFormVSerialNo,
                  row.formVSerialNo,
                ) ?? ""
              )
            );

            const encryptedUpdatedCreatedBy = encryptionDecryptionFun(
              "encrypt",
              String(row.created_by)
            )

            if (
              !encryptedFormV ||
              !encryptedAmendmentId ||
              !encryptedUpdatedFormV ||
              !encryptedUpdatedCreatedBy
            ) {
              return;
            }

            navigate(
              `/alc-view-ammend-license?formVNo=${encodeURIComponent(
                encryptedFormV
              )}&updatedFormVNo=${encodeURIComponent(
                encryptedUpdatedFormV
              )}&amendId=${encodeURIComponent(
                encryptedAmendmentId
              )}&createdBy=${encodeURIComponent(
                encryptedUpdatedCreatedBy
              )}`
            );
          }}
        >
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];

  const fetchData = async (opts?: { page?: number; limit?: number; withSearch?: boolean }) => {
    try {
      setLoading(true);
      setErrorText("");
      setHeaderText(tabHeaders[tabValue]);
      const effectivePage = Math.max(1, opts?.page ?? page ?? 1);
      const effectiveLimit = Math.max(1, opts?.limit ?? perPage ?? 10);
      const withSearch = opts?.withSearch ?? false;
      const params = new URLSearchParams();
      if (tabValue !== "All") {
        params.set("status", tabStatusParam[tabValue]);
      }
      params.set("page", String(effectivePage));
      params.set("limit", String(effectiveLimit));
      if (withSearch) {
        const name = searchValues.contractor_name.trim();
        const formv = searchValues.formv_refno.trim();
        const licenseno = searchValues.licenseno.trim();
        if (name) params.set("name", name);
        if (formv) params.set("formv", formv);
        if (licenseno) params.set("licenseno", licenseno);
      }

      const response = await fetch(`${API_BASE}contractor-license/amend-license-list?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData?.message ?? "Unable to load amendment list.");
      }

      const rows: ApiRow[] = Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      const mappedData: TableRow[] = rows.map((item) => ({
        application_id: safeText(item.amendment_id),

        created_by: safeText(item.created_by),

        formVSerialNo: safeText(item.formv),
        updatedFormVSerialNo: safeText(item.updated_formv),

        formv_refno: `00${safeText(item.formv)}`,

        contractor_name: safeText(item.name),

        pe_regno: safeText(item.pe_regno),
        pe_reg_date: toDisplayDate(item.pe_regdate),

        licenseno: safeText(item.licenseno),
        license_date: toDisplayDate(item.licensedate),

        // SEZ actual name
        bmcnasez: safeText(item.sez?.name),

        // Valid upto = to_date
        validupto: toDisplayDate(item.to_date),

        application_date: toDisplayDate(item.applicationdate),

        status: normalizeStatus(item.status),
      }));

      setTableData(mappedData);
      setTotalRows(Number(responseData?.pagination?.total ?? 0));
      setPage(effectivePage);
      setPerPage(effectiveLimit);
    } catch (err) {
      console.error("Failed to fetch amendment list:", err);
      setTableData([]);
      setTotalRows(0);
      setErrorText("Unable to load amendment list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData({ page: 1, limit: perPage, withSearch: true });
  }, [tabValue]);

  const handleSearch = () => {
    if (
      !searchValues.contractor_name.trim() &&
      !searchValues.formv_refno.trim() &&
      !searchValues.licenseno.trim()
    ) {
      setErrorText("Select minimum one parameter for search.");
      return;
    }
    fetchData({ page: 1, limit: perPage, withSearch: true });
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl mb-4 text-gray-800">{headerText}</h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <div className="flex gap-0 border-b border-gray-300 bg-white justify-start p-0">
          {(Object.keys(tabHeaders) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabValue(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-none border-b-2 transition-all ${tabValue === tab
                ? "border-[#1E73BE] text-gray-800 bg-white"
                : "border-transparent text-[#F2A33C] hover:text-blue-500"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-8 mb-3 mt-5 flex-wrap items-end">
          <div className="flex flex-col gap-1">
            <label className="font-bold">Contractor Name</label>
            <input
              type="text"
              placeholder="Contractor Name"
              className="border p-2 w-55"
              value={searchValues.contractor_name}
              onChange={(e) => setSearchValues({ ...searchValues, contractor_name: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">Form-V</label>
            <input
              type="text"
              placeholder="Form-V"
              className="border p-2 w-55"
              value={searchValues.formv_refno}
              onChange={(e) => setSearchValues({ ...searchValues, formv_refno: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">License No</label>
            <input
              type="text"
              placeholder="License No"
              className="border p-2 w-55"
              value={searchValues.licenseno}
              onChange={(e) => setSearchValues({ ...searchValues, licenseno: e.target.value })}
            />
          </div>

          <button className="bg-[#3C8DBC] text-white px-4 py-2 rounded" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="pt-2 mb-2 overflow-x-auto">
          <DataTable
            columns={tableColumns}
            data={tableData}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            onChangePage={(nextPage) => fetchData({ page: nextPage, limit: perPage, withSearch: true })}
            onChangeRowsPerPage={(nextPerPage, currentPage) =>
              fetchData({ page: currentPage, limit: nextPerPage, withSearch: true })
            }
            striped
            highlightOnHover
            dense
            progressPending={loading}
            noDataComponent={
              <div className="py-4 text-sm text-gray-600">{errorText || "No amendment applications found."}</div>
            }
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
          />
        </div>
      </div>
    </div>
  );
};

export default AmendmentLicenseCLRA;
