import { createContext, useContext } from "react";
import type { EmploymentTabKey } from "./EmploymentTabBar";

/**
 * Shared state for the single-path Employment (In West Bengal) ISMW license flow.
 *
 * The whole flow lives on ONE route (`/establishment-details/:formSixEnc`). Tab
 * switching is handled here via state instead of route changes. When this
 * context is present the step components advance by calling `goToTab` and share
 * the encrypted licence id through `licenceIdEnc`; when it is absent (a component
 * rendered standalone at its own route) they fall back to URL params + navigate.
 */
export interface EmploymentFlowCtx {
  /** Encrypted FORM-VI number the flow was entered with. */
  formSixEnc: string;
  /** Encrypted licence id, available once FORM-II is confirmed. */
  licenceIdEnc: string;
  setLicenceIdEnc: (value: string) => void;
  /** Switch the visible tab. */
  goToTab: (tab: EmploymentTabKey) => void;
}

export const EmploymentFlowContext = createContext<EmploymentFlowCtx | null>(null);

/** Returns the flow context, or null when a step is rendered outside the flow. */
export const useEmploymentFlow = (): EmploymentFlowCtx | null =>
  useContext(EmploymentFlowContext);
