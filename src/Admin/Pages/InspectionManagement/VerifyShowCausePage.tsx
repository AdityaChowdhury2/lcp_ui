import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaFilePdf,
  FaInfoCircle,
  FaTrash,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

export interface VerifyInfringementItem {
  id: string;
  cust_infring_id: number;
  infra_id?: number;
  actName: string;
  infringementText: string;
  inspectionRemark?: string;
  isComplied: boolean;
  complianceFilePath?: string;
  showCauseNote?: string;
  isVerified?: boolean;
  verifyRemark?: string;
}

export interface VerifyDetails {
  fileNo: string;
  estName: string;
  randomizationOrderNo: string;
  inspectionDate: string;
  complianceDate: string;
  complianceTime: string;
  showCausePlace?: string;
  showCauseDate?: string;
  showCauseTime?: string;
  personPresentName?: string;
  personPresentDesg?: string;
  acts: string[];
  showCauseCount: number;
}

const VerifyShowCausePage: React.FC = () => {
  const navigate = useNavigate();
  const { fileNo } = useParams();
  const inspectionId = fileNo;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<VerifyDetails | null>(null);

  // Grouped infringements by act: actName -> VerifyInfringementItem[]
  const [actInfringements, setActInfringements] = useState<
    Record<string, VerifyInfringementItem[]>
  >({});

  // Per-infringement inputs for uncomplied items
  const [verifyFiles, setVerifyFiles] = useState<Record<string, File>>({});
  const [verifyRemarks, setVerifyRemarks] = useState<Record<string, string>>({});
  const [verifyComplied, setVerifyComplied] = useState<Record<string, boolean>>({});
  const [remarkErrors, setRemarkErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!inspectionId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const isCentral = !inspectionId.startsWith("WBLC-");

        // Fetch laws dictionary for resolving Act names and statutory clauses
        const lawMap = new Map<number, { inspection_name: string; inspection_txt: string }>();
        try {
          const lawsRes = await axios.get(`${API_BASE}inspections/law/get-laws`);
          const lawsList = lawsRes.data?.data || [];
          lawsList.forEach((law: any) => {
            if (law.ispection_id) {
              lawMap.set(Number(law.ispection_id), {
                inspection_name: (law.inspection_name || "").trim(),
                inspection_txt: (law.inspection_txt || "").trim(),
              });
            }
          });
        } catch (lawErr) {
          console.warn("Could not fetch law master list", lawErr);
        }

        let rawInfringements: any[] = [];
        let noteData: any = null;

        if (isCentral) {
          const res = await axios.post(`${API_BASE}inspections/check-already-locked`, {
            randId: Number(inspectionId),
          });
          noteData = res.data?.data?.existingNote;
          rawInfringements = res.data?.data?.existingInfring || [];
        } else {
          const res = await axios.get(`${API_BASE}inspections/normal-preview/${inspectionId}`);
          noteData = res.data?.data;
          rawInfringements = noteData?.infringements || [];
        }

        const showCauseCount = Number(noteData?.show_cause_count ?? 0);

        // Group infringements by Act
        const grouped: Record<string, VerifyInfringementItem[]> = {};
        const initialRemarks: Record<string, string> = {};

        rawInfringements.forEach((inf: any, index: number) => {
          const law = inf.infra_id ? lawMap.get(Number(inf.infra_id)) : undefined;
          const actName = (
            law?.inspection_name ||
            inf.infring_name ||
            inf.act ||
            "Contract Labour (R & A) Act, 1970 & W.B. Rules, 1972 thereunder , For Principal Employer"
          ).trim();

          const clauseText = law?.inspection_txt || "";
          const remarkText = inf.ins_remark || "";
          const infringementText =
            clauseText || remarkText || inf.infring_name || "Infringement detected during inspection";

          const id = String(inf.cust_infring_id || `${inf.infra_id || index}-${index}`);
          const isComp = inf.is_complied === 1;

          const item: VerifyInfringementItem = {
            id,
            cust_infring_id: Number(inf.cust_infring_id || 0),
            infra_id: inf.infra_id ? Number(inf.infra_id) : undefined,
            actName,
            infringementText,
            inspectionRemark: remarkText && remarkText !== clauseText ? remarkText : undefined,
            isComplied: isComp,
            complianceFilePath: isComp ? (inf.uploaded_file_path || "") : "",
            showCauseNote: inf.show_cause_note || "",
            isVerified: !!inf.verification_dt,
            verifyRemark: inf.sc_level_lf_app_note || "",
          };

          if (!grouped[actName]) {
            grouped[actName] = [];
          }
          grouped[actName].push(item);

          if (inf.sc_level_lf_app_note) {
            initialRemarks[item.id] = inf.sc_level_lf_app_note;
          }
        });

        const actsList = Object.keys(grouped);

        const estName = isCentral
          ? noteData?.est_name || "N/A"
          : noteData?.estName || "N/A";
        const randomizationOrderNum = isCentral
          ? noteData?.randomization_details_id ? String(noteData.randomization_details_id) : "N/A"
          : noteData?.randomizationOrderNum || "N/A";
        const inspectionDate = isCentral
          ? noteData?.created_at ? noteData.created_at.split("T")[0] : "N/A"
          : noteData?.inspectionDate || "N/A";
        const complianceDate = isCentral
          ? noteData?.compliance_date ? noteData.compliance_date.split("T")[0] : "N/A"
          : noteData?.compliance_date || noteData?.complianceDate || "N/A";
        const complianceTime = isCentral
          ? noteData?.compliance_time || "N/A"
          : noteData?.compliance_time || noteData?.complianceTime || "N/A";
        const personPresentName = isCentral
          ? "N/A"
          : noteData?.personPresent?.name || "N/A";
        const personPresentDesg = isCentral
          ? "N/A"
          : noteData?.personPresent?.designation || "N/A";

        const showCausePlace = noteData?.show_cause_place || noteData?.compliance_place || noteData?.ins_verify_place || "";
        const showCauseDate = noteData?.show_court_cause_dt
          ? String(noteData.show_court_cause_dt).split("T")[0]
          : "";
        const showCauseTime = noteData?.show_cause_tm || "";

        setDetails({
          fileNo: String(inspectionId),
          estName,
          randomizationOrderNum,
          inspectionDate,
          complianceDate,
          complianceTime,
          showCausePlace,
          showCauseDate,
          showCauseTime,
          personPresentName,
          personPresentDesg,
          acts: actsList,
          showCauseCount,
        });

        setActInfringements(grouped);
        setVerifyRemarks(initialRemarks);
      } catch (error) {
        console.error("Failed to load verify show cause details", error);
        toast.error("Failed to fetch inspection details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [inspectionId]);

  const handleFileChange = (itemId: string, file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF file only.");
        return;
      }
      if (file.size > 200 * 1024) {
        toast.error("File size cannot exceed 200 KB.");
        return;
      }
      setVerifyFiles((prev) => ({ ...prev, [itemId]: file }));
    } else {
      setVerifyFiles((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  const openFile = (path: string) => {
    if (!path) return;
    const base = API_BASE.endsWith("/api/")
      ? API_BASE.slice(0, -5)
      : API_BASE.replace(/\/api$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    window.open(`${base}${cleanPath}`, "_blank");
  };

  const allItems = Object.values(actInfringements).flat();
  const totalInfringements = allItems.length;
  const compliedItems = allItems.filter((i) => i.isComplied);
  const alreadyVerifiedOpen = allItems.filter((i) => !i.isComplied && i.isVerified);
  const uncompliedItems = allItems.filter((i) => !i.isComplied && !i.isVerified);
  const verifiedItems = uncompliedItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details) return;

    if (uncompliedItems.length === 0) {
      toast.info("All infringements are already complied.");
      return;
    }

    // Validation: Verification Remark is MANDATORY for each selected infringement!
    const newErrors: Record<string, string> = {};
    for (const item of verifiedItems) {
      const remark = (verifyRemarks[item.id] || "").trim();
      if (!remark) {
        newErrors[item.id] = "Verification remark is mandatory";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setRemarkErrors(newErrors);
      toast.error(
        "Verification remark is mandatory for all infringements. Please enter remarks.",
      );
      return;
    }
    setRemarkErrors({});

    const missingPdf = verifiedItems.find(
      (item) => verifyComplied[item.id] && !verifyFiles[item.id],
    );
    if (missingPdf) {
      toast.error(
        "Verification PDF is mandatory when an infringement is marked Complied.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("fileNo", String(inspectionId));
      formData.append("userId", String(getUserId() ?? ""));

      verifiedItems.forEach((item) => {
        formData.append("custInfringIds", String(item.cust_infring_id || ""));
        formData.append("acts", item.actName);
        formData.append("remarks", (verifyRemarks[item.id] || "").trim());
        formData.append("complied", verifyComplied[item.id] ? "1" : "0");

        const file = verifyFiles[item.id];
        if (file) {
          formData.append(`file_${item.cust_infring_id}`, file);
          formData.append("files", file);
          formData.append("fileCustIds", String(item.cust_infring_id || ""));
        }
      });

      const res = await axios.post(
        `${API_BASE}inspections/verify-show-cause-submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (res.data?.success || res.data?.status) {
        toast.success("Show cause verified successfully for all infringements!");
        setTimeout(() => {
          navigate("/inspector-inspection-list");
        }, 1500);
      } else {
        toast.error(res.data?.message || "Failed to verify show cause");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to verify show cause",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Fetching inspection details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 text-gray-800">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 shadow-sm cursor-pointer transition-all"
            >
              <FaArrowLeft size={14} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Verify Show Cause
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter a remark for every open infringement. Mark Complied only when a PDF is uploaded.
              </p>
            </div>
          </div>
          <span className="rounded bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 uppercase tracking-wider">
            Inspector Verification Panel
          </span>
        </div>

        {/* Case Summary Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Inspection Case Summary</h2>
              <p className="text-xs text-gray-500">Case profile and scheduled appearance</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                Total: {totalInfringements}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {compliedItems.length} Already Complied
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  {uncompliedItems.length} Pending Verification
              </span>
              {alreadyVerifiedOpen.length > 0 && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                  {alreadyVerifiedOpen.length} Verified — Not Complied
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Inspection ID / File No</p>
              <p className="mt-1 font-medium text-gray-900">{inspectionId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Establishment Name</p>
              <p className="mt-1 font-medium text-gray-900">{details?.estName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Randomization Order No</p>
              <p className="mt-1 font-medium text-gray-900">{details?.randomizationOrderNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Inspection Date</p>
              <p className="mt-1 font-medium text-gray-900">{details?.inspectionDate || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Show Cause Hearing Date & Time</p>
              <p className="mt-1 font-medium text-gray-900">
                {details?.showCauseDate || details?.complianceDate || "N/A"}
                {details?.showCauseTime ? ` at ${details.showCauseTime}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Show Cause Hearing Venue</p>
              <p className="mt-1 font-medium text-gray-900">{details?.showCausePlace || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Infringement-wise Verification Instructions */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3 shadow-sm">
          <FaInfoCircle className="text-blue-600 mt-0.5 shrink-0" size={16} />
          <div className="space-y-1">
            <p className="font-bold text-sm">Show Cause Verification Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
              <li>
                <span className="font-semibold text-emerald-800">Complied Infringements:</span> Displayed with green badge. Marked as complied during inspection or previous show cause; no further action required.
              </li>
              <li>
                <span className="font-semibold text-blue-900">Verification Remark (Mandatory):</span> Enter a remark for every open infringement, including when it is not complied.
              </li>
              <li>
                <span className="font-semibold text-indigo-900">Verification Document:</span> PDF is <strong>mandatory</strong> when marked <strong>Complied</strong>. If there is no evidence, mark <strong>Not Complied</strong> and submit with remarks only.
              </li>
            </ul>
          </div>
        </div>

        {/* Registered Acts & Infringements */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Registered Acts & Infringements ({details?.acts.length || 0})
              </h2>
              <p className="text-xs text-gray-500">
                Remark is required for each open infringement. PDF is required only when marked Complied.
              </p>
            </div>
          </div>

          {details?.acts.map((actName) => {
            const items = actInfringements[actName] || [];
            const actCompliedCount = items.filter((i) => i.isComplied).length;
            const actShowCauseCount = items.length - actCompliedCount;

            return (
              <div
                key={actName}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                {/* Act Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      §
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">{actName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {items.length} {items.length === 1 ? "infringement" : "infringements"}
                    </span>
                    {actCompliedCount > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        {actCompliedCount} Complied
                      </span>
                    )}
                    {actShowCauseCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        {actShowCauseCount} Show Cause
                      </span>
                    )}
                  </div>
                </div>

                {/* Infringements List under this Act */}
                <div className="divide-y divide-gray-100 p-6 space-y-5">
                  {items.map((item, idx) => {
                    const isFileSelected = !!verifyFiles[item.id];

                    if (item.isComplied || item.isVerified) {
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4.5 space-y-3 ${
                            item.isComplied
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-rose-200 bg-rose-50/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                                  item.isComplied
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}>
                                  #{idx + 1}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  item.isComplied
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}>
                                  <FaCheckCircle size={11} /> {item.isComplied ? "Complied" : "Verified — Not Complied"}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-gray-800 leading-relaxed pt-1">
                                {item.infringementText}
                              </p>
                              {item.inspectionRemark && (
                                <p className="text-[11px] text-gray-500 italic">
                                  Remark: {item.inspectionRemark}
                                </p>
                              )}
                            </div>

                            {item.complianceFilePath ? (
                              <button
                                type="button"
                                onClick={() => openFile(item.complianceFilePath!)}
                                className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer shadow-sm"
                              >
                                <FaFilePdf size={12} className="text-red-500" />
                                View Compliance PDF
                              </button>
                            ) : null}
                          </div>
                          {item.verifyRemark && (
                            <p className="text-[11px] text-gray-600">
                              Verification remark: {item.verifyRemark}
                            </p>
                          )}
                          <p className={`text-[11px] font-medium ${item.isComplied ? "text-emerald-700" : "text-rose-700"}`}>
                            {item.isComplied
                              ? "Marked as complied. No further verification required."
                              : "Verified without compliance evidence. Remarks recorded."}
                          </p>
                        </div>
                      );
                    }

                    const remarkError = remarkErrors[item.id];

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-blue-400 bg-blue-50/20 shadow-sm p-4.5 space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1 max-w-2xl">
                            <div className="flex items-center gap-3">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-700">
                                #{idx + 1}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                <FaExclamationTriangle size={10} /> Show Cause Notice Issued
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-900 leading-relaxed pt-1">
                              {item.infringementText}
                            </p>
                            {item.inspectionRemark && (
                              <p className="text-[11px] text-gray-500 italic">
                                Inspection remark: {item.inspectionRemark}
                              </p>
                            )}
                            {item.showCauseNote && (
                              <p className="text-[11px] text-amber-800 bg-amber-50 rounded px-2 py-1 inline-block mt-1">
                                <strong>Show cause note:</strong> {item.showCauseNote}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-gray-400 block">
                              Infringement ID: {item.cust_infring_id}
                            </span>
                          </div>
                        </div>

                        {/* Verification input section for this specific infringement */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div className="md:col-span-2">
                              <p className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                Compliance after hearing
                              </p>
                              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`complied-${item.id}`}
                                    checked={!verifyComplied[item.id]}
                                    onChange={() =>
                                      setVerifyComplied((prev) => ({
                                        ...prev,
                                        [item.id]: false,
                                      }))
                                    }
                                  />
                                  Not Complied
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`complied-${item.id}`}
                                    checked={!!verifyComplied[item.id]}
                                    onChange={() =>
                                      setVerifyComplied((prev) => ({
                                        ...prev,
                                        [item.id]: true,
                                      }))
                                    }
                                  />
                                  Complied
                                </label>
                              </div>
                            </div>
                            {/* Verification Remark (MANDATORY) */}
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                Verification Remark <span className="text-red-500">* (Mandatory)</span>
                              </label>
                              <textarea
                                rows={3}
                                value={verifyRemarks[item.id] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVerifyRemarks((prev) => ({
                                    ...prev,
                                    [item.id]: val,
                                  }));
                                  if (val.trim()) {
                                    setRemarkErrors((prev) => {
                                      const next = { ...prev };
                                      delete next[item.id];
                                      return next;
                                    });
                                  }
                                }}
                                placeholder="Enter mandatory verification remark (e.g. verified compliance registers produced by employer)..."
                                className={`w-full rounded-lg border p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none transition-all shadow-sm ${
                                  remarkError
                                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-500"
                                    : "border-gray-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                }`}
                              />
                              {remarkError ? (
                                <p className="text-[11px] text-red-600 font-semibold mt-1">
                                  {remarkError}
                                </p>
                              ) : (
                                <p className="text-[11px] text-gray-400 mt-1">
                                  Remark is mandatory to record compliance verification.
                                </p>
                              )}
                            </div>

                            {/* File Upload Box (OPTIONAL) */}
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                Verification Document (PDF){" "}
                                {verifyComplied[item.id] ? (
                                  <span className="text-red-500">* (Mandatory)</span>
                                ) : (
                                  <span className="text-gray-400 font-normal text-[10px] lowercase tracking-normal">
                                    (Optional)
                                  </span>
                                )}
                              </label>

                              {verifyFiles[item.id] ? (
                                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs">
                                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                                    <FaFilePdf className="text-red-500 shrink-0" size={16} />
                                    <div className="truncate">
                                      <p className="font-semibold text-blue-900 truncate">
                                        {verifyFiles[item.id].name}
                                      </p>
                                      <p className="text-[10px] text-blue-600">
                                        {(verifyFiles[item.id].size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleFileChange(item.id, null)}
                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                  >
                                    <FaTrash size={11} /> Clear
                                  </button>
                                </div>
                              ) : (
                                <div className="relative rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/20 p-3.5 text-center cursor-pointer transition-all">
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) =>
                                      handleFileChange(item.id, e.target.files?.[0] || null)
                                    }
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center justify-center space-y-1">
                                    <FaCloudUploadAlt size={22} className="text-gray-400" />
                                    <p className="text-xs font-semibold text-gray-700">
                                      Upload verification report / evidence
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      PDF only (Max 200 KB)
                                      {verifyComplied[item.id] ? " • Mandatory" : " • Optional"}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <p className="text-[11px] text-gray-400 mt-1">
                                {verifyComplied[item.id]
                                  ? "PDF is mandatory when marked Complied."
                                  : "PDF is optional when marked Not Complied. Remarks are enough."}
                              </p>
                            </div>
                          </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Submission Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Submit Show Cause Verification
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {uncompliedItems.length > 0 ? (
                <span className="text-blue-700 font-semibold">
                  {uncompliedItems.length} infringement(s) will be verified.
                </span>
              ) : (
                <span className="text-emerald-700">
                  All infringements are already complied or verified.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uncompliedItems.length === 0}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Verifying..."
                : `Verify Show Cause (${uncompliedItems.length})`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyShowCausePage;
