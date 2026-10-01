import type { ClraEligibilityContext } from "@/store/clraLicenseRenewalSlice";
import { encryptionDecryptionFun } from "@/utils/encryption";

/**
 * Deep links for the contractor-licence renewal / amendment flow.
 *
 * Every identifier travels through the query string AES-encrypted, so a link can only be
 * built when the ids are actually known. Builders return `null` instead of a half-built
 * path — callers must show an error rather than navigate to a link the target page
 * cannot parse.
 */

export const RENEWAL_APPLY_ROUTE = "/contractor-license/renewal/apply";
export const AMENDMENT_SELECT_FIELDS_ROUTE = "/contractor-license/amendment/select-fields";
export const AMENDMENT_DETAILS_ROUTE = "/contractor-license/amendment/details";
export const AMENDMENT_RE_SUBMIT_ROUTE = "/contractor-license/amendment/re-submit";

/** Ids shared by the amendment routes: original Form-V, licence application, latest Form-V. */
export interface AmendmentRouteParams {
  formVSerialNo: number;
  licenseId: number;
  updatedFormV: number;
}

/** Route ids are always positive integers — anything else is treated as missing. */
function toRouteId(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

function encryptRouteId(value: unknown): string | null {
  const id = toRouteId(value);
  if (id === null) return null;
  return encryptionDecryptionFun("encrypt", String(id)) || null;
}

export function decryptRouteId(value: string | null | undefined): number | null {
  const raw = value?.trim();
  if (!raw) return null;
  return toRouteId(encryptionDecryptionFun("decrypt", raw));
}

/**
 * `updatedFormV` is the newest Form-V revision of the same contractor + principal employer.
 * Older licences have no newer revision, so they amend against their own Form-V serial.
 */
export function resolveUpdatedFormV(
  updatedFormV: unknown,
  formVSerialNo: unknown,
): number | null {
  return toRouteId(updatedFormV) ?? toRouteId(formVSerialNo);
}

/** Encrypted query string, or `null` when any required id is missing/unencryptable. */
function buildEncryptedQuery(
  required: Record<string, unknown>,
  optional: Record<string, unknown> = {},
): string | null {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(required)) {
    const encrypted = encryptRouteId(value);
    if (!encrypted) return null;
    query.set(key, encrypted);
  }

  for (const [key, value] of Object.entries(optional)) {
    const encrypted = encryptRouteId(value);
    if (encrypted) query.set(key, encrypted);
  }

  return query.toString();
}

/** Renewal application link — `updatedFormV` is forwarded when the context carries it. */
export function buildRenewalApplyPath(
  context: Pick<ClraEligibilityContext, "formVSerialNo" | "legacyLicenseId"> &
    Partial<Pick<ClraEligibilityContext, "updatedFormV">>,
): string | null {
  const query = buildEncryptedQuery(
    {
      formVSerialNo: context.formVSerialNo,
      licenseId: context.legacyLicenseId,
    },
    { updatedFormV: context.updatedFormV },
  );
  return query ? `${RENEWAL_APPLY_ROUTE}?${query}` : null;
}

/** First amendment step: pick the fields to amend. */
export function buildAmendmentSelectFieldsPath(
  context: Pick<ClraEligibilityContext, "formVSerialNo" | "legacyLicenseId" | "updatedFormV">,
): string | null {
  const query = buildEncryptedQuery({
    formVSerialNo: context.formVSerialNo,
    licenseId: context.legacyLicenseId,
    updatedFormV: context.updatedFormV,
  });
  return query ? `${AMENDMENT_SELECT_FIELDS_ROUTE}?${query}` : null;
}

/** Amendment application details — same encrypted query shape as select-fields. */
export function buildAmendmentDetailsPath(params: AmendmentRouteParams): string | null {
  const query = buildEncryptedQuery({
    formVSerialNo: params.formVSerialNo,
    licenseId: params.licenseId,
    updatedFormV: params.updatedFormV,
  });
  return query ? `${AMENDMENT_DETAILS_ROUTE}?${query}` : null;
}

/** Ids the rectification re-submit page needs: original Form-V, latest Form-V, amendment row. */
export interface AmendmentReSubmitRouteParams {
  formVSerialNo: number;
  updatedFormV: number;
  amendmentId: number;
}

/** Re-submit link for an amendment the ALC sent back for rectification. */
export function buildAmendmentReSubmitPath(params: {
  formVSerialNo: unknown;
  updatedFormV?: unknown;
  amendmentId: unknown;
}): string | null {
  const query = buildEncryptedQuery({
    formVSerialNo: params.formVSerialNo,
    updatedFormV: resolveUpdatedFormV(params.updatedFormV, params.formVSerialNo),
    amendmentId: params.amendmentId,
  });
  return query ? `${AMENDMENT_RE_SUBMIT_ROUTE}?${query}` : null;
}

/** Read back the ids written by `buildAmendmentReSubmitPath`. */
export function parseAmendmentReSubmitRouteParams(
  searchParams: URLSearchParams,
): AmendmentReSubmitRouteParams | null {
  const formVSerialNo = decryptRouteId(searchParams.get("formVSerialNo"));
  const amendmentId = decryptRouteId(searchParams.get("amendmentId"));

  if (formVSerialNo === null || amendmentId === null) return null;

  return {
    formVSerialNo,
    updatedFormV:
      decryptRouteId(searchParams.get("updatedFormV")) ?? formVSerialNo,
    amendmentId,
  };
}

/** Read back the ids written by the amendment builders. */
export function parseAmendmentRouteParams(
  searchParams: URLSearchParams,
): AmendmentRouteParams | null {
  const formVSerialNo = decryptRouteId(searchParams.get("formVSerialNo"));
  const licenseId = decryptRouteId(searchParams.get("licenseId"));
  const updatedFormV = decryptRouteId(searchParams.get("updatedFormV"));

  if (formVSerialNo === null || licenseId === null || updatedFormV === null) return null;

  return { formVSerialNo, licenseId, updatedFormV };
}
