import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { useLocation } from "react-router-dom";
import { getUserId } from "@/utils/auth";
import { toast } from "react-toastify";

/* ============================
   TYPES
============================ */
interface InspectionRow {
  sl: number;
  districtName: string;
  assignedOfficer: string;
  postedBlock: string;
  assignedBlock: string;
  mobile: string;
}

interface ApiInspector {
  usr_id: number;
  fullname: string;
  mobile?: string;
  block_name?: string;
  block_code?: number;
  org?: {
    block_name?: string;
    subdivision_name?: string;
  };
}

interface ApiResponse {
  code: number;
  result?: {
    dlc_user_id?: number;
    dlc_name?: string;
    district_code?: number;
    district_name?: string;
    selected_alc?: {
      fullname?: string;
      mobile?: string;
      sub_div_code?: number;
      usr_id?: number;
    };
    inspectors?: ApiInspector[];
    total_inspectors?: number;
  };
}

interface UserDistrictSubdivisionResponse {
  code?: number;
  result?: {
    district_code?: number;
    sub_div_code?: number;
  };
}

interface RandomizePayload {
  userId: number;
  district_code: number;
  sub_div_code: number;
}

/* ============================
   TABLE COLUMNS
============================ */
const inspectionColumns: TableColumn<InspectionRow>[] = [
  { name: "SL NO", selector: (r) => r.sl, width: "80px", center: true },
  { name: "DIST NAME", selector: (r) => r.districtName },
  { name: "ASSIGNED OFFICER", selector: (r) => r.assignedOfficer, wrap: true },
  { name: "POSTED BLOCK", selector: (r) => r.postedBlock },
  { name: "ASSIGNED BLOCK", selector: (r) => r.assignedBlock },
  { name: "MOB", selector: (r) => r.mobile, width: "140px" },
];

/* ============================
   NIC TABLE STYLE
============================ */
const customStyles = {
  table: {
    style: {
      border: "1px solid #ccc",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#3b8dbc",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      minHeight: "36px",
    },
  },
  rows: {
    style: {
      fontSize: "13px",
      minHeight: "34px",
    },
    stripedStyle: {
      backgroundColor: "#f2f2f2",
    },
  },
  cells: {
    style: {
      borderRight: "1px solid #ddd",
    },
  },
};

