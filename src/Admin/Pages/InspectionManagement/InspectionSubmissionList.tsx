import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

/* ============================
   TYPES
============================ */
interface Inspection {
  id: number;
  inspector_id: number;
  inspector_name: string;
  inspector_mobile: string;
  inspector_department: string;
  assigned_block_id: number;
  assigned_block_name: string | null;
  alc_ins_date: string;
  has_date_assigned: boolean;
  date: string | null;
}

interface PendingSubmission {
  id: number;
  dist_id: number;
  district_name: string;
  sub_id: number;
  subdivision_name: string;
  alc_id: number;
  alc_name: string;
  alc_mobile: string;
  dlc_id: number;
  dlc_name: string;
  dlc_mobile: string;
  randomization_date: string;
  inspections: Inspection[];
  total_inspections: number;
  pending_inspections: number;
}

interface ApiResponse {
  code: number;
  data: PendingSubmission;
}
interface TableRow {
  sl: number;
  randomizationId: number;
  inspectionId: number;
  inspectorId: number;
  inspectorName: string;
  inspectorMobile: string;
  assignedBlockId: number;
  assignedBlock: string;
  alcInsDate: string;
  randomizationDate: string;
  inspectionDate: string;
}

interface InspectionDateMap {
  [inspectionId: number]: string;
}

interface OrderRow {
  sl: number;
  randomizationId: number;
  randomizationDate: string;
  dlcName: string;
}

interface OrderResponse {
  code: number;
  data: {
    sl_no: number;
    randomization_id: number;
    randomization_date: string;
    dlc_name: string;
  }[];
  total: number;
}

/* ============================
   TABLE COLUMNS
============================ */
const getColumns = (
  dateMap: InspectionDateMap,
  onDateChange: (id: number, date: string) => void,
): TableColumn<TableRow>[] => [
  { name: "SL NO", selector: (r) => r.sl, width: "80px", center: true },
  {
    name: "INSPECTOR NAME",
    selector: (r) => r.inspectorName,
    grow: 1.5,
    wrap: true,
  },
  { name: "MOBILE", selector: (r) => r.inspectorMobile, width: "130px" },
  {
    name: "ASSIGNED BLOCK",
    selector: (r) => r.assignedBlock,
    grow: 1,
    wrap: true,
  },
  {
    name: "INSPECTION DATE",
    selector: (r) => r.alcInsDate,
    width: "200px",
  },
  // { name: "RANDOMIZATION DATE", selector: (r) => r.randomizationDate, width: "160px" },
  {
    name: "INSPECTION DATE",
    cell: (r) => (
      <input
        type="date"
        value={dateMap[r.inspectionId] || r.inspectionDate || ""}
        onChange={(e) => onDateChange(r.inspectionId, e.target.value)}
        className="rounded border border-[#d7e0ea] px-2 py-1 text-xs focus:border-[#3b8dbc] focus:outline-none"
      />
    ),
    width: "150px",
  },
];

const customStyles = {
  table: { style: { border: "1px solid #ccc" } },
  headRow: {
    style: {
      backgroundColor: "#3b8dbc",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      minHeight: "36px",
    },
  },
  headCells: { style: { borderRight: "1px solid #ccc" } },
  rows: {
    style: { fontSize: "13px", minHeight: "34px" },
    stripedStyle: { backgroundColor: "#f2f2f2" },
  },
  cells: { style: { borderRight: "1px solid #ddd" } },
};

