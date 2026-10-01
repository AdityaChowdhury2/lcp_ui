import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  canSubmitRenewalApplication,
  fetchClraLicenseRenewalDetails,
  fetchContractorLicenseRenewalPreviewApi,
  submitContractorLicenseRenewalApi,
  parseClraLicenseRenewalAmendmentCtx,
  selectClraEligibility,
  selectClraRenewalDetails,
  type ClraLicenseRenewalRootState,
} from "@/store/clraLicenseRenewalSlice";
import type { AppDispatch } from "@/store/store";
import { syncAmendmentReduxFromSession } from "@/store/syncAmendmentReduxFromSession";
import { encryptionDecryptionFun } from "@/utils/encryption";

function toPublicFileUrl(uri: unknown): string | null {
  const raw = String(uri ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("public://")) {
    const rest = raw.slice("public://".length).replace(/^\/+/, "");
    return `/sites/default/files/${rest}`;
  }
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

const ClraLicenseRenewal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { context } = useSelector((state: ClraLicenseRenewalRootState) =>
    selectClraEligibility(state)
  );
  const details = useSelector((state: ClraLicenseRenewalRootState) =>
    selectClraRenewalDetails(state)
  );
  const [preview, setPreview] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sessionCtx = parseClraLicenseRenewalAmendmentCtx();

  useEffect(() => {
    const ctx = context ?? sessionCtx;
    if (!ctx?.formVSerialNo ) {
      toast.error("Renewal context not found. Please start from the eligibility page.");
      return;
    }
    if (ctx.legacyLicenseId != null) {
      setPreviewLoading(true);
      fetchContractorLicenseRenewalPreviewApi({
        formVSerialNo: ctx.formVSerialNo,
        licenseId: ctx.legacyLicenseId,
        updatedFormV: ctx.updatedFormV ?? 0,
      })
        .then((res) => {
          setPreview(res);
          const raw = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
          if (raw) {
            try {
              const prev = JSON.parse(raw) as Record<string, unknown>;
              sessionStorage.setItem(
                "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
                JSON.stringify({
                  ...prev,
                  renewalApplicationId: res?.renewalApplicationId ?? prev.renewalApplicationId ?? null,
                })
              );
              syncAmendmentReduxFromSession(dispatch);
            } catch {
              // ignore session parse errors
            }
          }
        })
        .catch((err) =>
          toast.error(err instanceof Error ? err.message : "Unable to load renewal preview.")
        )
        .finally(() => setPreviewLoading(false));
    } else {
      // fallback for older context without license id
      dispatch(fetchClraLicenseRenewalDetails({ formVSerialNo: ctx.formVSerialNo }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!details?.contractor_particular_id) return;
    const raw = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
    if (!raw) return;
    try {
      const prev = JSON.parse(raw) as Record<string, unknown>;
      const next = {
        ...prev,
        contractorParticularId: details.contractor_particular_id,
        tagFlag: details.activity_tag_flag ?? prev.tagFlag,
      };
      sessionStorage.setItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX", JSON.stringify(next));
      syncAmendmentReduxFromSession(dispatch);
    } catch {
      /* ignore */
    }
  }, [details, dispatch]);

  const formVSerialNo =
    context?.formVSerialNo ??
    sessionCtx?.formVSerialNo ??
    preview?.formVSerialNo ??
    details?.formvserialno ??
    details?.serial_no_from_v;

  const renewalApplyPath = (() => {
    if (!formVSerialNo) return "/contractor-license/renewal/apply";
    const encryptedFormVSerialNo = encryptionDecryptionFun("encrypt", String(formVSerialNo));
    return encryptedFormVSerialNo
      ? `/contractor-license/renewal/apply?formVSerialNo=${encodeURIComponent(encryptedFormVSerialNo)}`
      : "/contractor-license/renewal/apply";
  })();

  const particularId =
    details?.contractor_particular_id ?? sessionCtx?.contractorParticularId ?? null;

  const tagFlag = ((details?.activity_tag_flag ?? sessionCtx?.tagFlag ?? "L") as string)
    .trim()
    .toUpperCase() || "L";

  const legacyLicenseId =
    context?.legacyLicenseId ?? sessionCtx?.legacyLicenseId ?? details?.legacy_license_id ?? null;
  const paymentApplicationId =
    context?.paymentApplicationId ?? sessionCtx?.paymentApplicationId ?? details?.application_id ?? null;

  const statusCode = (
    sessionCtx?.statusCode ??
    preview?.renewalStatus?.applicationStatus ??
    ""
  )
    .trim()
    .toUpperCase();
  const payActId = sessionCtx?.payActId ?? 1;
  const canSubmitRenewal = canSubmitRenewalApplication(statusCode);
  const renewalApplicationId =
    sessionCtx?.renewalApplicationId ??
    preview?.renewalApplicationId ??
    null;
  const formViiUrl = toPublicFileUrl(preview?.documents?.formVii?.uri);
  const certUrl = toPublicFileUrl(preview?.documents?.renewalCertificate?.uri);

  const handleSubmitRenewal = async () => {
    if (!formVSerialNo) {
      toast.error("Form‑V context missing. Start from eligibility/list page.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await submitContractorLicenseRenewalApi({ formVSerialNo });
      toast.success(res.message || "Renewal application submitted successfully.");

      const raw = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
      if (raw) {
        try {
          const prev = JSON.parse(raw) as Record<string, unknown>;
          sessionStorage.setItem(
            "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
            JSON.stringify({
              ...prev,
              statusCode: res.statusCode,
              renewalApplicationId: res.renewalApplicationId,
            })
          );
          syncAmendmentReduxFromSession(dispatch);
        } catch {
          // ignore session parse errors
        }
      }
      // refresh preview after submit
      if (legacyLicenseId != null) {
        const ref = await fetchContractorLicenseRenewalPreviewApi({
          formVSerialNo,
          licenseId: legacyLicenseId,
        });
        setPreview(ref);
        const raw2 = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
        if (raw2) {
          try {
            const prev2 = JSON.parse(raw2) as Record<string, unknown>;
            sessionStorage.setItem(
              "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
              JSON.stringify({
                ...prev2,
                renewalApplicationId: ref?.renewalApplicationId ?? prev2.renewalApplicationId ?? null,
              })
            );
            syncAmendmentReduxFromSession(dispatch);
          } catch {
            // ignore session parse errors
          }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to submit renewal application.");
    } finally {
      setSubmitting(false);
    }
  };

  const goRemarks = () => {
    if (particularId == null || formVSerialNo == null) {
      toast.error("Remarks need a particular reference. Open this screen from the application list.");
      return;
    }
    navigate(
      `/contractor-license/remarks?formVSerialNo=${encodeURIComponent(
        String(formVSerialNo)
      )}&particularId=${encodeURIComponent(String(particularId))}&flag=${encodeURIComponent(
        tagFlag
      )}`
    );
  };

  const goPay = () => {
    if (paymentApplicationId == null) {
      toast.error("Application reference missing for payment.");
      return;
    }
    const encApp = encryptionDecryptionFun("encrypt", String(paymentApplicationId)) ?? "";
    const encAct = encryptionDecryptionFun("encrypt", String(payActId)) ?? "";
    if (!encApp || !encAct) {
      toast.error("Unable to prepare payment link.");
      return;
    }
    navigate(
      `/epayments-preview?applicationId=${encodeURIComponent(encApp)}&actId=${encodeURIComponent(encAct)}`
    );
  };

  const hasContext = Boolean(context || sessionCtx || details);

  return (
    <div className="w-full min-h-screen font-sans">
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          CLRA Contractor License – Renewal
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/license-renewal-amendment-list")}
            className="px-3 py-1.5 text-xs rounded bg-[#52C7EA] hover:bg-[#2bb8df] text-white"
          >
            Application list
          </button>
          <button
            type="button"
            onClick={() => navigate(renewalApplyPath)}
            className="px-3 py-1.5 text-xs rounded bg-[#1D5A89] hover:bg-[#164a6e] text-white"
          >
            Renewal application steps
          </button>
          <button
            type="button"
            onClick={goRemarks}
            disabled={particularId == null}
            className="px-3 py-1.5 text-xs rounded bg-slate-600 hover:bg-slate-700 text-white disabled:opacity-50"
          >
            View remarks
          </button>
          {statusCode === "A" && paymentApplicationId != null && (
            <button
              type="button"
              onClick={goPay}
              className="px-3 py-1.5 text-xs rounded bg-amber-600 hover:bg-amber-700 text-white"
            >
              Pay now
            </button>
          )}
          {canSubmitRenewal && (
            <button
              type="button"
              onClick={handleSubmitRenewal}
              disabled={submitting || !formVSerialNo}
              className="px-3 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : statusCode === "B" ? "Resubmit renewal application" : "Submit renewal application"}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/renewal/old_renewal")}
            className="px-3 py-1.5 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Back to eligibility
          </button>
        </div>
        {!canSubmitRenewal && (
          <p className="text-xs text-amber-800 mt-2">
            Renewal submit is available only in <span className="font-semibold">I/B</span> status.
            Current status: <span className="font-mono">{statusCode || "—"}</span>.
          </p>
        )}
      </div>

      <div className="bg-white rounded-md shadow border p-6 space-y-4">
        {!hasContext ? (
          <div className="text-red-700 text-sm">
            Renewal context not found. Please start from the eligibility page.
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-800">
              <p>
                <span className="font-semibold">Form‑V / Reference No:</span>{" "}
                <span className="font-mono">{formVSerialNo ?? "-"}</span>
              </p>
              {legacyLicenseId != null && (
                <p>
                  <span className="font-semibold">License application ID:</span>{" "}
                  <span className="font-mono">{legacyLicenseId}</span>
                </p>
              )}
            </div>
            {previewLoading && (
              <div className="text-gray-700 text-sm">Loading renewal preview...</div>
            )}
            {!previewLoading && !preview && !details && (
              <div className="text-gray-700 text-sm">Loading license details...</div>
            )}
            {(preview || details) && (
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-800">
                <div className="space-y-2">
                  <h2 className="font-semibold text-base text-[#0B2C48]">
                    Principal Employer & Establishment
                  </h2>
                  <p>
                    <span className="font-semibold">PE Name:</span>{" "}
                    {preview?.establishment?.principalEmployerName ?? details?.pe_name ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">PE Address:</span>{" "}
                    {preview?.establishment?.principalEmployerAddress ?? details?.pe_address ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">PE Registration No:</span>{" "}
                    {preview?.establishment?.registrationNumber ?? details?.pe_registration_no ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">PE Registration Date:</span>{" "}
                    {(preview?.establishment?.registrationDate ?? details?.pe_registration_date)
                      ? new Date(
                          preview?.establishment?.registrationDate ?? details?.pe_registration_date
                        ).toLocaleDateString("en-GB")
                      : "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Establishment:</span>{" "}
                    {preview?.establishment?.name ?? details?.est_name ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {preview?.establishment?.location ?? details?.loc_e_name ?? "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="font-semibold text-base text-[#0B2C48]">
                    License Details
                  </h2>
                  <p>
                    <span className="font-semibold">License No:</span>{" "}
                    {preview?.license?.licenseNumber ?? details?.contractor_license_no ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">License Date:</span>{" "}
                    {(preview?.license?.licenseDate ?? details?.license_date)
                      ? new Date(preview?.license?.licenseDate ?? details?.license_date).toLocaleDateString("en-GB")
                      : "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Next Renewal Date:</span>{" "}
                    {(preview?.license?.validUpto ?? details?.next_renweal_date)
                      ? new Date(preview?.license?.validUpto ?? details?.next_renweal_date).toLocaleDateString("en-GB")
                      : "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Max No. of Contract Labour:</span>{" "}
                    {preview?.license?.maxLabours ?? details?.contractor_max_no_of_labours_on_any_day ?? "-"}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h2 className="font-semibold text-base text-[#0B2C48]">
                    Contractor & Worksite (Snapshot)
                  </h2>
                  <p>
                    <span className="font-semibold">Contractor Name:</span>{" "}
                    {preview?.contractor?.name ?? details?.name_of_contractor ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Contractor Address:</span>{" "}
                    {preview?.contractor?.address ?? details?.address_of_contractor ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Manager / Agent:</span>{" "}
                    {preview?.contractor?.managerName ?? details?.name_of_manager ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Manager / Agent Address:</span>{" "}
                    {preview?.contractor?.managerAddress ?? details?.address_of_manager ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Nature of Work:</span>{" "}
                    {preview?.contractor?.natureOfWork ?? details?.category_designation ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Worksite Address:</span>{" "}
                    {preview?.contractor?.worksiteAddress ??
                      details?.worksite_address_line ??
                      "-"}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h2 className="font-semibold text-base text-[#0B2C48]">
                    Renewal Documents
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {formViiUrl && (
                      <a
                        href={formViiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white no-underline"
                      >
                        View uploaded FORM‑VII
                      </a>
                    )}
                    {certUrl && (
                      <a
                        href={certUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs rounded bg-emerald-700 hover:bg-emerald-800 text-white no-underline"
                      >
                        View renewal certificate
                      </a>
                    )}
                    {!formViiUrl && !certUrl && (
                      <p className="text-xs text-gray-500">
                        No renewal document is available yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!preview && !details && hasContext && (
              <div className="text-gray-700 text-sm">
                If loading does not finish, go back and re-check eligibility.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClraLicenseRenewal;
