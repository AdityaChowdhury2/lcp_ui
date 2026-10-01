import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaFilePdf,
  FaMapMarkerAlt,
  FaTrash,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

export interface InfringementItem {
  id: string; // unique ID for React state tracking
  cust_infring_id: number;
  infra_id?: number;
  actName: string;
  infringementText: string;
  inspectionRemark?: string;
  isComplied: boolean;
  remark: string;
  uploadedFilePath?: string;
  isVerified?: boolean;
}

export interface InspectionDetails {
  estName: string;
  randomizationOrderNum: string;
  inspectionDate: string;
  complianceDate: string;
  complianceTime: string;
  personPresentName: string;
  personPresentDesg: string;
  acts: string[];
  uploadedFiles: Record<string, string>;
  /** True when opening show-cause after round-1 verification (must upload new PDFs). */
  isStartingRound2: boolean;
  showCauseCount: number;
  allAlreadyComplied?: boolean;
}

/** Hearing time must fall in office hours, 9:00 AM through 8:00 PM inclusive. */
function isOfficeHearingTime(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return false;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59) return false;
  if (meridiem) {
    if (hours < 1 || hours > 12) return false;
    if (meridiem === "AM") hours = hours === 12 ? 0 : hours;
    else hours = hours === 12 ? 12 : hours + 12;
  } else if (hours > 23) {
    return false;
  }
  const total = hours * 60 + minutes;
  return total >= 9 * 60 && total <= 20 * 60;
}