/* ============================
   COMPONENT
============================ */
const InspectionSubmissionList: React.FC = () => {
  const { orderId } = useParams();

  const randomizationOrderId = Number(orderId);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [alcUserId, setAlcUserId] = useState<number | null>(null);
  const [dateMap, setDateMap] = useState<InspectionDateMap>({});
  const [submissionData, setSubmissionData] =
    useState<PendingSubmission | null>(null);
  const [orderFile, setOrderFile] = useState<File | null>(null);

  const fetchPendingSubmissions = async (randomizationOrderId: number) => {
    setLoading(true);

    try {
      const res = await axios.get<ApiResponse>(
        `${API_BASE}inspections/pending-submissions?orderId=${randomizationOrderId}`,
      );

      const submission = res.data.data;

      setSubmissionData(submission);

      let index = 1;

      const allRows: TableRow[] = [];

      submission.inspections.forEach((inspection) => {
        allRows.push({
          sl: index++,
          randomizationId: submission.id,
          inspectionId: inspection.id,
          inspectorId: inspection.inspector_id,
          inspectorName: inspection.inspector_name || "-",
          inspectorMobile: inspection.inspector_mobile || "-",
          assignedBlockId: inspection.assigned_block_id,
          assignedBlock: inspection.assigned_block_name || "-",
          alcInsDate: inspection.alc_ins_date
            ? new Date(inspection.alc_ins_date).toLocaleDateString("en-IN")
            : "-",
          randomizationDate: submission.randomization_date
            ? new Date(submission.randomization_date).toLocaleDateString(
                "en-IN",
              )
            : "-",
          inspectionDate: inspection.date || "",
        });
      });

      setRows(allRows);
    } catch {
      toast.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (inspectionId: number, date: string) => {
    setDateMap((prev) => ({ ...prev, [inspectionId]: date }));
  };

  const handleSubmitDates = async () => {
    if (!alcUserId) {
      toast.error("User not logged in");
      return;
    }

    const randomizationGroups = new Map<number, TableRow[]>();
    rows.forEach((row) => {
      const inspectionDate = dateMap[row.inspectionId];
      if (inspectionDate) {
        if (!randomizationGroups.has(row.randomizationId)) {
          randomizationGroups.set(row.randomizationId, []);
        }
        randomizationGroups.get(row.randomizationId)!.push(row);
      }
    });

    try {
      for (const [randomizationId, groupRows] of randomizationGroups) {
        const inspections = groupRows.map((row) => ({
          inspector_id: row.inspectorId,
          assigned_block_id: row.assignedBlockId,
          inspection_date: dateMap[row.inspectionId],
        }));

        const payload: any = {
          randomization_id: randomizationId,
          alc_user_id: alcUserId,
          inspections,
        };

        if (orderFile) {
          payload.order_file_path = `/uploads/${orderFile.name}`;
          payload.order_file_name = orderFile.name;
        }

        await axios.post(
          `${API_BASE}inspections/submit-inspection-dates`,
          payload,
        );
      }

      toast.success("Inspection dates submitted successfully");
      setDateMap({});
      setOrderFile(null);
      if (randomizationOrderId) {
        fetchPendingSubmissions(randomizationOrderId);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to submit inspection dates");
      }
      console.error(err);
    }
  };

  useEffect(() => {
    if (randomizationOrderId) {
      fetchPendingSubmissions(randomizationOrderId);
    }
  }, [randomizationOrderId]);

  useEffect(() => {
    const authData = localStorage.getItem("lc_portal_auth");
    setAlcUserId(null);

    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const userId = parsed?.user?.uid;
        if (userId) {
          setAlcUserId(Number(userId));
        } else {
          toast.error("User ID not found in authentication data");
        }
      } catch {
        toast.error("Failed to parse authentication data");
      }
    } else {
      toast.error("Authentication error. Please login again.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto space-y-6">
        <div className="rounded-xl border border-[#d7e0ea] bg-white px-4 py-4 shadow-sm">
          <h1 className="text-[24px] mb-5 font-semibold text-[#203040]">
            Inspection Lists
          </h1>

          <DataTable
            columns={getColumns(dateMap, handleDateChange)}
            data={rows}
            progressPending={loading}
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[10, 20, 50]}
            striped
            customStyles={customStyles}
          />

          <div className="mt-4 flex justify-end">
            {rows.length > 0 && (
              <button
                onClick={handleSubmitDates}
                className="rounded bg-[#3b8dbc] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#2d6fa3]"
              >
                Submit All Dates
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionSubmissionList;
