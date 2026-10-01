import type { NavigateFunction } from "react-router-dom";
import {
  parseClraLicenseRenewalAmendmentCtx,
  type ClraEligibilityContext,
} from "@/store/clraLicenseRenewalSlice";
import { buildAmendmentDetailsPath } from "@/utils/contractorLicenseRouteLinks";

const SESSION_KEY = "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX";

/** Persist amendment apply flow identifiers for section edits and back navigation. */
export function persistAmendmentApplyContext(
  patch: Partial<ClraEligibilityContext> &
    Pick<ClraEligibilityContext, "formVSerialNo" | "legacyLicenseId" | "updatedFormV">,
): ClraEligibilityContext {
  let base: Partial<ClraEligibilityContext> = {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) base = JSON.parse(raw) as Partial<ClraEligibilityContext>;
  } catch {
    base = {};
  }
  const next: ClraEligibilityContext = {
    formVSerialNo: patch.formVSerialNo,
    legacyLicenseId: patch.legacyLicenseId,
    updatedFormV: patch.updatedFormV,
    paymentApplicationId: patch.paymentApplicationId ?? base.paymentApplicationId ?? null,
    contractorParticularId: patch.contractorParticularId ?? base.contractorParticularId ?? null,
    tagFlag: patch.tagFlag ?? base.tagFlag ?? "A",
    statusCode: patch.statusCode ?? base.statusCode ?? null,
    payActId: patch.payActId ?? base.payActId,
    renewalApplicationId: patch.renewalApplicationId ?? base.renewalApplicationId ?? null,
    amendmentDraftId:
      patch.amendmentDraftId ??
      base.amendmentDraftId ??
      null,
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** Sync session from amendment details preview (upload-signed / legacy details API). */
export function mergeAmendmentApplySessionFromPreview(
  preview: Record<string, unknown> | null | undefined,
): void {
  if (!preview || typeof preview !== "object") return;
  let base: Record<string, unknown> = {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) base = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    base = {};
  }
  const flag = String(preview.activity_tag_flag ?? preview.is_flag ?? "A").trim().toUpperCase() || "A";
  const amendStat = String(preview.ammendment_status ?? "").trim().toUpperCase();
  const tagStat = String(preview.activity_tag_application_status ?? "").trim().toUpperCase();
  const hasAmendmentStatus = Object.prototype.hasOwnProperty.call(preview, "ammendment_status");
  const statusForSession = hasAmendmentStatus ? amendStat : amendStat || tagStat;
  const particularRaw = preview.contractor_particular_id;
  const legacyLicRaw = preview.legacy_license_id;
  const amendIdRaw = preview.license_renewal_amnd_id;
  const next: Record<string, unknown> = {
    ...base,
    tagFlag: flag === "A" ? "A" : base.tagFlag ?? flag,
  };
  if (particularRaw != null && particularRaw !== "") {
    const n = Number(particularRaw);
    if (Number.isFinite(n) && n > 0) next.contractorParticularId = Math.trunc(n);
  }
  if (legacyLicRaw != null && legacyLicRaw !== "") {
    const n = Number(legacyLicRaw);
    if (Number.isFinite(n) && n > 0) next.legacyLicenseId = Math.trunc(n);
  }
  if (amendIdRaw != null && amendIdRaw !== "") {
    const n = Number(amendIdRaw);
    if (Number.isFinite(n) && n > 0) next.renewalApplicationId = Math.trunc(n);
  }
  if (hasAmendmentStatus || statusForSession) next.statusCode = statusForSession;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getAmendmentApplyPathFromSession(): string | null {
  const ctx = parseClraLicenseRenewalAmendmentCtx();
  if (!ctx?.formVSerialNo || ctx.legacyLicenseId == null) return null;
  return buildAmendmentDetailsPath({
    formVSerialNo: ctx.formVSerialNo,
    licenseId: ctx.legacyLicenseId,
    updatedFormV: ctx.updatedFormV ?? ctx.formVSerialNo,
  });
}

export function navigateToAmendmentApply(
  navigate: NavigateFunction,
  toastError: (message: string) => void,
): void {
  const path = getAmendmentApplyPathFromSession();
  if (path) {
    navigate(path);
    return;
  }
  toastError(
    "Amendment context is incomplete. Open from the application list or after selecting fields to amend.",
  );
  navigate("/license-renewal-amendment-list");
}
