import type { AppDispatch } from "./store";
import { parseClraLicenseRenewalAmendmentCtx } from "./clraLicenseRenewalSlice";
import { replaceContractorLicenseAmendmentContext } from "./contractorLicenseAmendmentSlice";

/**
 * After any code path updates `sessionStorage` key `CLRA_LICENSE_RENEWAL_AMENDMENT_CTX`,
 * call this so `contractorLicenseAmendment` Redux state matches (amendment + shared renewal context).
 */
export function syncAmendmentReduxFromSession(dispatch: AppDispatch): void {
  const ctx = parseClraLicenseRenewalAmendmentCtx();
  if (ctx) dispatch(replaceContractorLicenseAmendmentContext(ctx));
}
