import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "@/store/store";
import { encryptionDecryptionFun } from "@/utils/encryption";
import {
  canPayRenewalFees,
  canSubmitRenewalApplication,
  canUploadSignedRenewal,
  fetchLegacyFormIvDocApi,
  fetchLegacyFormIvUploadStateApi,
  fetchContractorLicenseRenewalPreviewApi,
  submitLegacyFormIvUploadApi,
  submitContractorLicenseRenewalApi,
  uploadRenewalWorkOrderApi,
} from "@/store/clraLicenseRenewalSlice";
import LegacyFormIvUploadPanel from "./LegacyFormIvUploadPanel";
import { downloadRenewalFormVii } from "./downloadRenewalFormVii";
import { fetchContractorLicenseAmendmentFileManagedDocument } from "@/store/contractorLicenseAmendmentSlice";
import ContractorLicenseDetailsView from "./components/ContractorLicenseDetailsView";
import RenewalActionPanel from "./components/RenewalActionPanel";

function toPublicFileUrl(uri: unknown): string | null {
  const raw = String(uri ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("public://"))
    return `/sites/default/files/${raw.slice("public://".length)}`;
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

function readRouteNumber(value: string | null): number | null {
  const plain = Number(value);
  if (Number.isFinite(plain) && plain > 0) return plain;

  const decrypted = encryptionDecryptionFun("decrypt", value ?? "");
  const parsed = Number(decrypted);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const MAX_UPLOAD_BYTES = 200 * 1024; // 200KB

const LicenseRenewalForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingWorkOrder, setUploadingWorkOrder] = useState(false);
  const [workOrderFile, setWorkOrderFile] = useState<File | null>(null);
  const [uploadedWorkOrderId, setUploadedWorkOrderId] = useState<number | null>(
    null,
  );
  const [uploadedWorkOrderUrl, setUploadedWorkOrderUrl] = useState<
    string | null
  >(null);
  const [declaration, setDeclaration] = useState(true);
  const [legacyUploadState, setLegacyUploadState] = useState<any | null>(null);
  const [legacySubmitting, setLegacySubmitting] = useState(false);
  const [legacyWorkOrderFile, setLegacyWorkOrderFile] = useState<File | null>(
    null,
  );
  const [legacyFormVFile, setLegacyFormVFile] = useState<File | null>(null);
  const [legacyResidentialFile, setLegacyResidentialFile] =
    useState<File | null>(null);
  const [legacyOtherFile, setLegacyOtherFile] = useState<File | null>(null);

  const formVSerialNo = readRouteNumber(searchParams.get("formVSerialNo"));
  const licenseId = readRouteNumber(searchParams.get("licenseId"));
  const updatedFormV = readRouteNumber(searchParams.get("updatedFormV"));
  const paymentApplicationId = preview?.paymentApplicationId ?? null;
  const payActId = preview?.payActId ?? 13;
  const statusCode = String(
    preview?.applicationStatus ??
      preview?.renewalStatus?.applicationStatus ??
      "",
  )
    .trim()
    .toUpperCase();

  const canSubmit = canSubmitRenewalApplication(statusCode);
  const canPayFees = canPayRenewalFees(statusCode);
  const canUploadSigned = canUploadSignedRenewal(statusCode);
  const renewalCertificateUrl = toPublicFileUrl(
    preview?.documents?.renewalCertificate?.uri,
  );
  const renewalApplicationId = preview?.renewalApplicationId ?? null;

  // const isFreshRenewal = !renewalApplicationId;

  const effectiveWorkOrderDoc = useMemo(() => {
    if (uploadedWorkOrderId) {
      return {
        fid: uploadedWorkOrderId,
        uri: uploadedWorkOrderUrl,
        filename: workOrderFile?.name || "extended-work-order.pdf",
      };
    }
    // if (isFreshRenewal) {
    //   return null;
    // }
    return preview?.documents?.workOrder ?? null;
  }, [
    uploadedWorkOrderId,
    uploadedWorkOrderUrl,
    workOrderFile,
    preview?.documents?.workOrder,
  ]);
  const hasWorkOrder = Boolean(
    effectiveWorkOrderDoc?.fid || effectiveWorkOrderDoc?.uri,
  );

  useEffect(() => {
    if (!formVSerialNo || !licenseId) return;
    let closed = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await fetchContractorLicenseRenewalPreviewApi({
          formVSerialNo,
          licenseId,
          updatedFormV: updatedFormV ?? 0, // to indicate that we want the latest FORM-V details even if not yet submitted by the user (for better UX in the amendment flow)
        });
        if (closed) return;
        setPreview(res);
      } catch (err) {
        if (!closed) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Unable to load renewal preview.",
          );
        }
      } finally {
        if (!closed) setLoading(false);
      }
    };

    run();
    return () => {
      closed = true;
    };
  }, [formVSerialNo, licenseId]);

  useEffect(() => {
    if (!formVSerialNo) return;
    let closed = false;
    (async () => {
      try {
        const state = await fetchLegacyFormIvUploadStateApi(formVSerialNo);
        if (!closed) setLegacyUploadState(state);
      } catch {
        if (!closed) setLegacyUploadState(null);
      }
    })();
    return () => {
      closed = true;
    };
  }, [formVSerialNo]);

  const handleSubmit = async () => {
    if (!formVSerialNo) {
      toast.error("Renewal context missing. Please open from renewal list.");
      return;
    }
    if (!declaration) {
      toast.error("Please accept the declaration before submitting.");
      return;
    }
    if (!canSubmit) {
      toast.error(
        `Renewal submit is allowed only in I/B status. Current status: ${statusCode || "—"}.`,
      );
      return;
    }
    if (!hasWorkOrder) {
      toast.error("Please upload Extended Work Order before submit.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitContractorLicenseRenewalApi({
        formVSerialNo,
        workOrderFileId: Number(effectiveWorkOrderDoc?.fid ?? 0) || undefined,
      });
      toast.success(
        res.message || "Renewal application submitted successfully.",
      );
      navigate("/license-renewal-amendment-list");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to submit renewal application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLegacyDocOpen = async (docType: "WO" | "FV" | "TL" | "OD") => {
    if (!formVSerialNo || !legacyUploadState?.licenseId) return;
    try {
      const doc = await fetchLegacyFormIvDocApi({
        formVSerialNo,
        licenseId: Number(legacyUploadState.licenseId),
        docType,
      });
      window.open(doc.blobUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to open document.",
      );
    }
  };

  const handleLegacySubmit = async () => {
    if (!formVSerialNo) {
      toast.error("Form-V context missing.");
      return;
    }
    try {
      setLegacySubmitting(true);
      const res = await submitLegacyFormIvUploadApi({
        formVSerialNo,
        workOrder: legacyWorkOrderFile,
        formV: legacyFormVFile,
        residential: legacyResidentialFile,
        other: legacyOtherFile,
      });
      toast.success(res.message || "Document(s) uploaded successfully.");
      const refreshed = await fetchLegacyFormIvUploadStateApi(formVSerialNo);
      setLegacyUploadState(refreshed);
      setLegacyWorkOrderFile(null);
      setLegacyFormVFile(null);
      setLegacyResidentialFile(null);
      setLegacyOtherFile(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to save uploaded documents.",
      );
    } finally {
      setLegacySubmitting(false);
    }
  };

  const handleUploadWorkOrder = async () => {
    if (!formVSerialNo) {
      toast.error("Renewal context missing. Please open from renewal list.");
      return;
    }
    // if (uploadedWorkOrderId || effectiveWorkOrderDoc?.uri) {
    //   toast.info("Work-order is already uploaded for this renewal.");
    //   return;
    // }
    if (!workOrderFile) {
      toast.error("Please choose extended work-order PDF.");
      return;
    }
    // if (!canSubmit) {
    //   toast.error(`Work-order upload is allowed only in I/B status. Current status: ${statusCode || "—"}.`);
    //   return;
    // }
    if (!workOrderFile.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF file is allowed.");
      return;
    }
    if (workOrderFile.size > MAX_UPLOAD_BYTES) {
      toast.error("File size exceeds 200KB.");
      return;
    }
    try {
      setUploadingWorkOrder(true);
      const res = await uploadRenewalWorkOrderApi({
        formVSerialNo,
        file: workOrderFile,
      });
      setUploadedWorkOrderId(res.fileId);
      setUploadedWorkOrderUrl(res.fileUrl);
      // Lock the uploader UI after success
      setWorkOrderFile(null);
      toast.success(res.message || "Extended work-order uploaded.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to upload extended work-order.",
      );
    } finally {
      setUploadingWorkOrder(false);
    }
  };

  const goPay = () => {
    if (paymentApplicationId == null) {
      toast.error("Application reference missing for payment.");
      return;
    }
    const encApp =
      encryptionDecryptionFun("encrypt", String(paymentApplicationId)) ?? "";
    const encAct = encryptionDecryptionFun("encrypt", String(payActId)) ?? "";
    if (!encApp || !encAct) {
      toast.error("Unable to prepare payment link.");
      return;
    }
    navigate(
      `/epayments-preview?applicationId=${encodeURIComponent(encApp)}&actId=${encodeURIComponent(encAct)}`,
    );
  };
  const handleOpenPdfDoc = async (fid: string) => {
    if (!fid) {
      toast.error("No Document uploaded");
      return;
    }
    try {
      const { blobUrl } = await dispatch(
        fetchContractorLicenseAmendmentFileManagedDocument({ fid }),
      ).unwrap();
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Unable to fetch document.",
      );
    }
  };

  const managedDocumentCell = (
    doc: any,
    emptyText = "No Document uploaded",
  ) => {
    const fid: string | number | null = doc?.fid;
    if (!fid) return <span>{emptyText}</span>;
    return (
      <button
        type="button"
        className="text-sky-700 hover:underline"
        onClick={() => {
          void handleOpenPdfDoc(String(fid));
        }}
      >
        {`View ${doc?.filename || "document"}`}
      </button>
    );
  };

  return (
    <div className="min-h-0 w-full bg-gray-100 p-4">
      <div className="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
        <div className="bg-white p-4 mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Application for Renewal of License
          </h1>
        </div>

        {loading && (
          <div className="mb-4 text-sm text-gray-700">
            Loading renewal details...
          </div>
        )}
        {!formVSerialNo || !licenseId ? (
          <div className="mb-4 text-sm text-red-700">
            Renewal context not found. Please open this page from application
            list/eligibility flow.
          </div>
        ) : null}

        <div className="space-y-6">
          <ContractorLicenseDetailsView
            preview={preview}
            formVSerialNo={formVSerialNo}
            workOrderDoc={effectiveWorkOrderDoc}
            showExtendedWorkOrderRow
            onOpenManagedDocument={(fid) => {
              void handleOpenPdfDoc(fid);
            }}
          />

          <LegacyFormIvUploadPanel
            visible={Boolean(legacyUploadState?.canSubmit)}
            saving={legacySubmitting}
            onPickWorkOrder={setLegacyWorkOrderFile}
            onPickFormV={setLegacyFormVFile}
            onPickResidential={setLegacyResidentialFile}
            onPickOther={setLegacyOtherFile}
            onOpenDoc={handleLegacyDocOpen}
            onSubmit={handleLegacySubmit}
          />

          <RenewalActionPanel
            effectiveWorkOrderDoc={effectiveWorkOrderDoc}
            workOrderFile={workOrderFile}
            uploadedWorkOrderId={uploadedWorkOrderId}
            uploadingWorkOrder={uploadingWorkOrder}
            declaration={declaration}
            canSubmit={canSubmit}
            canPayFees={canPayFees}
            paymentApplicationId={paymentApplicationId}
            hasWorkOrder={hasWorkOrder}
            statusCode={statusCode}
            canUploadSigned={canUploadSigned}
            renewalApplicationId={renewalApplicationId}
            renewalCertificateUrl={renewalCertificateUrl}
            submitting={submitting}
            formVSerialNo={formVSerialNo}
            renderManagedDocument={managedDocumentCell}
            onPickWorkOrder={(file) => {
              if (file && file.size > MAX_UPLOAD_BYTES) {
                toast.error("File size exceeds 200KB.");
                setWorkOrderFile(null);
                return;
              }
              setWorkOrderFile(file);
            }}
            onUploadWorkOrder={handleUploadWorkOrder}
            onDeclarationChange={setDeclaration}
            onPay={goPay}
            onDownloadFormVii={() => {
              if (renewalApplicationId)
                downloadRenewalFormVii(renewalApplicationId, toast.error);
            }}
            onUploadSignedFormVii={() =>
              navigate("/contractor-license/renewal/upload-form-vii")
            }
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default LicenseRenewalForm;