/* ============================
   COMPONENT
============================ */
const InspectorRandomization: React.FC = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [inspectionRows, setInspectionRows] = useState<InspectionRow[]>([]);
  const [summaryDetails, setSummaryDetails] = useState({
    subdiv: "",
    alcName: "",
  });
  const [requestPayload, setRequestPayload] = useState<RandomizePayload | null>(
    null,
  );
  const [randomizeResult, setRandomizeResult] = useState<
    ApiResponse["result"] | null
  >(null);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();

  const resolvePayload = async (): Promise<RandomizePayload | null> => {
    const searchParams = new URLSearchParams(location.search);
    const userIdRaw = searchParams.get("userId") ?? getUserId();
    const userId = userIdRaw ? Number(userIdRaw) : NaN;

    if (!userIdRaw || Number.isNaN(userId)) {
      return null;
    }

    const cachedPayload = requestPayload;
    if (
      cachedPayload?.userId === userId &&
      cachedPayload.district_code &&
      cachedPayload.sub_div_code
    ) {
      return cachedPayload;
    }

    const lookupResponse = await axios.get<UserDistrictSubdivisionResponse>(
      `${API_BASE}user-district-subdiv`,
    );

    const lookupResult = lookupResponse.data?.result;
    const districtCode = lookupResult?.district_code;
    const subDivCode = lookupResult?.sub_div_code;

    if (!districtCode || !subDivCode) {
      return null;
    }

    return {
      userId,
      district_code: districtCode,
      sub_div_code: subDivCode,
    };
  };

  const handleRandomize = async () => {
    const searchParams = new URLSearchParams(location.search);
    const userIdRaw = searchParams.get("userId") ?? getUserId();

    if (!userIdRaw) return;

    setErrorMessage(null);

    try {
      const response = await axios.post<ApiResponse>(
        `${API_BASE}inspections/randomize?userId=${userIdRaw}`,
      );

      const result = response.data?.result;
      const inspectors = result?.inspectors ?? [];

      // Save payload for future regenerate
      const payload = {
        userId: Number(userIdRaw),
        district_code: result?.district_code ?? 0,
        sub_div_code: result?.selected_alc?.sub_div_code ?? 0,
      };

      setRequestPayload(payload);
      setRandomizeResult(result ?? null);

      setSummaryDetails({
        subdiv: result?.inspectors?.[0]?.org?.subdivision_name ?? "",
        alcName: result?.selected_alc?.fullname ?? "",
      });

      setInspectionRows(
        inspectors.map((inspector, index) => ({
          sl: index + 1,
          districtName:
            result?.district_name ?? String(result?.district_code ?? ""),
          assignedOfficer: inspector.fullname,
          postedBlock: inspector.org?.block_name ?? inspector.block_name ?? "",
          assignedBlock:
            inspector.block_name ?? inspector.org?.block_name ?? "",
          mobile: inspector.mobile ?? "",
        })),
      );

      setIsGenerated(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to generate randomization");
      }
      console.error(error);
    }
  };

  const handleGenerateOrder = async () => {
    if (!requestPayload || !randomizeResult) return;

    const userId = String(requestPayload.userId);
    const uploadedDate = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);

    const today = new Date().toISOString().split("T")[0];

    try {
      await axios.post(`${API_BASE}inspections/submission`, {
        dist_id: String(randomizeResult.district_code ?? ""),
        sub_id: String(randomizeResult.selected_alc?.sub_div_code ?? ""),
        alc_id: String(randomizeResult.selected_alc?.usr_id ?? ""),
        dlc_id: String(randomizeResult.dlc_user_id ?? ""),
        randomization_date: today,
        created_by: userId,
        uploaded_file_path: "",
        file_name: "",
        uploaded_by: userId,
        uploaded_date: uploadedDate,
        details: (randomizeResult.inspectors ?? []).map((inspector) => ({
          inspector_id: String(inspector.usr_id),
          assigned_block_id: String(inspector.block_code ?? ""),
          alc_ins_date: today,
          alc_order_uploaded_path: "",
          alc_order_uploaded_file: "",
          date: uploadedDate,
        })),
      });
      setIsOrderSubmitted(true);
      toast.success("Order submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit order");
    }
  };

  const handleRegenerate = async () => {
    if (!requestPayload) return;

    setErrorMessage(null);

    try {
      const response = await axios.post<ApiResponse>(
        `${API_BASE}inspections/randomize`,
        requestPayload,
      );

      const result = response.data?.result;
      const inspectors = result?.inspectors ?? [];

      setRandomizeResult(result ?? null);

      setInspectionRows(
        inspectors.map((inspector, index) => ({
          sl: index + 1,
          districtName:
            result?.district_name ?? String(result?.district_code ?? ""),
          assignedOfficer: inspector.fullname,
          postedBlock: inspector.org?.block_name ?? inspector.block_name ?? "",
          assignedBlock:
            inspector.block_name ?? inspector.org?.block_name ?? "",
          mobile: inspector.mobile ?? "",
        })),
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Failed to regenerate randomization");
      }
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-[#d7e0ea] bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold text-[#203040]">
              Randomization
            </h1>
            <p className="mt-1 text-sm text-[#607080]">
              Manage inspection block assignment and inspector allocation.
            </p>
          </div>
          {!isGenerated && (
            <button
              onClick={handleRandomize}
              className="inline-flex items-center justify-center rounded-[6px] bg-[#2f80ed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2569c9]"
            >
              Generate
            </button>
          )}
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-[#f5c6cb] bg-[#f8d7da] px-4 py-8 text-center shadow-sm">
            <div className="text-base font-semibold text-[#721c24]">
              {errorMessage}
            </div>
          </div>
        ) : isGenerated ? (
          <div className="rounded-xl border border-[#d7e0ea] bg-white shadow-sm">
            <div className="border-b border-[#e6edf5] px-4 py-3">
              <h2 className="text-[16px] font-semibold text-[#203040]">
                Inspection List
              </h2>
            </div>

            <div className="grid gap-4 border-t border-[#e6edf5] p-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[6px] bg-[#f8fafc] px-3 py-2">
                <div className="text-xs text-[#607080]">Alc Name</div>
                <div className="text-sm font-semibold text-[#203040]">
                  {summaryDetails.alcName}
                </div>
              </div>
              <div className="rounded-[6px] bg-[#f8fafc] px-3 py-2">
                <div className="text-xs text-[#607080]">Sub-Division Name</div>
                <div className="text-sm font-semibold text-[#203040]">
                  {summaryDetails.subdiv}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <DataTable
                  columns={inspectionColumns}
                  data={inspectionRows}
                  striped
                  pagination={false}
                  customStyles={customStyles}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#e6edf5] px-4 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={handleRegenerate}
                className="inline-flex items-center justify-center rounded-[6px] bg-[#2f80ed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2569c9]"
              >
                Regenerate
              </button>
              <button
                onClick={handleGenerateOrder}
                disabled={isOrderSubmitted}
                className="inline-flex items-center justify-center rounded-[6px] bg-green-500  px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Order
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#cfd8e3] bg-white px-4 py-8 text-center shadow-sm">
            <div className="text-base font-semibold text-[#203040]">
              Click Generate to load inspection details
            </div>
            <div className="mt-1 text-sm text-[#607080]">
              The page will render backend-driven details after generation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorRandomization;
