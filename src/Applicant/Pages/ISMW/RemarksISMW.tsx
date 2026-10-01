import { IMAGE_BASE } from "@/constants/constants";
import DataTable, { TableColumn } from "react-data-table-component";

interface RemarkRow {
  slNo: number;
  dateTime: string;
  remark: string;
  status: string;
  remarkBy: string;
}

const data: RemarkRow[] = [
  {
    slNo: 1,
    dateTime: "31/08/2025",
    remark:
      "Application is sent back for rectification. Kindly modify disapproved fields and re-submit the application. test LP",
    status: "For Rectification",
    remarkBy: "ALC",
  },
];

// Mapping status to image
const statusImages: Record<string, string> = {
  "For Rectification": `${IMAGE_BASE}btn-rectification.png`,
  Rectification: `${IMAGE_BASE}btn-rectification.png`,
};

const columns: TableColumn<RemarkRow>[] = [
  {
    name: "Sl. No",
    selector: (row) => row.slNo,
    width: "90px",
  },
  {
    name: "Date - Time",
    selector: (row) => row.dateTime,
    width: "150px",
  },
  {
    name: "Remark",
    selector: (row) => row.remark,
    wrap: true,
    grow: 3,
  },
  {
    name: "Remark Status",
    width: "180px",
    selector: (row) => row.status,
    cell: (row) =>
      statusImages[row.status] ? (
        <img
          src={statusImages[row.status]}
          alt={row.status}
          className="object-contain h-8"
        />
      ) : (
        <span className="text-sm">{row.status}</span>
      ),
  },
  {
    name: "Remark By",
    selector: (row) => row.remarkBy,
    width: "120px",
  },
];

export default function RemarkDetailsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">
          REMARK DETAILS
        </h1>
      </div>

      {/* Page Background */}
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="bg-white shadow rounded border">
          <DataTable
            columns={columns}
            data={data}
            striped
            highlightOnHover
            responsive
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: "#2f5f86",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "14px",
                },
              },
              headCells: {
                style: {
                  borderRight: "1px solid #e5e7eb",
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
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  alignItems: "flex-start",
                },
              },
            }}
          />
        </div>
      </div>
    </>
  );
}
