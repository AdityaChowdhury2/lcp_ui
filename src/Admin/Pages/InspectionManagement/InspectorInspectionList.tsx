import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { toast } from "react-toastify";

import { API_BASE } from "@/constants/constants";
import { getUserId, getUserRole } from "@/utils/auth";
import { useNavigate } from "react-router";
import {
  Eye,
  FileEdit,
  AlertTriangle,
  ShieldCheck,
  ClipboardCheck,
  Scale,
  Gavel,
  RotateCcw,
  Download,
} from "lucide-react";

interface InspectionRecord {
  slno: number;
  insFileNumber: string;
  establishmentName: string;
  establishmentType: string;
  ownerName: string;
  address: string;
  inspectionDate: string;
  submitStatus: string;
  randomizationOrderNo: string;
  alcCaseStatus: string | null;
  showCauseIssued: boolean;
  showCauseVerified: boolean;
  showCauseCount: number;
  hasUncompliedInfringement?: boolean;
  hasCompliedInfringement?: boolean;
  courtCaseRecommended: boolean;
  letOffRecommended?: boolean;
  sentBack?: boolean;
  alcRemark?: string | null;
  recomRemark?: string | null;
  letOffRemark?: string | null;
  courtProceedingFiled?: boolean;
  statusCode: string;
  statusLabel: string;
}

// Actions that can be performed from the list
type CaseAction =
  | "lateoff"
  | "recommend"
  | "approve_lateoff"
  | "approve_courtcase"
  | "sent_back";

const ACTION_META: Record<
  CaseAction,
  {
    title: string;
    button: string;
    placeholder: string;
    successMsg: string;
    errorMsg: string;
    isRemarkRequired: boolean;
    infoBanner?: string;
  }
> = {
  lateoff: {
    title: "Recommend for Let Off",
    button: "Submit Recommendation for Let Off",
    placeholder: "Enter the reason for recommending let off for this case...",
    successMsg: "Case recommended to the ALC for Let Off successfully",
    errorMsg: "Failed to recommend case for Let Off",
    isRemarkRequired: true,
    infoBanner:
      "This will forward the case to the ALC for approval. The case will remain pending until approved by the ALC.",
  },
  recommend: {
    title: "Recommend for Court Case",
    button: "Send Recommendation",
    placeholder:
      "Enter the grounds for recommending this case to the ALC for prosecution...",
    successMsg: "Case recommended to the ALC for court case",
    errorMsg: "Failed to recommend the case for court case",
    isRemarkRequired: true,
    infoBanner:
      "The case is forwarded to the ALC, who alone can approve and file the court case on your recommendation.",
  },
  approve_lateoff: {
    title: "Approval for Let Off",
    button: "Approve & Close Case (Let Off)",
    placeholder: "Enter approval remark (optional)...",
    successMsg: "Case approved for Let Off and closed successfully",
    errorMsg: "Failed to approve Let Off",
    isRemarkRequired: false,
    infoBanner:
      "Approving Let Off will finalize the decision and close this inspection case.",
  },
  approve_courtcase: {
    title: "Approval for Court Case",
    button: "Approve & Close Case (Court Case)",
    placeholder: "Enter court case approval remark...",
    successMsg: "Case escalated to Court Case successfully",
    errorMsg: "Failed to approve court case",
    isRemarkRequired: false,
    infoBanner:
      "Approving will escalate this case to Court Case and close the inspection.",
  },
  sent_back: {
    title: "Sent Back to Inspector",
    button: "Send Back to Inspector",
    placeholder: "Enter the reason for sending this case back to the inspector...",
    successMsg: "Case sent back to inspector successfully",
    errorMsg: "Failed to send case back to inspector",
    isRemarkRequired: true,
    infoBanner:
      "This will return the case to the inspector with your remarks for further action or re-examination.",
  },
};

