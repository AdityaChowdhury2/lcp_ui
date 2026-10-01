/**
 * Amendment apply page data loading.
 * Set `VITE_CLRA_AMENDMENT_APPLY_FETCH=false` in `lcp_ui/.env` to render the legacy UI without
 * calling preview / field-selection / completion APIs (for layout-only work until APIs are ready).
 */
export function isAmendmentApplyFetchEnabled(): boolean {
  return import.meta.env.VITE_CLRA_AMENDMENT_APPLY_FETCH !== "false";
}
