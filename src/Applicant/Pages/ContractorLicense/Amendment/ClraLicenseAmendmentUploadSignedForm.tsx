import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "@/store/store";
import { syncAmendmentReduxFromSession } from "@/store/syncAmendmentReduxFromSession";
import {
  canUploadSignedAmendment,
  fetchContractorLicenseAmendmentApplyDetails,
  parseClraLicenseRenewalAmendmentCtx,
  uploadAmendmentSignedFormApi,
} from "@/store/clraLicenseRenewalSlice";
import {
  mergeAmendmentApplySessionFromPreview,
  navigateToAmendmentApply,
} from "@/utils/amendmentApplyRoute";
import { replaceContractorLicenseAmendmentContext } from "@/store/contractorLicenseAmendmentSlice";
import { downloadAmendmentApplicationForm } from "../downloadRenewalFormVii";
import {
  CLRA_AMENDMENT_DOCUMENT_RULE,
  describeRule,
  toAcceptAttribute,
  validateFile,
} from "@/utils/fileUpload";

const ClraLicenseAmendmentUploadSignedForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const ctx = parseClraLicenseRenewalAmendmentCtx();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [amendmentPdfId, setAmendmentPdfId] = useState<number | null>(null);

  useEffect(() => {
    syncAmendmentReduxFromSession(dispatch);
  }, [dispatch]);

  const formVSerialNo = ctx?.formVSerialNo ?? null;
  const statusCode = (ctx?.statusCode ?? "").trim().toUpperCase();
  const sessionRenewalId = ctx?.renewalApplicationId ?? null;
  const renewalApplicationId = amendmentPdfId ?? sessionRenewalId;

  useEffect(() => {
    if (!formVSerialNo) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await fetchContractorLicenseAmendmentApplyDetails(
          formVSerialNo,
          sessionRenewalId ?? undefined,
        );
        if (cancelled) return;
        mergeAmendmentApplySessionFromPreview(snap);
        const mergedCtx = parseClraLicenseRenewalAmendmentCtx();
        if (mergedCtx) dispatch(replaceContractorLicenseAmendmentContext(mergedCtx));
        const rawId = snap?.license_renewal_amnd_id ?? sessionRenewalId;
        const resolvedId = rawId != null ? Number(rawId) : NaN;
        if (Number.isFinite(resolvedId) && resolvedId > 0) {
          setAmendmentPdfId(Math.trunc(resolvedId));
        }
      } catch {
        if (!cancelled && sessionRenewalId != null) {
          setAmendmentPdfId(Math.trunc(Number(sessionRenewalId)));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, formVSerialNo, sessionRenewalId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVSerialNo) {
      toast.error("Form‑V context missing. Start from application list.");
      return;
    }
    // if (!canUploadSignedAmendment(statusCode)) {
    //   toast.error(
    //     `Signed upload is not available in current status (${statusCode || "—"}).`
    //   );
    //   return;
    // }
    if (!file) {
      toast.error("Please choose signed amendment application PDF.");
      return;
    }
    const validationError = validateFile(file, CLRA_AMENDMENT_DOCUMENT_RULE);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      setSaving(true);
      const res = await uploadAmendmentSignedFormApi({ formVSerialNo, file });
      const raw = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
      if (raw) {
        try {
          const prev = JSON.parse(raw) as Record<string, unknown>;
          sessionStorage.setItem(
            "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
            JSON.stringify({
              ...prev,
              statusCode: "U",
              tagFlag: "A",
            })
          );
          syncAmendmentReduxFromSession(dispatch);
        } catch {
          // ignore session parse errors
        }
      }
      toast.success(res.message);
      navigate("/license-renewal-amendment-list");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans px-2 md:px-6 py-4 max-w-2xl">
      <div className="bg-white rounded border shadow p-6">
        <h1 className="text-xl font-semibold text-[#0B2C48] mb-1">
          Upload signed amendment application
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Form‑V serial: <span className="font-mono">{formVSerialNo ?? "—"}</span>
          {/* | Current status: <span className="font-mono">{statusCode || "—"}</span> ({statusLabel}) */}
        </p>

        <p className="text-xs text-amber-800 mb-4">
          Note: Upload the duly signed amendment application PDF to move the amendment flow
          forward.
        </p>

        <button
          type="button"
          onClick={() =>
            downloadAmendmentApplicationForm(renewalApplicationId, toast.error, formVSerialNo)
          }
          disabled={renewalApplicationId == null}
          className="mb-4 px-4 py-2 rounded bg-sky-600 text-white text-sm disabled:opacity-60"
        >
          Download Application Form
        </button>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Signed amendment application (PDF)
            </label>
            <input
              type="file"
              accept={toAcceptAttribute(CLRA_AMENDMENT_DOCUMENT_RULE)}
              disabled={saving}
              onChange={(e) => {
                const input = e.currentTarget;
                const picked = input.files?.[0] ?? null;
                if (!picked) {
                  setFile(null);
                  return;
                }
                const validationError = validateFile(
                  picked,
                  CLRA_AMENDMENT_DOCUMENT_RULE,
                );
                if (validationError) {
                  toast.error(validationError);
                  setFile(null);
                  input.value = "";
                  return;
                }
                setFile(picked);
              }}
              className="block w-full text-sm border rounded px-3 py-2 bg-white disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-gray-600">
              {describeRule(CLRA_AMENDMENT_DOCUMENT_RULE)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-[#1D5A89] text-white text-sm disabled:opacity-60"
            >
              {saving ? "Uploading..." : "Final Submit"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded border border-gray-300 text-sm"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClraLicenseAmendmentUploadSignedForm;