// Normalized status → badge colour. Keys match backend statusCode values.
const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
  SUBMITTED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  FINAL_SUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
  SHOW_CAUSE: "bg-amber-100 text-amber-800 border-amber-300",
  SHOW_CAUSE_VERIFIED: "bg-purple-100 text-purple-800 border-purple-300",
  LET_OFF_RECOMMENDED: "bg-teal-100 text-teal-800 border-teal-300",
  COURT_CASE_RECOMMENDED: "bg-orange-100 text-orange-800 border-orange-300",
  SENT_BACK: "bg-rose-100 text-rose-800 border-rose-300",
  LET_OFF: "bg-emerald-100 text-emerald-800 border-emerald-300",
  COURT_CASE: "bg-red-100 text-red-800 border-red-300",
};

// Status filter options — "ALL" plus every normalized status code.
const STATUS_FILTERS: { code: string; label: string }[] = [
  { code: "ALL", label: "All" },
  { code: "DRAFT", label: "Draft" },
  { code: "SUBMITTED", label: "Submitted" },
  { code: "FINAL_SUBMITTED", label: "Final Submitted" },
  { code: "SHOW_CAUSE", label: "Show Cause Issued" },
  { code: "SHOW_CAUSE_VERIFIED", label: "Show Cause Verified" },
  { code: "LET_OFF_RECOMMENDED", label: "Recommended for Let Off" },
  { code: "COURT_CASE_RECOMMENDED", label: "Recommended for Court Case" },
  { code: "SENT_BACK", label: "Sent Back by ALC" },
  { code: "LET_OFF", label: "Let Off" },
  { code: "COURT_CASE", label: "Court Case" },
];

const ACTION_TONES = {
  amber: "bg-amber-500 hover:bg-amber-600 focus-visible:outline-amber-500",
  indigo: "bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600",
  green: "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600",
  sky: "bg-sky-600 hover:bg-sky-700 focus-visible:outline-sky-600",
  purple: "bg-purple-600 hover:bg-purple-700 focus-visible:outline-purple-600",
  orange: "bg-orange-600 hover:bg-orange-700 focus-visible:outline-orange-600",
  slate: "bg-slate-600 hover:bg-slate-700 focus-visible:outline-slate-600",
  blue: "bg-[#1E73BE] hover:bg-blue-700 focus-visible:outline-blue-600",
  red: "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600",
} as const;

