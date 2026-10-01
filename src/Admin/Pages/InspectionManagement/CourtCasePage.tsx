import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaCloudUploadAlt, FaFilePdf, FaTrash, FaUndoAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

interface InspectionDetails {
  estName: string;
  randomizationOrderNum: string;
  inspectionDate: string;
  complianceDate: string;
  complianceTime: string;
  personPresentName: string;
  personPresentDesg: string;
  acts: string[];
  uploadedFiles: Record<string, string>;
  remarks: Record<string, string>;
}

const CourtCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { fileNo } = useParams();
  const inspectionId = fileNo;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<InspectionDetails | null>(null);

  // Court case files state (map of actName -> File)
  const [signedFiles, setSignedFiles] = useState<Record<string, File>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [generatingPdf, setGeneratingPdf] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});

  // Send back to inspector state
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [sendBackRemark, setSendBackRemark] = useState("");
  const [sendingBack, setSendingBack] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const isCentral = !inspectionId.startsWith("WBLC-");

        if (isCentral) {
          // Central Note Details
          const res = await axios.post(`${API_BASE}inspections/check-already-locked`, {
            randId: Number(inspectionId),
          });
          const noteData = res.data.data.existingNote;
          const infringements = res.data.data.existingInfring || [];

          // Map unique acts
          const actsList = Array.from(
            new Set<string>(
              infringements
                .map((inf: any) => inf.infring_name || inf.act)
                .filter(Boolean)
            )
          );

          const uploadedMap: Record<string, string> = {};
          const remarksMap: Record<string, string> = {};
          infringements.forEach((inf: any) => {
            const actName = inf.infring_name || inf.act;
            if (actName && inf.uploaded_file_path && inf.alc_cc_let_st === "Court Case") {
              uploadedMap[actName] = inf.uploaded_file_path;
            }
            if (actName && inf.alc_cc_lf_note) {
              remarksMap[actName] = inf.alc_cc_lf_note;
            }
          });

          setDetails({
            estName: noteData?.est_name || "N/A",
            randomizationOrderNum: noteData?.randomization_details_id ? String(noteData.randomization_details_id) : "N/A",
            inspectionDate: noteData?.created_at ? noteData.created_at.split("T")[0] : "N/A",
            complianceDate: noteData?.compliance_date ? noteData.compliance_date.split("T")[0] : "N/A",
            complianceTime: noteData?.compliance_time || "N/A",
            personPresentName: "N/A",
            personPresentDesg: "N/A",
            acts: actsList.length > 0 ? actsList : ["Contract Labour (R & A) Act, 1970 & W.B.  Rules, 1972 thereunder , For Principal Employer"],
            uploadedFiles: uploadedMap,
            remarks: remarksMap,
          });
          setRemarks(remarksMap);
        } else {
          // Normal Note Details
          const res = await axios.get(`${API_BASE}inspections/normal-preview/${inspectionId}`);
          const data = res.data.data;
          const infringements = data?.infringements || [];

          const lawsRes = await axios.get(`${API_BASE}inspections/law/get-laws`);
          const laws = lawsRes.data.data || [];
          const actMap = new Map<number, string>();
          laws.forEach((l: any) => {
            actMap.set(l.ispection_id, l.inspection_name);
          });

          const actsList = Array.from(
            new Set<string>(
              infringements
                .map((inf: any) => inf.infring_name || inf.act || actMap.get(inf.infra_id))
                .filter(Boolean)
            )
          );

          const uploadedMap: Record<string, string> = {};
          const remarksMap: Record<string, string> = {};
          infringements.forEach((inf: any) => {
            const actName = inf.infring_name || inf.act || actMap.get(inf.infra_id);
            if (actName && inf.uploaded_file_path && inf.alc_cc_let_st === "Court Case") {
              uploadedMap[actName] = inf.uploaded_file_path;
            }
            if (actName && inf.alc_cc_lf_note) {
              remarksMap[actName] = inf.alc_cc_lf_note;
            }
          });

          setDetails({
            estName: data?.estName || "N/A",
            randomizationOrderNum: data?.randomizationOrderNum || "N/A",
            inspectionDate: data?.inspectionDate || "N/A",
            complianceDate: data?.compliance_date || data?.complianceDate || "N/A",
            complianceTime: data?.compliance_time || data?.complianceTime || "N/A",
            personPresentName: data?.personPresent?.name || "N/A",
            personPresentDesg: data?.personPresent?.designation || "N/A",
            acts: actsList.length > 0 ? actsList : ["Contract Labour (R & A) Act, 1970 & W.B.  Rules, 1972 thereunder , For Principal Employer"],
            uploadedFiles: uploadedMap,
            remarks: remarksMap,
          });
          setRemarks(remarksMap);
        }
      } catch (error) {
        console.error("Failed to load details", error);
        toast.error("Failed to fetch inspection details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [inspectionId]);

  const handlePrintNotice = (actName: string) => {
    // Generate notice and open in a new tab
    const url = `${API_BASE}inspections/court-case-pdf?inspectionId=${inspectionId}&actName=${encodeURIComponent(actName)}`;
    window.open(url, "_blank");
    toast.success(`Opening PDF for ${actName}`);
  };

  const handleFileChange = (actName: string, file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please upload a PDF file only.");
        return;
      }
      if (file.size > 200 * 1024) {
        toast.error("File size must not exceed 200 KB.");
        return;
      }
      setSignedFiles((prev) => ({ ...prev, [actName]: file }));
    } else {
      setSignedFiles((prev) => {
        const next = { ...prev };
        delete next[actName];
        return next;
      });
    }
  };

  const handleRemoveFile = async (actName: string) => {
    if (!window.confirm(`Are you sure you want to remove the uploaded Court Case document for "${actName}"?`)) {
      return;
    }

    try {
      setRemoving((prev) => ({ ...prev, [actName]: true }));
      const response = await axios.post(`${API_BASE}inspections/show-cause-remove`, {
        fileNo: inspectionId,
        act: actName,
      });

      if (response.data?.success || response.data?.status) {
        toast.success(`Document for "${actName}" removed successfully.`);
        setDetails((prev) => {
          if (!prev) return null;
          const nextUploaded = { ...prev.uploadedFiles };
          delete nextUploaded[actName];
          return {
            ...prev,
            uploadedFiles: nextUploaded,
          };
        });
      } else {
        toast.error(response.data?.message || "Failed to remove document");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to remove document");
    } finally {
      setRemoving((prev) => ({ ...prev, [actName]: false }));
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasAtLeastOneFile = details?.acts.some((act) => signedFiles[act] || details?.uploadedFiles?.[act]) || false;
    if (!hasAtLeastOneFile) {
      toast.warn("Please upload at least one signed Court Case PDF.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("fileNo", String(inspectionId));
      formData.append("userId", String(getUserId() ?? ""));

      Object.entries(signedFiles).forEach(([actName, file]) => {
        formData.append("files", file);
        formData.append("acts", actName);
        formData.append("remarks", remarks[actName] || "");
      });

      const res = await axios.post(
        `${API_BASE}inspections/court-case-submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.success || res.data?.status) {
        toast.success("Court Case signed documents submitted successfully!");
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toast.error(res.data?.message || "Failed to submit Court Case documents");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to submit Court Case documents"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendBack = async () => {
    if (!sendBackRemark.trim()) {
      toast.warn("Please enter a remark for sending back to the inspector.");
      return;
    }
    try {
      setSendingBack(true);
      await axios.post(`${API_BASE}inspections/inspector-case-action`, {
        fileNo: String(inspectionId),
        action: "sent_back",
        remark: sendBackRemark.trim(),
        userId: Number(getUserId()),
      });
      toast.success("Case sent back to inspector successfully");
      setShowSendBackModal(false);
      navigate(-1);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to send case back");
    } finally {
      setSendingBack(false);
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
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 shadow-sm cursor-pointer transition-all"
            >
              <FaArrowLeft size={14} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Court Case Prosecution</h1>
              <p className="text-sm text-gray-500">
                Print complaint notices and upload signed petitions for the court
                case recommended by the inspector.
              </p>
            </div>
          </div>
          <span className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 uppercase tracking-wider">ALC Panel</span>
        </div>

        {/* Section - 1 named Inspection Case Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Inspection Case Summary</h2>
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

        {/* Section - 1 Print Notice */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Print Court Case Notices</h2>
          <p className="text-sm text-gray-500 mb-4">Generate and download the petition complaint notice files for the registered acts in this case.</p>
          <div className="divide-y divide-gray-100">
            {details?.acts.map((act) => (
              <div key={act} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="max-w-[70%]">
                  <p className="font-semibold text-sm text-gray-800">{act}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Court complaint petition document</p>
                </div>
                <button
                  onClick={() => handlePrintNotice(act)}
                  disabled={generatingPdf[act]}
                  className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  <FaFilePdf size={14} className={generatingPdf[act] ? "animate-pulse" : ""} />
                  {generatingPdf[act] ? "Generating..." : "Print Notice"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section - 2 Upload Signed Notice Documents */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">Upload Signed Notice Documents</h2>
          <p className="text-sm text-gray-500 mb-6">Please upload the physical, signed Court Case complaint petition files corresponding to each act.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details?.acts.map((act) => (
              <div key={act} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <p className="text-sm font-bold text-gray-800 line-clamp-1">{act}</p>
                <div className="relative border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl bg-white p-4 text-center cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(act, e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <FaCloudUploadAlt size={28} className="text-gray-400" />
                    <p className="text-xs font-semibold text-gray-700">Click to upload signed PDF</p>
                    <p className="text-[10px] text-gray-400">PDF formats only (Max 200 KB)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                    Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={remarks[act] || ""}
                    onChange={(e) =>
                      setRemarks((prev) => ({ ...prev, [act]: e.target.value }))
                    }
                    placeholder="Enter remarks for this act (optional)..."
                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                  />
                </div>
                {details?.uploadedFiles?.[act] && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle size={12} />
                        <span className="font-semibold">Signed PDF Uploaded</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!details?.uploadedFiles?.[act]) return;
                            const base = API_BASE.endsWith("/api/") ? API_BASE.slice(0, -5) : API_BASE.replace(/\/api$/, "");
                            const cleanPath = details.uploadedFiles[act].startsWith("/") ? details.uploadedFiles[act].slice(1) : details.uploadedFiles[act];
                            window.open(`${base}${cleanPath}`, "_blank");
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                        >
                          View Existing File
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          disabled={removing[act]}
                          onClick={() => handleRemoveFile(act)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTrash size={10} />
                          {removing[act] ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">To replace the existing file, upload a new one below.</p>
                  </div>
                )}
                {signedFiles[act] && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle size={12} />
                      <span className="font-semibold truncate max-w-[180px]">Uploaded: {signedFiles[act].name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileChange(act, null)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowSendBackModal(true)}
            disabled={submitting || sendingBack}
            className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 px-6 py-3.5 text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
          >
            <FaUndoAlt size={13} />
            Sent Back to Inspector
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || sendingBack}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 text-sm font-semibold shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Approval for Court case (Submit Documents)"}
          </button>
        </div>

      </div>

      {/* Modal - Sent Back to Inspector */}
      {showSendBackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sent Back to Inspector
              </h3>
              <button
                onClick={() => {
                  if (!sendingBack) setShowSendBackModal(false);
                }}
                disabled={sendingBack}
                className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-gray-500">
                File No: <span className="font-semibold text-gray-800">{inspectionId}</span>
              </p>
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800">
                This will return the case to the inspector with your remarks for further action or re-examination.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={sendBackRemark}
                  onChange={(e) => setSendBackRemark(e.target.value)}
                  placeholder="Enter the reason for sending this case back to the inspector..."
                  className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-rose-400 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setShowSendBackModal(false)}
                disabled={sendingBack}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBack}
                disabled={sendingBack}
                className="rounded-lg bg-rose-600 hover:bg-rose-700 px-5 py-2 text-sm font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingBack ? "Sending back..." : "Confirm & Send Back"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtCasePage;
