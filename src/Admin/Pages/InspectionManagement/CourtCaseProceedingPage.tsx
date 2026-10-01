import { API_BASE } from "@/constants/constants";
import { getUserId } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaCloudUploadAlt, FaFilePdf } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

interface ProceedingDetails {
  fileNo: string;
  estName: string;
  inspectionDate: string;
  alcRemark: string;
  remark: string;
  fileName: string;
  fileUrl: string;
}

const CourtCaseProceedingPage: React.FC = () => {
  const navigate = useNavigate();
  const { fileNo } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<ProceedingDetails | null>(null);
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!fileNo) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}inspections/court-case-proceeding`, {
          params: { fileNo },
        });
        const data = res.data?.data as ProceedingDetails;
        setDetails(data);
        setRemark(data?.remark || "");
      } catch (error: any) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Failed to load the approved court case");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fileNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) {
      toast.warn("Please enter remarks for the court case proceeding.");
      return;
    }
    if (!file && !details?.fileUrl) {
      toast.warn("Please upload the court case proceeding PDF.");
      return;
    }
    if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.warn("Please upload a PDF file only.");
      return;
    }
    if (file && file.size > 200 * 1024) {
      toast.warn("File size must not exceed 200 KB.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("fileNo", String(fileNo));
      formData.append("remark", remark.trim());
      formData.append("userId", String(getUserId() ?? ""));
      if (file) formData.append("file", file);

      const res = await axios.post(`${API_BASE}inspections/court-case-proceeding`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success || res.data?.status) {
        toast.success("Court case proceeding submitted");
        setTimeout(() => navigate("/inspector-inspection-list"), 800);
      } else {
        toast.error(res.data?.message || "Failed to submit the proceeding");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to submit the proceeding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6]">
        <p className="text-gray-600 font-medium">Loading approved court case...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 text-gray-800">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Court Case Proceeding</h1>
            <p className="text-sm text-gray-500">
              The ALC has approved this court case. Upload the proceeding PDF and enter your remarks.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">File No</p>
              <p className="mt-1 font-medium text-gray-900">{details?.fileNo || fileNo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Establishment</p>
              <p className="mt-1 font-medium text-gray-900">{details?.estName || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Inspection Date</p>
              <p className="mt-1 font-medium text-gray-900">{details?.inspectionDate || "—"}</p>
            </div>
            {details?.alcRemark && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase text-gray-400">ALC approval remark</p>
                <p className="mt-1 text-sm text-gray-800">{details.alcRemark}</p>
              </div>
            )}
          </div>
        </div>

        {details?.fileUrl ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-sm">
            This court case proceeding has already been submitted. Open the inspection and use the Court Case Procedure tab to view the PDF.
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Proceeding PDF <span className="text-red-500">*</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400">
              <FaCloudUploadAlt className="text-blue-600" />
              <span>{file ? file.name : "Choose a PDF (max 200 KB)"}</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={5}
              placeholder="Enter remarks for the court case proceeding..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Proceeding"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export const CourtCaseProcedurePanel: React.FC<{
  remark?: string;
  fileName?: string;
  fileUrl?: string;
}> = ({ remark, fileName, fileUrl }) => {
  const openPdf = () => {
    if (!fileUrl) return;
    const base = API_BASE.endsWith("/api/")
      ? API_BASE.slice(0, -5)
      : API_BASE.replace(/\/api$/, "");
    const cleanPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    window.open(`${base}${cleanPath}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Court Case Procedure</h2>
      <div>
        <p className="text-xs font-semibold uppercase text-gray-400">Remarks</p>
        <p className="mt-1 text-sm text-gray-800">{remark || "—"}</p>
      </div>
      {fileUrl ? (
        <button
          type="button"
          onClick={openPdf}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
        >
          <FaFilePdf />
          {fileName || "View proceeding PDF"}
        </button>
      ) : (
        <p className="text-sm text-gray-500">No proceeding PDF has been uploaded.</p>
      )}
    </div>
  );
};

export default CourtCaseProceedingPage;