const RowAction: React.FC<{
  tone: keyof typeof ACTION_TONES;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ tone, icon, label, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-white shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${ACTION_TONES[tone]}`}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    <span className="leading-tight">{label}</span>
  </button>
);

const customStyles = {
  table: { style: { border: "1px solid #d7e0ea" } },
  headRow: {
    style: {
      backgroundColor: "#1E73BE",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 700,
      minHeight: "44px",
      borderBottomWidth: "0",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "11.5px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.04em",
      borderRight: "1px solid rgba(255,255,255,0.18)",
      paddingLeft: "10px",
      paddingRight: "10px",
    },
  },
  rows: {
    style: {
      fontSize: "12.5px",
      minHeight: "52px",
      color: "#334155",
      borderBottomColor: "#e2e8f0",
    },
    stripedStyle: { backgroundColor: "#f8fafc" },
    highlightOnHoverStyle: {
      backgroundColor: "#eaf4fb",
      borderBottomColor: "#cfe4f2",
      outline: "none",
      transitionDuration: "0.15s",
    },
  },
  cells: {
    style: {
      borderRight: "1px solid #eef2f6",
      paddingLeft: "10px",
      paddingRight: "10px",
    },
  },
};

const InspectorInspectionList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InspectionRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  // The case actions are split between the two roles:
  //   Inspector (role 7) : Show Cause, Verify Show Cause, Let Off,
  //                        Recommend for Court Case
  //   ALC       (role 4) : Court Case only, and only once the inspector has
  //                        recommended the case.
  const isAlc = Number(getUserRole()) === 4;
  const isInspector = !isAlc;

  // Remark modal state, shared by Let Off and Recommend for Court Case.
  const [actionFileNo, setActionFileNo] = useState<string | null>(null);
  const [actionType, setActionType] = useState<CaseAction>("lateoff");
  const [actionRemark, setActionRemark] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const params = new URLSearchParams({ userId: String(userId) });

      const res = await axios.get(
        `${API_BASE}inspections/establishment-list?${params.toString()}`,
      );
      setRows(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inspection list");
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (fileNo: string, action: CaseAction) => {
    setActionFileNo(fileNo);
    setActionType(action);
    setActionRemark("");
  };

  const closeActionModal = () => {
    if (actionSubmitting) return;
    setActionFileNo(null);
    setActionRemark("");
  };

  const handleActionSubmit = async () => {
    if (!actionFileNo) return;
    const meta = ACTION_META[actionType];
    if (meta.isRemarkRequired && !actionRemark.trim()) {
      toast.warn("Please enter a remark before submitting.");
      return;
    }

    try {
      setActionSubmitting(true);
      await axios.post(`${API_BASE}inspections/inspector-case-action`, {
        fileNo: actionFileNo,
        action: actionType,
        remark: actionRemark.trim() || undefined,
        userId: Number(getUserId()),
      });
      toast.success(meta.successMsg);
      setActionFileNo(null);
      setActionRemark("");
      // Refresh list
      fetchInspections();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || meta.errorMsg);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDownloadShowCause = async (fileNo: string) => {
    try {
      setDownloadingFile(fileNo);
      const response = await axios.get(
        `${API_BASE}inspections/show-cause-notice-pdf`,
        { params: { inspectionId: fileNo }, responseType: "blob" },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `show-cause-notice-${fileNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Show cause notice downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download show cause notice");
    } finally {
      setDownloadingFile(null);
    }
  };

  const columns: TableColumn<InspectionRecord>[] = [
    {
      name: "SL",
      selector: (row, index) => (index !== undefined ? index + 1 : row.slno),
      width: "60px",
      center: true,
    },
    {
      name: "FILE NUMBER",
      selector: (row) => row.insFileNumber,
      cell: (row) => (
        <div className="text-xs font-semibold whitespace-pre-line py-1">
          <div>{row.insFileNumber}</div>
          <div className="text-gray-500 font-normal">{row.inspectionDate}</div>
        </div>
      ),
      width: "175px",
    },
    {
      name: "NAME OF THE EST./ INDUSTRY/ SHOP",
      selector: (row) => row.establishmentName || "-",
      grow: 2.5,
      wrap: true,
    },
    {
      name: "NAME OF THE OWNER",
      selector: (row) => row.ownerName || "-",
      grow: 1.2,
      wrap: true,
    },
    {
      name: "DATE",
      selector: (row) => row.inspectionDate || "-",
      width: "120px",
    },
    {
      name: "STATUS",
      center: true,
      cell: (row) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold text-center inline-block ${
            STATUS_STYLES[row.statusCode] || STATUS_STYLES.DRAFT
          }`}
        >
          {row.statusLabel || "Draft"}
        </span>
      ),
      width: "250px",
    },
    {
      name: "ACTION",
      width: "220px",
      cell: (row) => {
        const sourceParam = row.insFileNumber.startsWith("WBLC-") ? "ins" : "dlc";
        const isResolved =
          row.statusCode === "LET_OFF" || row.statusCode === "COURT_CASE";
        const isSentBack =
          !isResolved && (row.sentBack || row.statusCode === "SENT_BACK");
        const awaitingAlcLetOff =
          !isResolved &&
          (row.letOffRecommended || row.statusCode === "LET_OFF_RECOMMENDED");
        const awaitingAlcCourtCase =
          !isResolved &&
          (row.courtCaseRecommended || row.statusCode === "COURT_CASE_RECOMMENDED");

        // Freshly submitted, nothing issued yet — inspector's first call.
        const isFreshlySubmitted =
          !isResolved &&
          !isSentBack &&
          !awaitingAlcLetOff &&
          !awaitingAlcCourtCase &&
          !row.showCauseIssued &&
          !row.showCauseVerified &&
          (row.showCauseCount || 0) === 0 &&
          (row.submitStatus === "S" || row.submitStatus === "FS");
        // Show cause issued but not yet verified — still the inspector's step.
        const awaitingVerification =
          !isResolved &&
          !isSentBack &&
          !awaitingAlcLetOff &&
          !awaitingAlcCourtCase &&
          row.showCauseIssued &&
          !row.showCauseVerified;
        // Verified — inspector chooses Recommend for Let Off or Recommend for Court Case.
        const awaitingInspectorDecision =
          !isResolved &&
          !isSentBack &&
          !awaitingAlcLetOff &&
          !awaitingAlcCourtCase &&
          row.showCauseVerified;

        const actions: React.ReactNode[] = [];

        // View / Resume
        actions.push(
          <RowAction
            key="view-resume"
            tone={row.submitStatus === "D" ? "blue" : "slate"}
            icon={
              row.submitStatus === "D" ? (
                <FileEdit className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )
            }
            label={row.submitStatus === "D" ? "Resume" : "View Details"}
            onClick={() =>
              navigate(
                `/inspection-list/final-submit?inspectionId=${row.insFileNumber}&source=${sourceParam}`,
              )
            }
          />
        );

        // 1. Freshly submitted case
        if (isInspector && isFreshlySubmitted) {
          actions.push(
            <RowAction
              key="show-cause"
              tone="amber"
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="Show Cause"
              onClick={() =>
                navigate(`/inspection-list/show-cause/${row.insFileNumber}`)
              }
            />
          );
          if (row.hasCompliedInfringement) {
            actions.push(
              <RowAction
                key="let-off"
                tone="green"
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Recommend for Let off"
                onClick={() => openActionModal(row.insFileNumber, "lateoff")}
              />
            );
          }
        }
        if (isAlc && isFreshlySubmitted) {
          actions.push(
            <span
              key="alc-awaiting-inspector"
              className="text-[11px] font-medium text-gray-500 italic px-1 py-0.5"
            >
              Awaiting inspector action
            </span>
          );
        }

        // 2. Awaiting Show Cause Verification
        if (isInspector && awaitingVerification) {
          actions.push(
            <RowAction
              key="verify-show-cause"
              tone="purple"
              icon={<ClipboardCheck className="h-3.5 w-3.5" />}
              label="Verify Show Cause"
              onClick={() =>
                navigate(
                  `/inspection-list/verify-show-cause/${row.insFileNumber}`,
                )
              }
            />
          );
        }
        if (isAlc && awaitingVerification) {
          actions.push(
            <span
              key="alc-awaiting-verification"
              className="text-[11px] font-medium text-purple-700 italic px-1 py-0.5"
            >
              Awaiting show cause verification
            </span>
          );
        }

        // 3. Show cause verified — inspector decisions
        if (isInspector && awaitingInspectorDecision) {
          const scCount = row.showCauseCount || 0;
          const hasUncomplied = !!row.hasUncompliedInfringement;
          if (scCount < 2 && hasUncomplied) {
            actions.push(
              <RowAction
                key="show-cause-round2"
                tone="amber"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                label="Show Cause (2nd)"
                onClick={() =>
                  navigate(`/inspection-list/show-cause/${row.insFileNumber}`)
                }
              />
            );
          }
          if (row.hasCompliedInfringement && (scCount < 2 || !hasUncomplied)) {
            actions.push(
              <RowAction
                key="let-off-decision"
                tone="green"
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Recommend for Let off"
                onClick={() => openActionModal(row.insFileNumber, "lateoff")}
              />
            );
          }
          if (scCount >= 2 && hasUncomplied) {
            actions.push(
              <RowAction
                key="recommend-court"
                tone="orange"
                icon={<Scale className="h-3.5 w-3.5" />}
                label="Recommend for Court Case"
                onClick={() => openActionModal(row.insFileNumber, "recommend")}
              />
            );
          }
        }
        if (isAlc && awaitingInspectorDecision) {
          actions.push(
            <span
              key="alc-awaiting-decision"
              className="text-[11px] font-medium text-gray-500 italic px-1 py-0.5"
            >
              Awaiting inspector decision
            </span>
          );
        }

        // 4. Recommended for Let Off — ALC approval pending
        if (isAlc && awaitingAlcLetOff) {
          actions.push(
            <RowAction
              key="alc-approve-let-off"
              tone="green"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Approval for Let off"
              onClick={() => openActionModal(row.insFileNumber, "approve_lateoff")}
            />
          );
          actions.push(
            <RowAction
              key="alc-sent-back-let-off"
              tone="red"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Sent Back to Inspector"
              onClick={() => openActionModal(row.insFileNumber, "sent_back")}
            />
          );
        }
        if (isInspector && awaitingAlcLetOff) {
          actions.push(
            <span
              key="insp-awaiting-let-off"
              className="text-[11px] font-medium text-teal-700 italic px-1 py-0.5"
            >
              Recommended for Let Off — awaiting ALC
            </span>
          );
        }

        // 5. Recommended for Court Case — ALC approval pending
        if (isAlc && awaitingAlcCourtCase) {
          actions.push(
            <RowAction
              key="court-case"
              tone="red"
              icon={<Gavel className="h-3.5 w-3.5" />}
              label="Approval for Court case"
              onClick={() =>
                navigate(`/inspection-list/court-case/${row.insFileNumber}`)
              }
            />
          );
          actions.push(
            <RowAction
              key="alc-sent-back-court-case"
              tone="orange"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Sent Back to Inspector"
              onClick={() => openActionModal(row.insFileNumber, "sent_back")}
            />
          );
        }
        if (isInspector && awaitingAlcCourtCase) {
          actions.push(
            <span
              key="insp-awaiting-court"
              className="text-[11px] font-medium text-orange-700 italic px-1 py-0.5"
            >
              Recommended for Court Case — awaiting ALC
            </span>
          );
        }

        // 6. Sent Back to Inspector by ALC
        if (isInspector && isSentBack) {
          if (row.alcRemark) {
            actions.push(
              <div
                key="alc-sent-back-note"
                className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-800 leading-tight"
                title={row.alcRemark}
              >
                <div className="font-semibold text-rose-900">ALC Remark:</div>
                <div className="line-clamp-2 italic">{row.alcRemark}</div>
              </div>
            );
          }
          if (
            (row.showCauseCount || 0) === 0 ||
            ((row.showCauseCount || 0) < 2 && row.hasUncompliedInfringement)
          ) {
            actions.push(
              <RowAction
                key="show-cause-sent-back"
                tone="amber"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                label={row.showCauseCount === 1 ? "Show Cause (2nd)" : "Show Cause"}
                onClick={() =>
                  navigate(`/inspection-list/show-cause/${row.insFileNumber}`)
                }
              />
            );
          }
          if (
            row.hasCompliedInfringement &&
            ((row.showCauseCount || 0) < 2 || !row.hasUncompliedInfringement)
          ) {
            actions.push(
              <RowAction
                key="let-off-sent-back"
                tone="green"
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Recommend for Let off"
                onClick={() => openActionModal(row.insFileNumber, "lateoff")}
              />
            );
          }
          if ((row.showCauseCount || 0) >= 2 && row.hasUncompliedInfringement) {
            actions.push(
              <RowAction
                key="recommend-court-sent-back"
                tone="orange"
                icon={<Scale className="h-3.5 w-3.5" />}
                label="Recommend for Court Case"
                onClick={() => openActionModal(row.insFileNumber, "recommend")}
              />
            );
          }
        }
        if (isAlc && isSentBack) {
          actions.push(
            <span
              key="alc-sent-back-status"
              className="text-[11px] font-medium text-rose-700 italic px-1 py-0.5"
            >
              Sent back to inspector for action
            </span>
          );
        }

        if (isInspector && row.statusCode === "COURT_CASE" && !row.courtProceedingFiled) {
          actions.push(
            <RowAction
              key="court-proceeding"
              tone="red"
              icon={<Gavel className="h-3.5 w-3.5" />}
              label="Court Case Proceeding"
              onClick={() =>
                navigate(`/inspection-list/court-case-proceeding/${row.insFileNumber}`)
              }
            />
          );
        }

        if (isInspector && (row.showCauseCount || 0) >= 1) {
          const isDownloading = downloadingFile === row.insFileNumber;
          actions.push(
            <RowAction
              key="download-show-cause"
              tone="sky"
              icon={<Download className="h-3.5 w-3.5" />}
              label={isDownloading ? "Downloading..." : "Download Show Cause Notice"}
              disabled={isDownloading}
              onClick={() => handleDownloadShowCause(row.insFileNumber)}
            />
          );
        }

        if (!actions.length) {
          return (
            <span className="text-[11.5px] text-slate-400 italic">
              No action required
            </span>
          );
        }

        return <div className="flex w-full flex-col gap-1.5 py-2">{actions}</div>;
      },
    },
  ];

  useEffect(() => {
    fetchInspections();
  }, []);

  const activeFilterLabel =
    STATUS_FILTERS.find((f) => f.code === statusFilter)?.label ?? "All";

  const search = searchText.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    const matchesStatus =
      statusFilter === "ALL" || row.statusCode === statusFilter;
    const matchesSearch =
      !search ||
      row.insFileNumber?.toLowerCase().includes(search) ||
      row.establishmentName?.toLowerCase().includes(search) ||
      row.ownerName?.toLowerCase().includes(search) ||
      row.randomizationOrderNo?.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="rounded-xl border border-[#d7e0ea] bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#203040]">
            Inspection List
          </h1>
          <p className="mt-1 text-sm text-[#607080]">
            List of all inspections recorded under your account
          </p>
        </div>

        {/* Search + Status Filter */}
        <div className="rounded-xl border border-[#d7e0ea] bg-white px-4 py-3 shadow-sm space-y-3">
          {/* Search box */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#607080] mr-1">Search:</span>
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by file no, establishment, owner, order no..."
                className="w-full rounded-lg border border-[#d7e0ea] px-3 py-2 pr-8 text-sm focus:border-[#3b8dbc] focus:outline-none"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-sm font-medium text-[#607080] mr-1">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#d7e0ea] bg-white px-3 py-2 text-sm focus:border-[#3b8dbc] focus:outline-none"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.label}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs text-[#607080] italic">
              Showing{" "}
              <span className="font-semibold text-[#203040]">
                {filteredRows.length}
              </span>{" "}
              of {rows.length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#d7e0ea] bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={filteredRows}
            progressPending={loading}
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[10, 20, 50]}
            striped
            customStyles={customStyles}
            noDataComponent={
              <div className="py-8 text-center text-sm text-[#607080]">
                {statusFilter === "ALL" && !search
                  ? "No inspections found"
                  : `No inspections found for "${activeFilterLabel}"${
                      search ? ` matching "${searchText}"` : ""
                    }`}
              </div>
            }
          />
        </div>
      </div>

      {/* Remark modal */}
      {actionFileNo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {ACTION_META[actionType].title}
              </h3>
              <button
                onClick={closeActionModal}
                disabled={actionSubmitting}
                className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-gray-500">
                File No: <span className="font-semibold text-gray-800">{actionFileNo}</span>
              </p>
              {ACTION_META[actionType].infoBanner && (
                <p
                  className={`rounded-lg px-3 py-2 text-xs ${
                    actionType === "sent_back"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : actionType === "recommend"
                      ? "bg-orange-50 text-orange-800 border border-orange-200"
                      : actionType === "lateoff" || actionType === "approve_lateoff"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {ACTION_META[actionType].infoBanner}
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Remark{" "}
                  {ACTION_META[actionType].isRemarkRequired ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-gray-400 font-normal lowercase">
                      (optional)
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={actionRemark}
                  onChange={(e) => setActionRemark(e.target.value)}
                  placeholder={ACTION_META[actionType].placeholder}
                  className={`w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none ${
                    actionType === "sent_back" || actionType === "approve_courtcase"
                      ? "focus:border-rose-400"
                      : actionType === "recommend"
                      ? "focus:border-orange-400"
                      : "focus:border-emerald-400"
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={closeActionModal}
                disabled={actionSubmitting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={actionSubmitting}
                className={`rounded-lg px-5 py-2 text-sm font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === "sent_back" || actionType === "approve_courtcase"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : actionType === "recommend"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionSubmitting
                  ? "Submitting..."
                  : ACTION_META[actionType].button}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorInspectionList;
