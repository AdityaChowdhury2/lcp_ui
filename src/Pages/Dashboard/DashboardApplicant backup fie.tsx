import { ACTS, API_BASE, IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { getAuthToken, getUserName } from "../../utils/auth";
import { encryptionDecryptionFun } from "../../utils/encryption";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { IoIosArrowDroprightCircle } from "react-icons/io";

interface RowData {
  id: number;
  regNo: string;
  regDate: string;
  establishment: string;
  identificationNo: string;
  act: string;
  status: string;
}

function getActionLinks(row: RowData) {
  const encAppId = encryptionDecryptionFun("encrypt", String(row.id)) ?? "";
  const encClraActId = encryptionDecryptionFun("encrypt", "1") ?? "";
  const encBocwaActId = encryptionDecryptionFun("encrypt", "2") ?? "";

  const actUpper = (row.act ?? "").toUpperCase();
  const isClraAmendment = actUpper.includes("CLRA") && actUpper.includes("AMENDMENT");
  const isBocwaAmendment = actUpper.includes("BOCWA") && actUpper.includes("AMENDMENT");
  const isFeesPending = row.status === "Fees Pending" || row.status === "V";
  const isFormIBacked = row.status === "U" || row.status === "VA" || row.status === "T";

  const viewDetailsUrl = isClraAmendment
    ? `/clra-reg-amendment/view-clra-application?id=${encodeURIComponent(encAppId)}&tab=preview`
    : isBocwaAmendment
      ? `/amendment-bocwa/bocwa-amendment-submit?id=${encodeURIComponent(encAppId)}&tab=2`
      : "#";

  const payNowUrl = isFeesPending && isClraAmendment
    ? `/epayments-preview?applicationId=${encodeURIComponent(encAppId)}&actId=${encodeURIComponent(encClraActId)}`
    : isFeesPending && isBocwaAmendment
      ? `/epayments-preview?applicationId=${encodeURIComponent(encAppId)}&actId=${encodeURIComponent(encBocwaActId)}`
      : null;

  const formIBackUrl = isFormIBacked
    ? `/upload_signed_application_form/${encodeURIComponent(encAppId)}/${encodeURIComponent(encClraActId)}/${row.identificationNo}`
    : null;

  return { viewDetailsUrl, payNowUrl, formIBackUrl };
}

function renderStatusCell(status: string) {
  if (status === null) {
    return (
      <div className="bg-red-600 px-2 py-1 text-red-100 rounded-sm text-[11px]">
        INCOMPLETE
      </div>
    );
  }

  const fileName = STATUS_IMAGE_MAP[status];
  if (!fileName) return null;

  return (
    <img
      src={`${IMAGE_BASE}${fileName}`}
      alt={status}
      className="object-contain"
    />
  );
}

export default function DashboardApplicant() {
  const [tableData, setTableData] = useState<RowData[]>([]);
  const userName = getUserName() ?? "";

  useEffect(() => {
    const getDashboardTableData = async () => {
      try {
        const responses = await Promise.all(
          ACTS.map((act: string) =>
            axios.get(`${API_BASE}applicant-module/applications/dashboard?act=${act}`, {
              headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json",
              },
            })
          )
        );

        const mergedData = responses.flatMap((res) => res?.data?.data || []);
        const rowData: RowData[] = mergedData.map((d: any) => ({
          id: d?.id,
          regNo: d?.registration_number,
          establishment: d?.e_name || d?.mtw_name,
          regDate: d?.registration_date
            ? new Date(d.registration_date).toLocaleDateString()
            : "",
          identificationNo: d?.identification_number,
          act: d?.act,
          status: d?.status,
        }));

        setTableData(rowData);
      } catch (error) {
        console.error("Dashboard API Error:", error);
        setTableData([]);
      }
    };

    getDashboardTableData();
  }, []);

  const columns = useMemo<TableColumn<RowData>[]>(
    () => [
      {
        name: "Sl. No",
        cell: (_row, index) => index + 1,
        width: "80px",
      },
      {
        name: "REG NO. & DATE",
        style: { minWidth: "150px" },
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold">{row.regNo}</span>
            <span className="text-sm">{row.regDate}</span>
          </div>
        ),
        wrap: true,
      },
      {
        name: "ESTABLISHMENT NAME",
        style: { minWidth: "200px" },
        selector: (row) => row.establishment,
        wrap: true,
      },
      {
        name: "SERVICE",
        style: { minWidth: "150px" },
        selector: (row) => row.act,
        wrap: true,
      },
      {
        name: "STATUS",
        width: "150px",
        selector: (row) => row.status,
        cell: (row) => renderStatusCell(row.status),
      },
      {
        name: "ACTION",
        width: "230px",
        cell: (row) => {
          const { viewDetailsUrl, payNowUrl, formIBackUrl } = getActionLinks(row);

          return (
            <div className="flex flex-col gap-1 text-blue-600 text-xs font-medium">
              {payNowUrl && (
                <a href={payNowUrl} className="hover:text-blue-800 flex gap-1">
                  <IoIosArrowDroprightCircle />
                  Pay Now
                </a>
              )}
              <a
                href={viewDetailsUrl}
                className={`flex gap-1 ${viewDetailsUrl === "#"
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:text-blue-800"
                  }`}
              >
                <IoIosArrowDroprightCircle />
                View Details
              </a>

              <a href="/view_remarks" className="hover:text-blue-800 flex gap-1">
                <IoIosArrowDroprightCircle /> View Remarks
              </a>

              {formIBackUrl && (
                <a href={formIBackUrl} className="text-amber-600 hover:text-amber-700 flex gap-1">
                  <IoIosArrowDroprightCircle />
                  Download & Upload Form-I with Signature
                </a>
              )}

              <a href="#" className="hover:text-blue-800 flex gap-1">
                <IoIosArrowDroprightCircle /> Download Certificate
              </a>

              <a href="#" className="text-gray-400 flex gap-1 cursor-not-allowed">
                <IoIosArrowDroprightCircle /> Download Form-V
              </a>

              <a href="#" className="hover:text-blue-800 flex gap-1">
                <IoIosArrowDroprightCircle /> Download Acknowledgement
              </a>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          MY DASHBOARD
        </h1>
      </div>

      <div className="bg-white shadow rounded border p-4 mb-15">
        <DataTable
          columns={columns}
          data={tableData}
          striped
          highlightOnHover
          responsive
          noDataComponent={
            <div className="py-6 text-center text-gray-500 text-sm font-medium">
              No applications found for {userName}.
            </div>
          }
          customStyles={{
            headRow: {
              style: {
                backgroundColor: "#2b5f88",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "13px",
              },
            },
            headCells: {
              style: {
                borderRight: "1px solid #e5e7eb",
                whiteSpace: "normal",
              },
            },
            rows: {
              style: {
                fontSize: "13px",
              },
            },
            cells: {
              style: {
                borderRight: "1px solid #e5e7eb",
                alignItems: "flex-start",
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            },
          }}
        />
      </div>
    </>
  );
}
