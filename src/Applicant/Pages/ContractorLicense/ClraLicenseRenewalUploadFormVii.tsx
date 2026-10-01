import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  canUploadSignedRenewal,
  parseClraLicenseRenewalAmendmentCtx,
  uploadRenewalSignedFormViiApi,
} from "@/store/clraLicenseRenewalSlice";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { downloadRenewalFormVii } from "./downloadRenewalFormVii";

const MAX_UPLOAD_BYTES = 200 * 1024; // 200KB

const ClraLicenseRenewalUploadFormVii: React.FC = () => {
  const navigate = useNavigate();
  const ctx = parseClraLicenseRenewalAmendmentCtx();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const formVSerialNo = ctx?.formVSerialNo ?? null;
  const updatedFormV = ctx?.updatedFormV ?? null;
  const statusCode = (ctx?.statusCode ?? "").trim().toUpperCase();
  const renewalApplicationId = ctx?.renewalApplicationId ?? null;
  const licenseId = ctx?.legacyLicenseId ?? null;
  const serialNo = ctx?.formVSerialNo ?? null;
  const canUploadNow = canUploadSignedRenewal(statusCode);

  const renewalApplyPath = (() => {
    if (!formVSerialNo || !updatedFormV)
      return "/contractor-license/renewal/apply";
    const encryptedFormVSerialNo = encryptionDecryptionFun(
      "encrypt",
      String(formVSerialNo),
    );
    const encryptedUpdatedFormV = encryptionDecryptionFun(
      "encrypt",
      String(updatedFormV),
    );
    return encryptedFormVSerialNo
      ? `/contractor-license/renewal/apply?formVSerialNo=${encodeURIComponent(encryptedFormVSerialNo)}&updatedFormV=${encodeURIComponent(String(encryptedUpdatedFormV))}`
      : "/contractor-license/renewal/apply";
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVSerialNo) {
      toast.error("Form-V context missing. Start from application list.");
      return;
    }
    if (!file) {
      toast.error("Please choose signed FORM-VII PDF.");
      return;
    }
    if (!canUploadNow) {
      toast.error(
        `FORM-VII upload is allowed only in P status. Current status: ${statusCode || "-"}.`,
      );
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF file is allowed.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File size exceeds 200KB.");
      return;
    }
    try {
      setSaving(true);
      const res = await uploadRenewalSignedFormViiApi({ formVSerialNo, file });
      const raw = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
      if (raw) {
        try {
          const prev = JSON.parse(raw) as Record<string, unknown>;
          sessionStorage.setItem(
            "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
            JSON.stringify({
              ...prev,
              statusCode: "I",
              tagFlag: "R",
            }),
          );
        } catch {
          // ignore session parse issues
        }
      }
      toast.success(res.message);

      if (renewalApplicationId != null) {
        const encRenewalId =
          encryptionDecryptionFun("encrypt", String(renewalApplicationId)) ??
          "";
        const encLicenseId =
          encryptionDecryptionFun("encrypt", String(licenseId)) ?? "";
        const encSerialNo =
          encryptionDecryptionFun("encrypt", String(serialNo)) ?? "";
        if (!encRenewalId) {
          toast.error("Unable to open FORM-VI.");
          navigate("/contractor-license/renewal");
        } else {
          navigate(
            `/contractor-license/renewal/form-vi/${encodeURIComponent(encRenewalId)}/${encodeURIComponent(encLicenseId)}/${encodeURIComponent(encSerialNo)}/R`,
          ); //
        }
      } else {
        navigate("/contractor-license/renewal");
      }
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
          Upload signed FORM-VII
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Form-V serial:{" "}
          <span className="font-mono">{formVSerialNo ?? "-"}</span>
        </p>

        <p className="text-xs text-amber-800 mb-4">
          Note: FORM-VII should be duly signed and uploaded for successful
          submission of the renewal application.
        </p>
        <button
          type="button"
          onClick={() =>
            downloadRenewalFormVii(renewalApplicationId, toast.error)
          }
          disabled={renewalApplicationId == null}
          className="mb-4 px-4 py-2 rounded bg-sky-600 text-white text-sm disabled:opacity-60"
        >
          Download generated FORM-VII
        </button>
        {!canUploadNow && (
          <p className="text-xs text-amber-800 mb-3">
            Upload is available only in <span className="font-semibold">P</span>{" "}
            status. Current status:{" "}
            <span className="font-mono">{statusCode || "-"}</span>.
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-800">
              Signed FORM-VII (PDF) <span className="text-red-600">*</span>
            </span>
            <div className="rounded-lg border-2 border-dashed border-[#1D5A89]/55 bg-gradient-to-b from-[#1D5A89]/[0.08] to-white p-4 shadow-sm transition has-[input:focus-visible]:border-[#1D5A89] has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-[#1D5A89]/30 has-[input:focus-visible]:ring-inset">
              <div className="relative inline-flex overflow-hidden rounded-md border-2 border-[#1D5A89] bg-[#1D5A89] shadow-sm transition hover:bg-[#164a6e]">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  aria-label="Browse for signed FORM-VII PDF"
                  className="absolute inset-0 z-10 min-h-[2.75rem] w-full cursor-pointer opacity-0"
                  onChange={(e) => {
                    const picked = e.target.files?.[0] ?? null;
                    if (picked && picked.size > MAX_UPLOAD_BYTES) {
                      toast.error("File size exceeds 200KB.");
                      e.target.value = "";
                      setFile(null);
                      return;
                    }
                    setFile(picked);
                  }}
                />
                <span
                  className="pointer-events-none inline-flex select-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white"
                  aria-hidden
                >
                  <svg
                    className="h-5 w-5 shrink-0 opacity-95"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                  </svg>
                  <span>Browse File</span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-snug text-gray-700">
                {file?.name ? (
                  <>
                    <span className="font-semibold text-emerald-800">
                      Selected for upload:
                    </span>{" "}
                    <span className="break-all font-mono text-gray-900">
                      {file.name}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-600">
                    PDF only, up to 200KB — click{" "}
                    <span className="font-medium">Browse File</span> to choose
                    your signed FORM-VII.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !canUploadNow}
              className="px-4 py-2 rounded bg-[#1D5A89] text-white text-sm disabled:opacity-60"
            >
              {saving ? "Uploading..." : "Upload and Submit"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/license-renewal-amendment-list")}
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

export default ClraLicenseRenewalUploadFormVii;