const ShowCausePage: React.FC = () => {
  const navigate = useNavigate();
  const { fileNo } = useParams();
  const inspectionId = fileNo;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<InspectionDetails | null>(null);

  // Show cause hearing venue, date & time
  const [showCausePlace, setShowCausePlace] = useState("");
  const [showCauseDate, setShowCauseDate] = useState("");
  const [showCauseTime, setShowCauseTime] = useState("");

  // Grouped infringements by act: actName -> InfringementItem[]
  const [actInfringements, setActInfringements] = useState<Record<string, InfringementItem[]>>({});

  // Infringement compliance checkbox state: id -> boolean (checked = Complied (1), unchecked = Show Cause (0))
  const [infringementComplied, setInfringementComplied] = useState<Record<string, boolean>>({});

  // Infringements already complied in previous round (Round 2 lock: inspector cannot show cause against them)
  const [permanentlyCompliedIds, setPermanentlyCompliedIds] = useState<Set<string>>(new Set());

  // Infringement show cause remarks: id -> string
  const [infringementRemarks, setInfringementRemarks] = useState<Record<string, string>>({});

  // Signed files state per Infringement: itemId -> File
  const [signedFiles, setSignedFiles] = useState<Record<string, File>>({});

  const [generatingPdf, setGeneratingPdf] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

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
        let isStartingRound2 = false;
        let showCauseCount = 0;

        if (isCentral) {
          // Central Note Details
          const res = await axios.post(`${API_BASE}inspections/check-already-locked`, {
            randId: Number(inspectionId),
          });
          noteData = res.data?.data?.existingNote;
          rawInfringements = res.data?.data?.existingInfring || [];

          const hasVerification = rawInfringements.some(
            (inf: any) => !!inf.verification_dt,
          );
          isStartingRound2 = hasVerification;
          showCauseCount = isStartingRound2
            ? 1
            : rawInfringements.some(
                  (inf: any) =>
                    !!inf.uploaded_file_path ||
                    inf.sc_cc_status === "Show Cause Notice",
                )
              ? 1
              : 0;
        } else {
          // Normal Note Details
          const res = await axios.get(`${API_BASE}inspections/normal-preview/${inspectionId}`);
          noteData = res.data?.data;
          rawInfringements = noteData?.infringements || [];

          showCauseCount = Number(noteData?.show_cause_count ?? 0);
          const hasVerification = rawInfringements.some(
            (inf: any) => !!inf.verification_dt,
          );
          isStartingRound2 = showCauseCount === 1 && hasVerification;
        }

        const isRound2 = showCauseCount >= 1 || isStartingRound2;
        const allAlreadyComplied =
          isStartingRound2 &&
          rawInfringements.length > 0 &&
          rawInfringements.every((inf: any) => inf.is_complied === 1);
        if (allAlreadyComplied) {
          toast.error(
            "Second show cause cannot be issued when all infringements are complied.",
          );
        }
        const grouped: Record<string, InfringementItem[]> = {};
        const uploadedMap: Record<string, string> = {};
        const initialComplied: Record<string, boolean> = {};
        const initialRemarks: Record<string, string> = {};
        const permComplied = new Set<string>();

        rawInfringements.forEach((inf: any, index: number) => {
          const law = inf.infra_id ? lawMap.get(Number(inf.infra_id)) : null;
          const actName = (
            law?.inspection_name ||
            inf.infring_name ||
            inf.act ||
            "Contract Labour (R & A) Act, 1970 & W.B.  Rules, 1972 thereunder , For Principal Employer"
          ).trim();

          const clauseText = law?.inspection_txt || "";
          const remarkText = inf.ins_remark || "";
          const infringementText =
            clauseText || remarkText || inf.infring_name || "Infringement detected during inspection";

          const id = String(inf.cust_infring_id || `${inf.infra_id || index}-${index}`);
          const isAlreadyComplied = inf.is_complied === 1;
          const isActuallyVerified =
            isAlreadyComplied && (!!inf.verification_dt || !!inf.isVerified);
          // Round 2: lock anything already complied (at first notice or at verification)
          const isPermComp = isRound2 && isAlreadyComplied;

          if (isPermComp) {
            permComplied.add(id);
          }

          const item: InfringementItem = {
            id,
            cust_infring_id: Number(inf.cust_infring_id || 0),
            infra_id: inf.infra_id ? Number(inf.infra_id) : undefined,
            actName,
            infringementText,
            inspectionRemark: remarkText && remarkText !== clauseText ? remarkText : undefined,
            isComplied: isPermComp || (!isRound2 && inf.is_complied === 1),
            remark: inf.show_cause_note || "",
            uploadedFilePath: inf.uploaded_file_path || "",
            isVerified: isActuallyVerified,
          };

          if (!grouped[actName]) {
            grouped[actName] = [];
          }
          grouped[actName].push(item);

          // In round 2, only genuinely verified items start as checked. Uncomplied items are unchecked by default!
          initialComplied[item.id] = isRound2 ? isPermComp : (inf.is_complied === 1);
          initialRemarks[item.id] = (!isStartingRound2 && !isPermComp) ? (inf.show_cause_note || "") : "";

          // Track uploaded file per infringement item
          if (inf.uploaded_file_path) {
            uploadedMap[item.id] = inf.uploaded_file_path;
          }
        });

        setPermanentlyCompliedIds(permComplied);

        // Ensure at least one Act exists
        const actsList = Object.keys(grouped);
        if (actsList.length === 0) {
          const defaultAct = "Contract Labour (R & A) Act, 1970 & W.B.  Rules, 1972 thereunder , For Principal Employer";
          const dummyId = "dummy-1";
          grouped[defaultAct] = [{
            id: dummyId,
            cust_infring_id: 0,
            actName: defaultAct,
            infringementText: "Infringements detected under this Act during inspection",
            isComplied: false,
            remark: "",
          }];
          initialComplied[dummyId] = false;
          initialRemarks[dummyId] = "";
          actsList.push(defaultAct);
        }

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

        setDetails({
          estName,
          randomizationOrderNum,
          inspectionDate,
          complianceDate,
          complianceTime,
          personPresentName,
          personPresentDesg,
          acts: actsList,
          uploadedFiles: uploadedMap,
          isStartingRound2,
          showCauseCount,
          allAlreadyComplied,
        });

        // Prefill show cause place, date, and time if available
        const defaultPlace =
          noteData?.show_cause_place || noteData?.compliance_place || noteData?.ins_verify_place || "";
        const defaultDate = noteData?.show_court_cause_dt
          ? String(noteData.show_court_cause_dt).split("T")[0]
          : "";
        const defaultTime = noteData?.show_cause_tm || "";

        if (defaultPlace) setShowCausePlace(defaultPlace);
        if (defaultDate) setShowCauseDate(defaultDate);
        if (defaultTime && isOfficeHearingTime(defaultTime)) setShowCauseTime(defaultTime);

        setActInfringements(grouped);
        setInfringementComplied(initialComplied);
        setInfringementRemarks(initialRemarks);
      } catch (error) {
        console.error("Failed to load details", error);
        toast.error("Failed to fetch inspection details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [inspectionId]);

  const handleToggleComplied = (itemId: string) => {
    if (permanentlyCompliedIds.has(itemId)) {
      toast.info("This infringement was already complied in the previous round and cannot be show-caused again.");
      return;
    }

    setInfringementComplied((prev) => {
      const isNowComplied = !prev[itemId];
      // If unchecking "Complied" (it is now uncomplied / Show Cause):
      // clear any newly selected file for this item since PDF upload is not necessary if not complied
      if (!isNowComplied) {
        setSignedFiles((fPrev) => {
          const fNext = { ...fPrev };
          delete fNext[itemId];
          return fNext;
        });
      }
      return {
        ...prev,
        [itemId]: isNowComplied,
      };
    });
  };

  const handleRemarkChange = (itemId: string, value: string) => {
    setInfringementRemarks((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleMarkAllInAct = (actName: string, markComplied: boolean) => {
    const items = actInfringements[actName] || [];
    setInfringementComplied((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (permanentlyCompliedIds.has(item.id)) {
          // Never uncheck already complied items
          next[item.id] = true;
        } else {
          next[item.id] = markComplied;
        }
      });
      return next;
    });

    if (!markComplied) {
      setSignedFiles((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          if (!permanentlyCompliedIds.has(item.id)) {
            delete next[item.id];
          }
        });
        return next;
      });
    }
  };

  const handleGeneratePdf = async (actName: string) => {
    if (showCauseTime && !isOfficeHearingTime(showCauseTime)) {
      toast.warn("Hearing time must be within office hours, 9:00 AM to 8:00 PM.");
      return;
    }
    try {
      setGeneratingPdf((prev) => ({ ...prev, [actName]: true }));
      const payload = {
        inspectionId,
        actName,
        showCausePlace: showCausePlace.trim(),
        showCauseDate,
        showCauseTime,
      };

      const response = await axios.post(
        `${API_BASE}inspections/show-cause-pdf`,
        payload,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
      toast.success(`PDF generated for ${actName}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Show Cause PDF");
    } finally {
      setGeneratingPdf((prev) => ({ ...prev, [actName]: false }));
    }
  };

  const handleFileChange = (itemId: string, file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF file only.");
        return;
      }
      if (file.size > 200 * 1024) {
        toast.error("File size must not exceed 200 KB.");
        return;
      }
      setSignedFiles((prev) => ({ ...prev, [itemId]: file }));
    } else {
      setSignedFiles((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  const handleRemoveFile = async (item: InfringementItem) => {
    if (permanentlyCompliedIds.has(item.id)) {
      toast.warn("Cannot remove compliance document for an infringement already complied in the previous round.");
      return;
    }

    if (!window.confirm("Are you sure you want to remove the uploaded compliance document for this infringement?")) {
      return;
    }

    try {
      setRemoving((prev) => ({ ...prev, [item.id]: true }));
      const response = await axios.post(`${API_BASE}inspections/show-cause-remove`, {
        fileNo: inspectionId,
        custInfringId: item.cust_infring_id,
        act: item.actName,
      });

      if (response.data?.success || response.data?.status) {
        toast.success("Document removed successfully.");
        setDetails((prev) => {
          if (!prev) return null;
          const nextUploaded = { ...prev.uploadedFiles };
          delete nextUploaded[item.id];
          return {
            ...prev,
            uploadedFiles: nextUploaded,
          };
        });
        setSignedFiles((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      } else {
        toast.error(response.data?.message || "Failed to remove document");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to remove document");
    } finally {
      setRemoving((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allItems = Object.values(actInfringements).flat();
    if (details?.isStartingRound2) {
      const remaining = allItems.filter((item) => !permanentlyCompliedIds.has(item.id));
      if (remaining.length === 0) {
        toast.error("Second show cause cannot be issued when all infringements are complied.");
        return;
      }
    }
    const compliedItems = allItems.filter(
      (item) => permanentlyCompliedIds.has(item.id) || !!infringementComplied[item.id]
    );
    const uncompliedItems = allItems.filter(
      (item) => !permanentlyCompliedIds.has(item.id) && !infringementComplied[item.id]
    );
    if (!details?.isStartingRound2 && uncompliedItems.length === 0) {
      toast.warn("At least one infringement must receive a show cause notice.");
      return;
    }

    // Validation: If there are uncomplied infringements, show cause place, date, and time must be provided
    if (uncompliedItems.length > 0) {
      if (!showCausePlace.trim()) {
        toast.warn("Please enter Show Cause Place / Venue.");
        return;
      }
      if (!showCauseDate) {
        toast.warn("Please select Show Cause Hearing Date.");
        return;
      }
      if (!showCauseTime) {
        toast.warn("Please select Show Cause Hearing Time.");
        return;
      }
      if (!isOfficeHearingTime(showCauseTime)) {
        toast.warn("Hearing time must be within office hours, 9:00 AM to 8:00 PM.");
        return;
      }
    }

    // Validation: PDF Upload is required for newly complied infringements
    for (let idx = 0; idx < compliedItems.length; idx++) {
      const item = compliedItems[idx];
      if (permanentlyCompliedIds.has(item.id)) {
        // Already complied in round 1 / verification; proof already preserved on record
        continue;
      }
      const hasNewFile = !!signedFiles[item.id];
      const hasExistingFile = !details?.isStartingRound2 && !!details?.uploadedFiles?.[item.id];
      if (!hasNewFile && !hasExistingFile) {
        toast.warn(
          `Please upload compliance PDF for newly complied infringement #${idx + 1} under "${item.actName}".`,
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("fileNo", String(inspectionId));
      formData.append("userId", String(getUserId() ?? ""));
      if (showCausePlace) formData.append("showCausePlace", showCausePlace.trim());
      if (showCauseDate) formData.append("showCauseDate", showCauseDate);
      if (showCauseTime) formData.append("showCauseTime", showCauseTime);

      // Append files for complied infringements that have a new file selected
      compliedItems.forEach((item) => {
        const file = signedFiles[item.id];
        if (file) {
          formData.append("files", file);
          formData.append("custInfringIds", String(item.cust_infring_id || ""));
          formData.append("acts", item.actName);
          formData.append("remarks", infringementRemarks[item.id] || "");
        }
      });

      // Prepare infringement-level compliance and remarks payload
      const infringementPayload = allItems.map((item) => {
        const isPermComp = permanentlyCompliedIds.has(item.id);
        const isComp = isPermComp || !!infringementComplied[item.id];
        return {
          cust_infring_id: item.cust_infring_id,
          infra_id: item.infra_id,
          actName: item.actName,
          isComplied: isComp ? 1 : 0,
          remark: isPermComp ? "" : (infringementRemarks[item.id] || ""),
          existingFilePath: isComp ? (details?.uploadedFiles?.[item.id] || item.uploadedFilePath || null) : null,
        };
      });

      formData.append("infringementData", JSON.stringify(infringementPayload));

      // Append act-level compliance flags for backward compatibility
      details?.acts.forEach((actName) => {
        const items = actInfringements[actName] || [];
        const isAllComplied = items.length > 0 && items.every((item) => permanentlyCompliedIds.has(item.id) || infringementComplied[item.id]);
        formData.append("compliedActs", actName);
        formData.append("complied", isAllComplied ? "1" : "0");
      });

      const res = await axios.post(
        `${API_BASE}inspections/show-cause-submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.success || res.data?.status) {
        toast.success("Show cause & compliance submitted successfully!");
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toast.error(res.data?.message || "Failed to submit show cause documents");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to submit show cause documents"
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

  // Summary counts across all acts
  const allItems = Object.values(actInfringements).flat();
  const totalInfringements = allItems.length;
  const totalComplied = allItems.filter(
    (i) => permanentlyCompliedIds.has(i.id) || !!infringementComplied[i.id]
  ).length;
  const totalShowCause = totalInfringements - totalComplied;
  const isEntireCaseComplied = totalInfringements > 0 && totalShowCause === 0;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 text-gray-800">
      <div className="mx-auto max-w-5xl space-y-6">

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
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Show Cause Notice & Compliance</h1>
              <p className="text-sm text-gray-500">
                Review infringements under each Act. Mark complied items and upload compliance PDF; uncomplied items will receive Show Cause Notice without document upload.
              </p>
              {((details?.showCauseCount ?? 0) >= 1 || details?.isStartingRound2) && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-medium text-amber-800">
                  <FaExclamationTriangle className="text-amber-600 shrink-0" size={14} />
                  <span>
                    <strong>Second Show-Cause Notice:</strong> Any infringement already complied in the previous round is permanently locked as <strong>Complied</strong> and cannot be show-caused again. Only remaining uncomplied infringements can be show-caused.
                  </span>
                </div>
              )}
            </div>
          </div>
          <span className="rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Inspector Panel
          </span>
        </div>

        {/* Inspection Case Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Inspection Case Summary</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Total Infringements:</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                {totalInfringements}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {totalComplied} Complied
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {totalShowCause} Show Cause
              </span>
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
              <p className="mt-1 font-medium text-gray-900">{details?.randomizationOrderNum}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Inspection Date</p>
              <p className="mt-1 font-medium text-gray-900">{details?.inspectionDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Compliance Date & Time</p>
              <p className="mt-1 font-medium text-gray-900">{details?.complianceDate} at {details?.complianceTime}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Person Present</p>
              <p className="mt-1 font-medium text-gray-900">{details?.personPresentName} ({details?.personPresentDesg})</p>
            </div>
          </div>
        </div>

        {/* Show Cause Hearing / Appearance Venue & Schedule */}
        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <FaMapMarkerAlt size={15} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Show Cause Hearing / Appearance Venue &amp; Schedule</h2>
              <p className="text-xs text-gray-500">
                Enter the place, date, and time where the establishment must appear to show cause. This will be reflected in the generated Notice PDF.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Show Cause Place / Venue <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaMapMarkerAlt size={13} />
                </div>
                <input
                  type="text"
                  value={showCausePlace}
                  onChange={(e) => setShowCausePlace(e.target.value)}
                  placeholder="e.g. Office of the ALC / BDO Campus, Uluberia"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
              <p className="text-[11px] text-gray-400">Office campus or hearing chamber address</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Hearing Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaCalendarAlt size={13} />
                </div>
                <input
                  type="date"
                  value={showCauseDate}
                  onChange={(e) => setShowCauseDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all shadow-sm cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-gray-400">Scheduled date to show cause</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Hearing Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaClock size={13} />
                </div>
                <input
                  type="time"
                  min="09:00"
                  max="20:00"
                  value={showCauseTime}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next && !isOfficeHearingTime(next)) {
                      toast.warn("Hearing time must be within office hours, 9:00 AM to 8:00 PM.");
                      return;
                    }
                    setShowCauseTime(next);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all shadow-sm cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-gray-400">Office hours only, 9:00 AM to 8:00 PM</p>
            </div>
          </div>
        </div>

        {/* Infringements & Show Cause per Act */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Registered Acts & Infringements ({details?.acts.length || 0})
            </h2>
            <p className="text-xs text-gray-500">
              Rule: Checked = <span className="font-semibold text-emerald-700">Complied (Upload PDF required)</span> | Unchecked = <span className="font-semibold text-amber-700">Show Cause Notice (No upload required)</span>
            </p>
          </div>

          {details?.acts.map((actName) => {
            const items = actInfringements[actName] || [];
            const uncompliedItems = items.filter(
              (item) => !permanentlyCompliedIds.has(item.id) && !infringementComplied[item.id]
            );
            const isActAllComplied = items.length > 0 && uncompliedItems.length === 0;
            const compliedCount = items.length - uncompliedItems.length;
            const allPermCompliedInAct = items.length > 0 && items.every((i) => permanentlyCompliedIds.has(i.id));

            return (
              <div
                key={actName}
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all"
              >
                {/* Act Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 bg-gray-50/70 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">{actName}</h3>
                      {isActAllComplied ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <FaCheckCircle className="text-emerald-600" size={12} />
                          All Complied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <FaExclamationTriangle className="text-amber-600" size={12} />
                          {uncompliedItems.length} Show Cause
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-medium">
                        ({compliedCount} of {items.length} complied)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Infringements detected under this Act from inspection form.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {allPermCompliedInAct ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded">
                        All Infringements Complied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkAllInAct(actName, !isActAllComplied)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {isActAllComplied ? "Uncheck All" : "Mark All Complied"}
                      </button>
                    )}

                    <span className="text-gray-300">|</span>

                    {isActAllComplied ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        <FaCheckCircle size={12} />
                        Notice Not Required
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleGeneratePdf(actName)}
                        disabled={generatingPdf[actName]}
                        className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 border border-red-200 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
                      >
                        <FaFilePdf size={13} className={generatingPdf[actName] ? "animate-pulse" : ""} />
                        {generatingPdf[actName] ? "Generating PDF..." : "Generate Notice PDF"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Infringements List / Table */}
                <div className="p-4 space-y-3">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-[130px]">Compliance</th>
                          <th className="py-2.5 px-3 min-w-[240px]">Infringement Detected During Inspection</th>
                          <th className="py-2.5 px-3 w-[250px]">Show Cause Remark (Optional)</th>
                          <th className="py-2.5 px-3 w-[270px]">Compliance Document PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {items.map((item, idx) => {
                          const isPermanentlyComplied = permanentlyCompliedIds.has(item.id);
                          const isItemComplied = isPermanentlyComplied || !!infringementComplied[item.id];
                          const hasExistingPdf = !!details?.uploadedFiles?.[item.id] || !!item.uploadedFilePath;
                          const selectedFile = signedFiles[item.id];

                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                isPermanentlyComplied
                                  ? "bg-emerald-50/30"
                                  : isItemComplied
                                  ? "bg-emerald-50/20"
                                  : "bg-white hover:bg-amber-50/20"
                              }`}
                            >
                              {/* Checkbox Column */}
                              <td className="py-3 px-3 align-top">
                                <div className="space-y-1.5">
                                  <label
                                    className={`inline-flex items-center gap-2 select-none ${
                                      isPermanentlyComplied
                                        ? "opacity-80 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isItemComplied}
                                      disabled={isPermanentlyComplied}
                                      onChange={() => handleToggleComplied(item.id)}
                                      title={
                                        isPermanentlyComplied
                                          ? "Already complied in previous round. Cannot be show-caused."
                                          : ""
                                      }
                                      className={`h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 ${
                                        isPermanentlyComplied
                                          ? "cursor-not-allowed opacity-60"
                                          : "cursor-pointer"
                                      }`}
                                    />
                                    <span
                                      className={`text-xs font-semibold ${
                                        isPermanentlyComplied
                                          ? "text-emerald-900 font-bold"
                                          : isItemComplied
                                          ? "text-emerald-700"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      Complied
                                    </span>
                                  </label>
                                  <div>
                                    {isPermanentlyComplied ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
                                        <FaCheckCircle size={9} />
                                        Already Complied
                                      </span>
                                    ) : isItemComplied ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.5 rounded">
                                        <FaCheckCircle size={9} />
                                        Complied
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-200 px-1.5 py-0.5 rounded">
                                        <FaExclamationTriangle size={9} />
                                        Show Cause
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Infringement Text Column */}
                              <td className="py-3 px-3 align-top">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-gray-900 leading-relaxed">
                                    <span className="font-semibold text-gray-500 mr-1.5">#{idx + 1}</span>
                                    {item.infringementText}
                                  </p>
                                  {isPermanentlyComplied && (
                                    <p className="text-[11px] text-emerald-700 font-medium">
                                      ✓ Already complied in previous round. Cannot be show-caused again.
                                    </p>
                                  )}
                                  {item.inspectionRemark && (
                                    <p className="text-[11px] text-blue-800 bg-blue-50/70 border border-blue-100 rounded px-2 py-1 leading-normal">
                                      <span className="font-semibold text-blue-900">Inspection Note: </span>
                                      {item.inspectionRemark}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Show Cause Remark Column */}
                              <td className="py-3 px-3 align-top">
                                {isPermanentlyComplied ? (
                                  <div className="text-[11px] text-emerald-800 italic bg-emerald-50 border border-emerald-200 rounded p-2">
                                    Already complied in previous round — no show cause permitted.
                                  </div>
                                ) : isItemComplied ? (
                                  <div className="text-[11px] text-emerald-700 italic bg-emerald-50/60 border border-emerald-100 rounded p-2">
                                    Marked as complied — no show cause remark needed.
                                  </div>
                                ) : (
                                  <textarea
                                    rows={2}
                                    value={infringementRemarks[item.id] || ""}
                                    onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                                    placeholder="Enter show cause remark for this infringement..."
                                    className="w-full rounded border border-gray-200 bg-white p-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                                  />
                                )}
                              </td>

                              {/* Compliance Document PDF Column */}
                              <td className="py-3 px-3 align-top">
                                {isPermanentlyComplied ? (
                                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 space-y-1.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1.5 font-semibold text-emerald-900 truncate">
                                        <FaCheckCircle size={11} className="text-emerald-600 shrink-0" />
                                        <span className="text-[11px]">Proof on Record</span>
                                      </div>
                                      {item.uploadedFilePath && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const base = API_BASE.endsWith("/api/")
                                              ? API_BASE.slice(0, -5)
                                              : API_BASE.replace(/\/api$/, "");
                                            const cleanPath = item.uploadedFilePath!.startsWith("/")
                                              ? item.uploadedFilePath!.slice(1)
                                              : item.uploadedFilePath!;
                                            window.open(`${base}/${cleanPath}`, "_blank");
                                          }}
                                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer shrink-0"
                                        >
                                          View PDF
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-emerald-700">
                                      Complied in previous round. Proof preserved on record.
                                    </p>
                                  </div>
                                ) : !isItemComplied ? (
                                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50/70 border border-amber-200 rounded-lg p-2.5">
                                    <FaExclamationTriangle size={12} className="text-amber-600 shrink-0" />
                                    <span>Show Cause Notice (No upload required)</span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {/* Existing file on server */}
                                    {hasExistingPdf && !selectedFile && (
                                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 space-y-1.5">
                                        <div className="flex items-center justify-between gap-1">
                                          <div className="flex items-center gap-1.5 font-semibold text-emerald-900 truncate">
                                            <FaCheckCircle size={11} className="text-emerald-600 shrink-0" />
                                            <span className="text-[11px]">Compliance PDF on Server</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const filePath = details?.uploadedFiles?.[item.id];
                                                if (!filePath) return;
                                                const base = API_BASE.endsWith("/api/")
                                                  ? API_BASE.slice(0, -5)
                                                  : API_BASE.replace(/\/api$/, "");
                                                const cleanPath = filePath.startsWith("/")
                                                  ? filePath.slice(1)
                                                  : filePath;
                                                window.open(`${base}/${cleanPath}`, "_blank");
                                              }}
                                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            >
                                              View
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                              type="button"
                                              disabled={removing[item.id]}
                                              onClick={() => handleRemoveFile(item)}
                                              className="flex items-center gap-0.5 text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 cursor-pointer"
                                            >
                                              <FaTrash size={9} />
                                              {removing[item.id] ? "..." : "Remove"}
                                            </button>
                                          </div>
                                        </div>
                                        <label className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer pt-1 border-t border-emerald-200/60 w-full">
                                          <FaCloudUploadAlt size={12} />
                                          <span>Replace: choose new PDF</span>
                                          <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => handleFileChange(item.id, e.target.files?.[0] || null)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    )}

                                    {/* Newly selected file for this complied infringement */}
                                    {selectedFile && (
                                      <div className="flex items-center justify-between text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <FaCheckCircle size={11} className="text-blue-600 shrink-0" />
                                          <span className="font-semibold text-[11px] truncate max-w-[150px]" title={selectedFile.name}>
                                            {selectedFile.name}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleFileChange(item.id, null)}
                                          className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer shrink-0 ml-1"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    )}

                                    {/* No file yet - required for complied infringement */}
                                    {!hasExistingPdf && !selectedFile && (
                                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-lg p-2.5 text-center cursor-pointer transition-all group">
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          onChange={(e) => handleFileChange(item.id, e.target.files?.[0] || null)}
                                          className="hidden"
                                        />
                                        <div className="flex items-center gap-1.5 text-emerald-800 group-hover:text-emerald-900">
                                          <FaCloudUploadAlt size={16} className="text-emerald-500 group-hover:text-emerald-700" />
                                          <span className="text-xs font-semibold">Upload Compliance PDF</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-0.5">Required for complied item (Max 200 KB)</span>
                                      </label>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner when all infringements are marked complied */}
        {details?.allAlreadyComplied ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <FaExclamationTriangle className="text-amber-600 shrink-0" size={18} />
              <span>
                All infringements are complied. A second show cause notice cannot be issued. Recommend for Let off from the inspection list.
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-semibold bg-amber-700 text-white px-3.5 py-2 rounded-lg hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Back to Inspection List
            </button>
          </div>
        ) : isEntireCaseComplied ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-center gap-2.5 shadow-sm">
            <FaExclamationTriangle className="text-amber-600 shrink-0" size={18} />
            <span>
              At least one infringement must receive a show cause notice. Uncheck an item to continue.
            </span>
          </div>
        ) : null}

        {/* Submit Actions */}
        {!details?.allAlreadyComplied && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Ensure compliance PDFs are uploaded for all complied infringements before submitting.
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting || isEntireCaseComplied}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 text-sm font-semibold shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Show Cause & Compliance"}
          </button>
        </div>
        )}

      </div>
    </div>
  );
};

export default ShowCausePage;
