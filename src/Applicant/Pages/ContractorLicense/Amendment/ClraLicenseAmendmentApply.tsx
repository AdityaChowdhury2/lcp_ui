import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  AmendmentApplyLegacyView,
  formatLegacyBannerDate,
  isAmendmentApplyFetchEnabled,
  mapPreviewToAmendmentApplyView,
} from "./amendment-apply";
import { parseAmendmentRouteParams } from "@/utils/contractorLicenseRouteLinks";
import { normalizeRenewalPreviewForApply } from "./amendment-apply/normalizeRenewalPreviewForApply";
import {
  mergeAmendmentApplySessionFromPreview,
  persistAmendmentApplyContext,
} from "@/utils/amendmentApplyRoute";
import {
  canSubmitAmendmentInPhaseOne,
  canUploadSignedAmendment,
  fetchContractorLicenseRenewalPreviewApi,
  fetchContractorLicenseAmendmentDetailsNewApi,
  getAmendmentSectionCompletionApi,
  getAmendmentFieldSelectionApi,
  mapContractorLicenseStatusCodeToLabel,
  parseClraLicenseRenewalAmendmentCtx,
  submitContractorLicenseAmendmentApplyApi,
  type AmendmentFieldSelectionPayload,
} from "@/store/clraLicenseRenewalSlice";
import {
  replaceContractorLicenseAmendmentContext,
  selectContractorLicenseAmendmentContext,
} from "@/store/contractorLicenseAmendmentSlice";
import type { AppDispatch, RootState } from "@/store/store";

type Sel = Omit<AmendmentFieldSelectionPayload, "formVSerialNo">;

/** Layout QA when `VITE_CLRA_AMENDMENT_APPLY_FETCH=false`: all groups “selected”. */
const MOCK_SEL_ALL: Sel = {
  worksiteAddress: true,
  contrctorDetails: true,
  managerDetails: true,
  maxLabour: true,
  category: true,
  rateWages: true,
  workWages: true,
  leaveDetails: true,
  specialBenifites: true,
  stateInsurance: true,
  miscellaneous: true,
  convicted: true,
  pastFive: true,
  revoking: true,
};

