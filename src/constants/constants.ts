export const API_BASE: string = import.meta.env.VITE_API_BASE_URL;
export const FRONTEND_BASE: string = import.meta.env.VITE_FRONTEND_BASE_URL;
// export const BASE_URL: string = import.meta.env.BASE_URL || "";
export const DOMAIN_NAME: string = import.meta.env.VITE_DOMAIN_NAME;

export const IMAGE_BASE: string = `/images/`;
// export const IMAGE_BASE: string = `/lc/images/`;

export const AUTH_STORAGE_KEY = "lc_portal_auth";

/** Shown on all LC dashboards while server migration sync is in progress. */
export const MIGRATION_NOTICE_MESSAGE =
  "The portal has been migrated to a new server. Frequent updation/synchronization is in process. Please try after sometime if you find any glitches.";

export const ACTS = ["CLRA", "BOCWA", "ISMW", "MTW"] as const;
export const STATUS_IMAGE_MAP: Record<string, string> = {
  Approved: "btn-approved.png",
  VA: "btn-approved.png",
  Applied: "btn-applied.png",
  "0": "btn-applied.png",
  "Fees Paid": "btn-fees-paid.png",
  T: "btn-fees-paid.png",
  "Fees Pending": "btn-fees-pending.png",
  V: "btn-fees-pending.png",
  Pending: "btn-pending.png",
  "Final Submitted": "btn-final-submit.png",
  S: "btn-final-submit.png",
  Issued: "btn-issued.png",
  I: "btn-issued.png",
  Rectification: "btn-rectification.png",
  B: "btn-rectification.png",
  Rejected: "btn-reject.png",
  R: "btn-reject.png",
  BI: "btn-inspector.png",
  Forwarded: "btn-to-alc.png",
  F: "btn-to-alc.png",
  U: "btn-rectify-signed-form.png",
  RN: "btn-applied.png",
};