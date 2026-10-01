import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmploymentTabBar from "./EmploymentTabBar";
import { useEmploymentFlow } from "./EmploymentFlowContext";
import {
  fetchUploadedDocumentsStatus,
  uploadLicenseDocument,
  type UploadedDocumentsStatus,
} from "./ismwLicenseApi";

const LABEL = "text-xs font-bold text-gray-700 block mb-1 uppercase tracking-wider";
const req = <span className="text-red-500 font-bold">*</span>;

interface DocRow {
  label: string;
  code: string;
  required: boolean;
  dbField: keyof NonNullable<UploadedDocumentsStatus["data"]>;
}

const DOCUMENTS: DocRow[] = [
  { label: "FORM-VI", code: "F6", required: true, dbField: "formSixFile" },
  { label: "Work Order", code: "WO", required: true, dbField: "workOrderFile" },
  { label: "Trade License", code: "TL", required: true, dbField: "tradeLicenseFile" },
  { label: "Address Proof", code: "AP", required: true, dbField: "addressProofFile" },
  { label: "Other Supporting Document", code: "ODSC", required: false, dbField: "otherDocFile" },
];

const DocumentsSection: FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const flow = useEmploymentFlow();
  const licenceIdEncRaw = params["*"] || "";
  const licenceIdEnc = flow?.licenceIdEnc || decodeURIComponent(licenceIdEncRaw);

  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const loadStatus = async () => {
    try {
      const res = await fetchUploadedDocumentsStatus(licenceIdEnc);
      const data = res.data;
      const statusMap: Record<string, string | null> = {};
      DOCUMENTS.forEach((doc) => {
        statusMap[doc.code] = data ? (data[doc.dbField] as string | null) : null;
      });
      setUploadStatus(statusMap);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load uploaded documents status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [licenceIdEnc]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (code: string, file: File) => {
    // Only PDF, JPG, PNG allowed, max 2MB
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file format. Only PDF, JPG, and PNG are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }

    try {
      setUploading((u) => ({ ...u, [code]: true }));
      const base64 = await fileToBase64(file);
      // This module no longer encrypts ids — licenceIdEnc is the plain licence id.
      const decryptedId = Number(licenceIdEnc || "0");

      if (!decryptedId) {
        toast.error("Invalid license ID.");
        return;
      }

      await uploadLicenseDocument({
        act: "ISMW",
        applicationType: "NEW",
        applicationId: decryptedId,
        documentCode: code,
        filename: file.name,
        filecontent: base64,
      });

      toast.success(`${DOCUMENTS.find((d) => d.code === code)?.label} uploaded successfully.`);
      loadStatus();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(message || `Failed to upload file.`);
    } finally {
      setUploading((u) => ({ ...u, [code]: false }));
    }
  };

  const handleContinue = () => {
    // Validate required documents
    const missing = DOCUMENTS.filter((doc) => doc.required && !uploadStatus[doc.code]);
    if (missing.length > 0) {
      toast.error(
        `Please upload all required documents: ${missing.map((m) => m.label).join(", ")}`
      );
      return;
    }
    if (flow) {
      flow.goToTab("preview");
    } else {
      navigate(`/ismw-license/employment-preview/${encodeURIComponent(licenceIdEnc)}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#ecf0f1] min-h-screen p-8 text-gray-600">
        Loading documents status…
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          ISMW Employment License — Documents Section
        </h1>
      </div>

      {/* Tab bar */}
      <EmploymentTabBar active="documents" licenceIdEnc={licenceIdEnc} />

      <div className="px-4 pt-4">
        <div className="bg-white rounded shadow border mb-6">
          <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase tracking-wide">
            Upload Supporting Documents
          </div>
          
          <div className="p-6">
            {/* Status Checklist Box */}
            <div className="border border-gray-200 rounded bg-gray-50 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCUMENTS.map((doc) => {
                const isUploaded = !!uploadStatus[doc.code];
                return (
                  <div key={doc.code} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isUploaded}
                      readOnly
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-0 cursor-default"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {doc.label}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isUploaded
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isUploaded ? "Uploaded" : "Not Available"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Upload Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {DOCUMENTS.map((doc) => {
                const isUploaded = !!uploadStatus[doc.code];
                const isUploading = !!uploading[doc.code];

                return (
                  <div key={doc.code} className="border border-dashed border-gray-300 rounded p-4 bg-white hover:bg-gray-50 transition">
                    <label className={LABEL}>
                      Upload {doc.label} {doc.required && req}
                    </label>
                    
                    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.code, file);
                        }}
                        disabled={isUploading}
                        className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer disabled:opacity-50"
                      />
                      
                      {isUploading && (
                        <span className="text-xs font-semibold text-blue-600 animate-pulse">
                          Uploading...
                        </span>
                      )}

                      {!isUploading && isUploaded && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-2.5 py-0.5">
                          ✓ File Saved
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Formats: PDF, JPG, PNG (Max size: 2MB)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-end p-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleContinue}
              className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-2.5 rounded text-sm font-semibold tracking-wide shadow-md transition"
            >
              SAVE & CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
