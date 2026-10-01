import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  Eye,
  AlertCircle,
  Phone,
  ExternalLink,
} from "lucide-react";

import { API_BASE } from "@/constants/constants";
import { getUserDetails, getUserId } from "@/utils/auth";
import { log } from "console";

/* ============================
   TYPES
 ============================ */
type ActionType =
  | "Show Cause Notice"
  | "Late Off Notice"
  | "Recommended for Court Case"
  | "Court Case";

const RECOMMENDED_FOR_CC: ActionType = "Recommended for Court Case";

interface CaseDetails {
  id: number;
  randomization_id: number;
  inspector_id: number;
  assigned_block_id: number;
  alc_ins_date: string;
  alc_order_uploaded_path: string;
  alc_order_uploaded_file: string;
  date: string;
  created_at: string;
  updated_at: string;
}

interface OrderDetails {
  id: number;
  dist_id: number;
  sub_id: number;
  alc_id: number;
  dlc_id: number;
  randomization_date: string;
  created_by: number;
  uploaded_file_path: string;
  file_name: string;
  uploaded_by: number;
  uploaded_date: string;
  created_at: string;
  updated_at: string;
}

interface LocationDetails {
  districtName: string;
  subdivisionName: string;
  blockName: string;
}

interface OfficerDetails {
  fullname: string;
  mobile: string;
  degisnation: string;
  department: string;
}

interface InspectionNote {
  id: number;
  randomization_details_id: number;
  act: string;
  inspector_id: number;
  est_name: string;
  est_address: string;
  est_reg_no: string;
  est_post: string;
  infringements: string | null;
  inf_remark: string | null;
  is_central: number;
  alc_action?: string | null;
  alc_remarks?: string | null;
  alc_action_count?: number | null;
  alc_case_status?: string | null;
  prev_alc_action?: string | null;
  prev_alc_remarks?: string | null;
  created_at: string;
  updated_at: string;
}

interface Infringement {
  cust_infring_id: number;
  ins_file_number: number;
  type_of_infring: string;
  infring_name: string;
  sc_cc_status: string | null;
  verification_dt: string | null;
  verification_tm: string | null;
  ins_verify_place: string | null;
  show_cause_note: string | null;
  per_no_full_sc_status: string | null;
  let_off_note: string | null;
  alc_cc_let_st: string | null;
  no_cc_cases: string | null;
  ins_user_id: number;
  ins_alc_name: string | null;
  cc_lf_note_insp: string | null;
  insp_lf_cc_alc_again_dt: string | null;
  insp_lf_cc_alc_again_nm: string | null;
  regenerate_st: string | null;
  regenerate_remarks: string | null;
  regenerate_dt: string | null;
  alc_cc_lf_note: string | null;
  cc_lf_level_lf_dt: string | null;
  after_reco_insp_app_dt: string | null;
  cc_lf_level_cc_app_dt: string | null;
  cc_lf_level_cc_back_dt: string | null;
  cc_lf_level_reco_dt: string | null;
  cc_lf_level_lf_back_dt: string | null;
  sc_level_lf_app_note: string | null;
  sc_level_lf_app_dt: string | null;
  sc_level_lf_back_note: string | null;
  sc_level_lf_back_dt: string | null;
  cc_lf_level_lf_back_note: string | null;
  cc_lf_level_cc_back_note: string | null;
  cc_lf_level_recom_note: string | null;
  all_status_submit_dt: string | null;
  showcause_submit_dt: string | null;
  sc_plf_cc_plf_insp_fwd_alc_dt: string | null;
  courtcase_infg_dismiss_dt: string | null;
  infra_id: number;
  remark_by_insp: string | null;
  insp_id: number | null;
  ins_remark: string | null;
  ins_status: string;
  ins_sub_date: string | null;
  alc_status: string | null;
  alc_sub_date: string | null;
  uploaded_file_path: string | null;
  is_central: number;
  created_at: string;
  updated_at: string;
}