function EditLink({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-[#337ab7] hover:underline">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      <span className="text-sm font-semibold">Edit</span>
    </Link>
  );
}

function AmendmentApplyPdfUpload({
  label,
  ariaLabel,
  disabled,
  file,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  disabled: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-800">{label}</span>
      <div className="rounded-md border border-dashed border-[#1D5A89]/55 bg-[#f8fbfd] p-3 shadow-sm transition has-[input:focus-visible]:border-[#1D5A89] has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-[#1D5A89]/25 has-[input:focus-visible]:ring-inset">
        <div
          className={`relative inline-flex overflow-hidden rounded-md border-2 border-[#1D5A89] bg-[#1D5A89] shadow-sm transition ${!disabled ? "hover:bg-[#164a6e]" : "opacity-60"}`}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            aria-label={ariaLabel}
            className="absolute inset-0 z-10 min-h-9 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            disabled={disabled}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <span
            className="pointer-events-none inline-flex select-none items-center gap-2 px-3 py-2 text-xs font-semibold text-white"
            aria-hidden
          >
            <svg className="h-4 w-4 shrink-0 opacity-95" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
            </svg>
            <span>Browse File</span>
          </span>
        </div>
        <p className="mt-2 text-xs leading-snug text-gray-700">
          {file?.name ? (
            <>
              <span className="font-semibold text-emerald-800">Selected for upload:</span>{" "}
              <span className="break-all font-mono text-gray-900">{file.name}</span>
            </>
          ) : (
            <span className="text-gray-600">
              PDF only - click <span className="font-medium">Browse File</span> to choose the document.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

const ClraLicenseAmendmentApply: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const queryParams = useMemo(() => parseAmendmentRouteParams(searchParams), [searchParams]);
  const flowCtx = useSelector((state: RootState) => selectContractorLicenseAmendmentContext(state));
  const fetchEnabled = isAmendmentApplyFetchEnabled();
  const [formVSerialNo, setFormVSerialNo] = useState<number | null>(null);
  const [sel, setSel] = useState<Sel>(MOCK_SEL_ALL);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [missingSectionLabels, setMissingSectionLabels] = useState<string[]>([]);
  const [sectionCompletionVerified, setSectionCompletionVerified] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [workOrderFile, setWorkOrderFile] = useState<File | null>(null);
  const [formVFile, setFormVFile] = useState<File | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [otherDocFile, setOtherDocFile] = useState<File | null>(null);
  const [peMaxLabour, setPeMaxLabour] = useState(0);
  const [draftMaxLabour, setDraftMaxLabour] = useState(0);

  const statusCode = useMemo(() => {
    if (preview != null && Object.prototype.hasOwnProperty.call(preview, "ammendment_status")) {
      return String(preview.ammendment_status ?? "").trim().toUpperCase();
    }
    const fromCtx = String(flowCtx?.statusCode ?? "").trim().toUpperCase();
    const fromTag = String(preview?.activity_tag_application_status ?? "").trim().toUpperCase();
    const tagFlag = String(preview?.activity_tag_flag ?? flowCtx?.tagFlag ?? "").trim().toUpperCase();
    if (saved && tagFlag === "R" && fromTag === "A") return "";
    return fromTag || fromCtx;
  }, [preview, flowCtx?.statusCode, flowCtx?.tagFlag, saved]);

  useEffect(() => {
    if (!queryParams) {
      toast.error("Invalid amendment application link.");
      setLoading(false);
      return;
    }

    const sessionCtx = parseClraLicenseRenewalAmendmentCtx();
    if (sessionCtx) dispatch(replaceContractorLicenseAmendmentContext(sessionCtx));

    const formVNo = sessionCtx?.formVSerialNo;
    const updatedFormVNo = sessionCtx?.updatedFormV;
    const amendId = sessionCtx?.amendmentDraftId;

    setFormVSerialNo(queryParams.formVSerialNo);

    if (!fetchEnabled) {
      setSaved(true);
      setSel(MOCK_SEL_ALL);
      setPreview(null);
      setMissingSectionLabels([]);
      setSectionCompletionVerified(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setSectionCompletionVerified(false);
    (async () => {
      try {
        const [fieldData, snap] = await Promise.all([
          getAmendmentFieldSelectionApi(formVNo!),

          fetchContractorLicenseAmendmentDetailsNewApi({
            formVNo: String(formVNo!),
            updatedFormVNo: String(updatedFormVNo!),
            amendId: String(amendId),
          }).then((res) => {
            const payload =
              res && typeof res === "object" && (res as { data?: unknown }).data &&
              typeof (res as { data?: unknown }).data === "object"
                ? ((res as { data: Record<string, any> }).data)
                : (res as Record<string, any>);
            const pe = Number(
              payload?.contractorInfoData?.contractor_max_no_of_labours_on_any_day ?? 0,
            );
            const draftL = Number(payload?.amendmentDraft?.max_of_contract_labour ?? 0);
            if (!cancelled) {
              setPeMaxLabour(Number.isFinite(pe) ? pe : 0);
              setDraftMaxLabour(Number.isFinite(draftL) ? draftL : 0);
            }
            return normalizeRenewalPreviewForApply(res as Record<string, unknown>);
          }),
        ]);
        if (!cancelled) {
          setSaved(fieldData.saved);
          setSel(fieldData.selection);
          setPreview(snap);
          if (snap) {
            mergeAmendmentApplySessionFromPreview(snap);
            const amendIdRaw = snap.license_renewal_amnd_id ?? snap.paymentApplicationId;
            const amendId =
              amendIdRaw != null && Number.isFinite(Number(amendIdRaw)) && Number(amendIdRaw) > 0
                ? Math.trunc(Number(amendIdRaw))
                : null;
            const tagStatusRaw = snap.activity_tag_application_status;
            const tagStatus =
              tagStatusRaw == null || String(tagStatusRaw).trim() === ""
                ? null
                : String(tagStatusRaw).trim().toUpperCase();
            const ctx = persistAmendmentApplyContext({
              formVSerialNo: queryParams.formVSerialNo,
              legacyLicenseId: queryParams.licenseId,
              updatedFormV: queryParams.updatedFormV,
              renewalApplicationId: amendId,
              tagFlag: String(snap.activity_tag_flag ?? "A").trim() || "A",
              statusCode: tagStatus,
              contractorParticularId:
                snap.contractor_particular_id != null
                  ? Number(snap.contractor_particular_id)
                  : null,
            });
            dispatch(replaceContractorLicenseAmendmentContext(ctx));
          }
        }
        try {
          const completion = await getAmendmentSectionCompletionApi(queryParams.formVSerialNo);
          if (!cancelled) {
            setMissingSectionLabels(completion.missingLabels);
            setSectionCompletionVerified(true);
          }
        } catch (e) {
          if (!cancelled) {
            toast.error(
              e instanceof Error ? e.message : "Unable to verify amendment section completion.",
            );
            setSectionCompletionVerified(false);
          }
        }
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Unable to load selection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, fetchEnabled, queryParams]);

  const view = useMemo(
    () =>
      mapPreviewToAmendmentApplyView(preview, {
        previousEstablishments:
          formVSerialNo != null ? (
            <Link
              to={`/license-more-details?formVSerialNo=${encodeURIComponent(String(formVSerialNo))}`}
              className="text-[#337ab7] underline"
            >
              View Details
            </Link>
          ) : (
            "View Details"
          ),
      }),
    [preview, formVSerialNo]
  );

  const licenseLine = useMemo(() => {
    const p = preview;
    if (!p) return "—";
    const backlog = str(p.backlog_license_no);
    const refNo = str(p.contractor_license_no);
    if (backlog && backlog !== "—" && refNo && refNo !== "—") {
      return `${backlog}\nRef No.${refNo}`;
    }
    if (backlog && backlog !== "—") return backlog;
    return refNo || "—";
  }, [preview]);
  const sectionQueryString = useMemo(() => {
    const q = new URLSearchParams();
    if (formVSerialNo != null) q.set("formVSerialNo", String(formVSerialNo));
    const ridRaw = preview?.license_renewal_amnd_id ?? flowCtx?.renewalApplicationId;
    const rid = ridRaw != null ? Number(ridRaw) : NaN;
    if (Number.isFinite(rid) && rid > 0) q.set("renewalApplicationId", String(Math.trunc(rid)));
    const s = q.toString();
    return s ? `?${s}` : "";
  }, [formVSerialNo, preview, flowCtx?.renewalApplicationId]);
  const sectionPath = (path: string) => `/contractor-license/amendment/apply/${path}${sectionQueryString}`;
  const particularInfoPath = useMemo(() => {
    if (formVSerialNo == null) return null;
    const ridRaw = preview?.license_renewal_amnd_id ?? flowCtx?.renewalApplicationId;
    const rid = ridRaw != null ? Number(ridRaw) : NaN;
    if (!Number.isFinite(rid) || rid <= 0) return null;
    const flagRaw = String(preview?.activity_tag_flag ?? flowCtx?.tagFlag ?? "A").trim();
    const flag = flagRaw || "A";
    return `/contractor-license/amendment/particular-info/${encodeURIComponent(String(formVSerialNo))}/${encodeURIComponent(
      String(Math.trunc(rid)),
    )}/${encodeURIComponent(flag)}`;
  }, [formVSerialNo, preview, flowCtx?.renewalApplicationId, flowCtx?.tagFlag]);

  if (loading) {
    return (
      <div className="w-full p-8 text-sm text-gray-600">Loading amendment application…</div>
    );
  }

  if (formVSerialNo == null) {
    return (
      <div className="w-full p-6">
        <p className="mb-4 text-sm text-red-700">Missing Form‑V context.</p>
        <button type="button" className="rounded bg-gray-200 px-4 py-2" onClick={() => navigate("/renewal/old_renewal")}>
          Back to eligibility
        </button>
      </div>
    );
  }

  const formVRef = `00${formVSerialNo}`;
  const edit2 = sel.contrctorDetails ? <EditLink to={sectionPath("contractor")} /> : null;
  const edit3 =
    sel.worksiteAddress || sel.maxLabour ? (
      <span className="flex flex-wrap justify-end gap-3">
        <EditLink to={sectionPath("worksite")} />
      </span>
    ) : null;
  const edit4 =
    sel.managerDetails ||
      sel.category ||
      sel.rateWages ||
      sel.workWages ||
      sel.leaveDetails ||
      sel.specialBenifites ||
      sel.stateInsurance ||
      sel.miscellaneous ||
      sel.convicted ||
      sel.pastFive ||
      sel.revoking ? (
      <span className="flex max-w-[200px] flex-wrap justify-end gap-2 sm:max-w-none">
        <EditLink to={particularInfoPath ?? sectionPath("labour-wages")} />
      </span>
    ) : null;

  const handleSaveAmendment = async () => {
    if (!fetchEnabled) {
      toast.info("Amendment apply APIs are disabled (set VITE_CLRA_AMENDMENT_APPLY_FETCH=true).");
      return;
    }
    if (formVSerialNo == null) return;
    if (!canSubmitAmendmentInPhaseOne(statusCode)) {
      toast.error(`Save is allowed only in I/B status. Current status: ${statusCode || "—"}.`);
      return;
    }
    if (missingSectionLabels.length > 0) {
      toast.error(`Complete and save selected sections before submit: ${missingSectionLabels.join(", ")}.`);
      return;
    }
    if (!declared) {
      toast.error("Please accept the declaration to proceed.");
      return;
    }
    if (!sectionCompletionVerified) {
      toast.error("Section completion could not be verified. Refresh the page and try again.");
      return;
    }
    if (peMaxLabour > 0 && draftMaxLabour > peMaxLabour) {
      toast.error(
        `Max Contract Labour on any day cannot be greater than ${peMaxLabour} as mentioned in Form-V.`,
      );
      return;
    }
    try {
      setSubmitting(true);
      const res = await submitContractorLicenseAmendmentApplyApi({
        formVSerialNo,
        selfDeclaration: true,
        workOrder: workOrderFile,
        formV: formVFile,
        tradeLicense: tradeLicenseFile,
        otherDocument: otherDocFile,
      });
      if (queryParams) {
        persistAmendmentApplyContext({
          formVSerialNo,
          legacyLicenseId: queryParams.licenseId,
          updatedFormV: queryParams.updatedFormV,
          renewalApplicationId:
            preview?.license_renewal_amnd_id != null
              ? Number(preview.license_renewal_amnd_id)
              : flowCtx?.renewalApplicationId ?? null,
          tagFlag: "A",
          statusCode: res.statusCode,
        });
      }
      const ctxAfterSave = parseClraLicenseRenewalAmendmentCtx();
      if (ctxAfterSave) dispatch(replaceContractorLicenseAmendmentContext(ctxAfterSave));
      toast.success(res.message || "Application saved successfully.");
      navigate("/license-renewal-amendment-list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save amendment application.");
    } finally {
      setSubmitting(false);
    }
  };

  const isAppliedStatus = statusCode === "F";
  const labourExceedsFormV = peMaxLabour > 0 && draftMaxLabour > peMaxLabour;
  const canSaveNow =
    fetchEnabled &&
    sectionCompletionVerified &&
    canSubmitAmendmentInPhaseOne(statusCode) &&
    !labourExceedsFormV;
  const saveBlockedByStatus = fetchEnabled && saved && !canSubmitAmendmentInPhaseOne(statusCode);
  const saveBlockedBySectionCheck = fetchEnabled && saved && !sectionCompletionVerified;
  const canUploadSigned = canUploadSignedAmendment(statusCode);
  const statusLabel = mapContractorLicenseStatusCodeToLabel(statusCode);

  return (
    <div className="w-full bg-[#ececec] px-2 py-4 font-sans md:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        {!fetchEnabled ? (
          <p className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Preview APIs are off (<code className="rounded bg-white px-1">VITE_CLRA_AMENDMENT_APPLY_FETCH=false</code>
            ). Layout only; Save is disabled until APIs are enabled.
          </p>
        ) : null}
        {fetchEnabled && isAppliedStatus ? (
          <p className="mb-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            This amendment is already submitted ({statusLabel}). Save is closed. Use{" "}
            <span className="font-semibold">Upload signed application</span> below to continue, or open the
            application list to track status.
          </p>
        ) : null}

        <AmendmentApplyLegacyView
          formVReferenceDisplay={formVRef}
          licenseNumberDisplay={licenseLine}
          issueDateDisplay={formatLegacyBannerDate(
            preview?.backlog_license_date ?? preview?.license_date
          )}
          validUptoDisplay={formatLegacyBannerDate(preview?.next_renweal_date)}
          view={view}
          editSection2={edit2}
          editSection3={edit3}
          editSection4={edit4}
        />

        {/* Legacy sky-form footer: uploads + declaration + Save / Back */}
        <div className="mt-0 border border-t-0 border-gray-300 bg-white px-3 py-3 md:px-4">
          <div className="grid gap-3 md:grid-cols-2">
            <AmendmentApplyPdfUpload
              label="Work-order Document"
              ariaLabel="Browse for Work-order Document PDF"
              disabled={!fetchEnabled}
              file={workOrderFile}
              onChange={setWorkOrderFile}
            />
            <AmendmentApplyPdfUpload
              label="Form V"
              ariaLabel="Browse for Form V PDF"
              disabled={!fetchEnabled}
              file={formVFile}
              onChange={setFormVFile}
            />
            <AmendmentApplyPdfUpload
              label="Trade License"
              ariaLabel="Browse for Trade License PDF"
              disabled={!fetchEnabled}
              file={tradeLicenseFile}
              onChange={setTradeLicenseFile}
            />
            <AmendmentApplyPdfUpload
              label="Other Document"
              ariaLabel="Browse for Other Document PDF"
              disabled={!fetchEnabled}
              file={otherDocFile}
              onChange={setOtherDocFile}
            />
          </div>

          <label className="mt-3 flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-1"
              checked={declared}
              disabled={!fetchEnabled}
              onChange={(e) => setDeclared(e.target.checked)}
            />
            <span className="text-sm font-bold text-gray-900">
              Declaration: I hereby declare that the details given above are correct to the best of my knowledge and
              belief.
            </span>
          </label>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSaveAmendment}
              disabled={submitting || !canSaveNow || missingSectionLabels.length > 0}
              className="rounded-sm border border-[#46b8da] bg-[#5bc0de] px-8 py-2 text-sm font-semibold text-white hover:bg-[#31b0d5] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <div className="flex flex-wrap gap-2">
              {canUploadSigned ? (
                <button
                  type="button"
                  onClick={() => navigate("/contractor-license/amendment/upload-signed-form")}
                  className="rounded-sm border border-[#46b8da] bg-[#5bc0de] px-4 py-2 text-sm text-white hover:bg-[#31b0d5]"
                >
                  Upload signed application
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => navigate("/license-renewal-amendment-list")}
                className="rounded-sm border border-gray-400 bg-[#f5f5f5] px-8 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
              >
                Back
              </button>
            </div>
          </div>

          {labourExceedsFormV ? (
            <p className="mt-1 text-xs text-red-700">
              Max Contract Labour on any day cannot be greater than {peMaxLabour} as mentioned in
              Form-V. Open Worksite and Contract Labour Details and correct it before save.
            </p>
          ) : null}
          {missingSectionLabels.length > 0 ? (
            <p className="mt-1 text-xs text-red-700">
              Save is locked until these selected sections are saved:{" "}
              <span className="font-semibold">{missingSectionLabels.join(", ")}</span>
            </p>
          ) : null}
          {/* {saveBlockedByStatus && !isAppliedStatus ? (
            <p className="mt-1 text-xs text-amber-900">
              Save is only available while the amendment is in draft (status I or B, or not yet submitted).
              Current amendment status: <span className="font-semibold">{statusLabel}</span>.
            </p>
          ) : null} */}
          {saveBlockedBySectionCheck ? (
            <p className="mt-1 text-xs text-red-700">
              Section completion could not be verified. Refresh the page before saving.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

function str(v: unknown): string {
  if (v == null || v === "") return "—";
  return String(v);
}

export default ClraLicenseAmendmentApply;