interface OrderPreviewData {
  caseDetails: CaseDetails;
  orderDetails: OrderDetails;
  locationDetails: LocationDetails;
  inspectorDetails: OfficerDetails;
  alcDetails: OfficerDetails;
  dlcDetails: OfficerDetails;
  inspectionNote: InspectionNote;
  establishmentMasterDetails: any | null;
  infringements: Infringement[];
  uploadedFilePath: string;
}

/**
 * The case actions are split between the two roles:
 *   Inspector : Show Cause Notice, Late Off Notice, Recommend for Court Case
 *   ALC       : Court Case only — and only on a case the inspector recommended.
 */
const INSPECTOR_ACTIONS: { value: ActionType; label: string; color: string }[] = [
  { value: "Show Cause Notice", label: "Show Cause Notice", color: "#eab308" },
  { value: "Late Off Notice", label: "Late Off Notice", color: "#ef4444" },
  { value: RECOMMENDED_FOR_CC, label: "Recommend for Court Case", color: "#f97316" },
];

const ALC_ACTIONS: { value: ActionType; label: string; color: string }[] = [
  { value: "Court Case", label: "Court Case", color: "#22c55e" },
];

/* ============================
   COMPONENT
 ============================ */
const AlcCaseAction: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const user = getUserDetails();

  console.log(user);


  const [orderPreview, setOrderPreview] = useState<OrderPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}inspections/alc-order-list-preview-by-id/${caseId}`
        );
        if (res.data?.code === 200 && res.data?.data) {
          setOrderPreview(res.data.data);
        } else {
          toast.error("Failed to fetch inspection details");
        }
      } catch (err) {
        toast.error("Error loading case details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchPreview();
    }
  }, [caseId]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async () => {
    if (!selectedAction) {
      toast.error("Please select an action type");
      return;
    }

    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    const userId = getUserId();

    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(`${API_BASE}inspections/alc-submit-action`, {
        caseId: Number(caseId),
        actionType: selectedAction,
        remarks: remarks.trim(),
        userId: Number(userId),
      });

      toast.success("Action submitted successfully");
      navigate(-1);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to submit action");
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Loading inspection case details...</p>
        </div>
      </div>
    );
  }

  if (!orderPreview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] p-4 md:p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h2 className="mb-2 text-lg font-semibold text-slate-800 font-sans">No Details Found</h2>
          <p className="mb-6 text-sm text-slate-600 font-sans">
            We could not retrieve details for case ID: {caseId}
          </p>
          <button
            onClick={() => navigate("/alc-orders-list")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Orders List
          </button>
        </div>
      </div>
    );
  }

  const isCaseClosed =
    orderPreview.inspectionNote?.alc_case_status === "Closed" ||
    (orderPreview.inspectionNote?.alc_action_count !== undefined &&
      orderPreview.inspectionNote.alc_action_count !== null &&
      orderPreview.inspectionNote.alc_action_count >= 3);

  const roleId = Number(user?.role);
  const isAlcUser = roleId === 4;
  const isInspectorUser = roleId === 7;
  const actionOptions = isAlcUser ? ALC_ACTIONS : INSPECTOR_ACTIONS;

  // The ALC's Court Case action is unlocked only by the inspector's
  // recommendation on this case.
  const isRecommendedForCourtCase =
    orderPreview.inspectionNote?.alc_action === RECOMMENDED_FOR_CC;

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/alc-orders-list")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                Inspection Order Preview
              </h1>
              <p className="text-xs font-semibold text-slate-500">Case ID: #{caseId}</p>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100 shadow-sm">
            {isAlcUser ? "Action Pending (ALC Review)" : "Action Pending (Inspector)"}
          </div>
        </div>

        {/* Case & Order Info + Location Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Case & Order Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">Case & Order Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-xs sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-400">Case ID:</span>{" "}
                <span className="ml-1 font-bold text-slate-800">{orderPreview.caseDetails?.id || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Randomization ID:</span>{" "}
                <span className="ml-1 font-bold text-slate-800">{orderPreview.caseDetails?.randomization_id || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Inspection Date (ALC):</span>{" "}
                <span className="ml-1 font-bold text-slate-800">{formatDate(orderPreview.caseDetails?.alc_ins_date)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Randomization Date:</span>{" "}
                <span className="ml-1 font-bold text-slate-800">{formatDate(orderPreview.orderDetails?.randomization_date)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Assigned Block ID:</span>{" "}
                <span className="ml-1 font-bold text-slate-800">{orderPreview.caseDetails?.assigned_block_id || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Order Uploaded Date:</span>{" "}
                <span className="ml-1 font-bold text-slate-800">{formatDate(orderPreview.orderDetails?.uploaded_date) || "-"}</span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">Location Details</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-400">District:</span>
                <span className="font-bold text-slate-800">{orderPreview.locationDetails?.districtName || "-"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-400">Subdivision:</span>
                <span className="font-bold text-slate-800">{orderPreview.locationDetails?.subdivisionName || "-"}</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-slate-400">Block Name:</span>
                <span className="font-bold text-slate-800">{orderPreview.locationDetails?.blockName || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Establishment Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Establishment Details</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-xs md:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-400">Establishment Name:</span>
              <h4 className="mt-1 text-sm font-bold text-slate-800">
                {orderPreview.inspectionNote?.est_name || "-"}
              </h4>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Establishment Address:</span>
              <p className="mt-1 font-bold text-slate-800">
                {orderPreview.inspectionNote?.est_address || "-"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Registration Number:</span>
              <p className="mt-1">
                <span className="inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                  {orderPreview.inspectionNote?.est_reg_no || "Not Registered"}
                </span>
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Act Inspected Under:</span>
              <p className="mt-1">
                <span className="inline-block rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
                  {orderPreview.inspectionNote?.act || "-"}
                </span>
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Post / Police Station:</span>
              <p className="mt-1 font-bold text-slate-800">
                {orderPreview.inspectionNote?.est_post || "-"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-400">Jurisdiction:</span>
              <p className="mt-1">
                <span className={`inline-block rounded border px-2 py-0.5 font-bold ${orderPreview.inspectionNote?.is_central === 1
                  ? "border-amber-100 bg-amber-50 text-amber-700"
                  : "border-teal-100 bg-teal-50 text-teal-700"
                  }`}>
                  {orderPreview.inspectionNote?.is_central === 1 ? "Central" : "State"}
                </span>
              </p>
            </div>
          </div>

          {/* Establishment Master Details */}
          {/* {orderPreview.establishmentMasterDetails && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Establishment Master Database Info
              </h3>
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-150 bg-slate-50/50 p-4 text-xs sm:grid-cols-2 md:grid-cols-3">
                {Object.entries(orderPreview.establishmentMasterDetails).map(([key, val]) => {
                  if (val === null || val === undefined || typeof val === "object") return null;
                  return (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-bold text-slate-700">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}
        </div>

        {/* Officer Contacts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Inspector Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Inspector Details</h3>
                <p className="text-[10px] text-slate-400">Assigned Field Officer</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-400">Full Name:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.inspectorDetails?.fullname || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Designation:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.inspectorDetails?.degisnation || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Mobile:</span>{" "}
                {orderPreview.inspectorDetails?.mobile ? (
                  <a
                    href={`tel:${orderPreview.inspectorDetails.mobile}`}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {orderPreview.inspectorDetails.mobile}
                  </a>
                ) : (
                  <span className="font-bold text-slate-700">-</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-400">Department:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.inspectorDetails?.department || "-"}</span>
              </div>
            </div>
          </div>

          {/* ALC Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">ALC Details</h3>
                <p className="text-[10px] text-slate-400">Assistant Labour Commissioner</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-400">Full Name:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.alcDetails?.fullname || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Designation:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.alcDetails?.degisnation || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Mobile:</span>{" "}
                {orderPreview.alcDetails?.mobile ? (
                  <a
                    href={`tel:${orderPreview.alcDetails.mobile}`}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {orderPreview.alcDetails.mobile}
                  </a>
                ) : (
                  <span className="font-bold text-slate-700">-</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-400">Department:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.alcDetails?.department || "-"}</span>
              </div>
            </div>
          </div>

          {/* DLC Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">DLC Details</h3>
                <p className="text-[10px] text-slate-400">Deputy Labour Commissioner</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-400">Full Name:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.dlcDetails?.fullname || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Designation:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.dlcDetails?.degisnation || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Mobile:</span>{" "}
                {orderPreview.dlcDetails?.mobile ? (
                  <a
                    href={`tel:${orderPreview.dlcDetails.mobile}`}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {orderPreview.dlcDetails.mobile}
                  </a>
                ) : (
                  <span className="font-bold text-slate-700">-</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-400">Department:</span>{" "}
                <span className="font-bold text-slate-700">{orderPreview.dlcDetails?.department || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Infringements Detected */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-rose-50 p-1.5 text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Infringements Detected</h2>
              <p className="text-[10px] text-slate-400">Violations observed during inspection</p>
            </div>
          </div>

          {!orderPreview.infringements || orderPreview.infringements.length === 0 ? (
            <div className="py-6 text-center text-xs font-semibold text-slate-500">
              No infringements reported.
            </div>
          ) : (
            <div className="space-y-4">
              {orderPreview.infringements.map((inf, i) => (
                <div
                  key={inf.cust_infring_id || i}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-all hover:border-slate-200 hover:shadow-xs"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100 uppercase">
                      Type {inf.type_of_infring || "A"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 uppercase">
                      {inf.ins_status === "FS" ? "Final Submitted" : inf.ins_status || "Submitted"}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xs font-bold text-slate-800 md:text-sm">
                    {inf.infring_name}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-3 text-xs md:grid-cols-2">
                    <div>
                      <span className="font-bold text-slate-400">Remarks by Inspector:</span>
                      <p className="mt-1 rounded border border-slate-150 bg-white p-2 text-slate-700 italic font-medium">
                        {inf.ins_remark || "No remarks entered"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-bold text-slate-400">Submission Date:</span>
                        <span className="ml-2 font-semibold text-slate-700">
                          {formatDate(inf.ins_sub_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Note / Report PDF */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Inspector's Uploaded Inspection Note</h2>
                <p className="text-[10px] text-slate-400">Full uploaded inspection document</p>
              </div>
            </div>
            {orderPreview.uploadedFilePath && (
              <a
                href={`${API_BASE.replace(/\/$/, "")}${orderPreview.uploadedFilePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Eye className="h-3.5 w-3.5" /> View in New Tab
              </a>
            )}
          </div>

          {orderPreview.uploadedFilePath ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
              <iframe
                title="Inspection PDF Document"
                src={`${API_BASE.replace(/\/$/, "")}${orderPreview.uploadedFilePath}`}
                className="h-[550px] w-full rounded border-0 bg-white"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs font-semibold text-slate-500">
              No report PDF uploaded by the inspector.
            </div>
          )}
        </div>

        {/* Decision & Action History */}
        {(orderPreview.inspectionNote?.alc_action || orderPreview.inspectionNote?.prev_alc_action) && (() => {
          const prevActions = orderPreview.inspectionNote.prev_alc_action
            ? orderPreview.inspectionNote.prev_alc_action.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
          const prevRemarks = orderPreview.inspectionNote.prev_alc_remarks
            ? orderPreview.inspectionNote.prev_alc_remarks.split("|").map((s) => s.trim())
            : [];

          const timelineEvents: { action: string; remarks: string; isLatest: boolean; index: number }[] = [];

          prevActions.forEach((act, idx) => {
            timelineEvents.push({
              action: act,
              remarks: prevRemarks[idx] || "",
              isLatest: false,
              index: idx + 1,
            });
          });

          if (orderPreview.inspectionNote.alc_action) {
            timelineEvents.push({
              action: orderPreview.inspectionNote.alc_action,
              remarks: orderPreview.inspectionNote.alc_remarks || "",
              isLatest: true,
              index: timelineEvents.length + 1,
            });
          }

          const getActionBadgeStyle = (action: string) => {
            const act = action.trim();
            if (act === "Show Cause Notice") {
              return {
                badge: "bg-amber-50 text-amber-700 border-amber-100",
                dot: "bg-amber-500",
                text: "text-amber-700",
              };
            } else if (act === "Late Off Notice") {
              return {
                badge: "bg-rose-50 text-rose-700 border-rose-100",
                dot: "bg-rose-500",
                text: "text-rose-700",
              };
            } else if (act === "Court Case") {
              return {
                badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
                dot: "bg-emerald-500",
                text: "text-emerald-700",
              };
            }
            return {
              badge: "bg-slate-100 text-slate-700 border-slate-200",
              dot: "bg-slate-500",
              text: "text-slate-700",
            };
          };

          return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">ALC Case Action History</h2>
                  <p className="text-[10px] text-slate-400">Chronological history of case decisions</p>
                </div>
              </div>
              <div className="space-y-6">
                {timelineEvents.map((event, idx) => {
                  const styles = getActionBadgeStyle(event.action);
                  const isLast = idx === timelineEvents.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`relative pl-6 ${!isLast ? "border-l-2 border-slate-200 pb-6 ml-2.5" : "ml-2.5"
                        }`}
                    >
                      {/* Circle Dot */}
                      <div
                        className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${styles.dot}`}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">
                            {event.isLatest ? "Latest Action:" : `Action #${event.index}:`}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase ${styles.badge}`}>
                            {event.action}
                          </span>
                        </div>

                        {event.isLatest && orderPreview.inspectionNote.alc_case_status && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${orderPreview.inspectionNote.alc_case_status === "Closed"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}
                          >
                            Case Status: {orderPreview.inspectionNote.alc_case_status}
                          </span>
                        )}
                      </div>

                      {event.remarks && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium italic">
                          "{event.remarks}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Action Form */}
        {(isAlcUser || isInspectorUser) && <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            {isAlcUser ? "Submit ALC Case Action" : "Submit Inspector Case Action"}
          </h2>

          {isAlcUser && !isCaseClosed && !isRecommendedForCourtCase && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4 text-xs font-medium text-amber-800 shadow-inner">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold">Awaiting recommendation:</span> a
                court case can only be filed once the inspector has recommended
                this case for prosecution.
              </div>
            </div>
          )}

          {isCaseClosed && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-inner">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <span className="font-bold">Action Disabled:</span> This inspection case has been marked as closed. No further actions can be submitted.
              </div>
            </div>
          )}

          {/* Action Type Selection */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Action Type
            </label>
            <div className="flex flex-wrap gap-3">
              {actionOptions.map((opt) => {
                const isSelected = selectedAction === opt.value;
                const isDisabledForOpt =
                  isCaseClosed ||
                  (opt.value === "Court Case" && !isRecommendedForCourtCase) ||
                  (opt.value === "Show Cause Notice" &&
                    orderPreview.inspectionNote?.alc_action_count !== undefined &&
                    orderPreview.inspectionNote?.alc_action_count !== null &&
                    orderPreview.inspectionNote.alc_action_count >= 2);

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isDisabledForOpt}
                    onClick={() => !isDisabledForOpt && setSelectedAction(opt.value)}
                    className={`rounded-lg border-2 px-4 py-2 text-xs font-bold transition-all shadow-xs ${isDisabledForOpt
                      ? "opacity-50 cursor-not-allowed border-slate-250 bg-slate-50 text-slate-400"
                      : "cursor-pointer"
                      }`}
                    style={
                      isDisabledForOpt
                        ? undefined
                        : {
                          borderColor: isSelected ? opt.color : "#e2e8f0",
                          backgroundColor: isSelected ? opt.color : "#fff",
                          color: isSelected ? "#fff" : "#334155",
                        }
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-5">
            <label
              htmlFor="remarks"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              rows={4}
              value={remarks}
              disabled={isCaseClosed}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                isCaseClosed
                  ? "Case is closed. Cannot submit remarks."
                  : "Provide case action justification and instructions here..."
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50/20 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                isCaseClosed ||
                (isAlcUser && !isRecommendedForCourtCase)
              }
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Submitting Action..." : "Submit Action"}
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default AlcCaseAction;
