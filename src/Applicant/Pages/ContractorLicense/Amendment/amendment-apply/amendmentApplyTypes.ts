import type { ReactNode } from "react";

/** Normalized row for legacy-style label / value grid */
export type AmendmentApplyRow = {
  label: string;
  value: ReactNode;
};

export type AmendmentApplyDocLink = {
  fid: number | null;
  label: string;
  href: string | null;
  linkText: string;
};

export type AmendmentApplyViewModel = {
  section1: AmendmentApplyRow[];
  section2: AmendmentApplyRow[];
  section3: AmendmentApplyRow[];
  section3DueSecurity: string | null;
  section4BeforeWages: AmendmentApplyRow[];
  wagesBannerTitle: string;
  wageRows: AmendmentApplyRow[];
  hoursRow: AmendmentApplyRow;
  leaveBannerTitle: string;
  leaveRows: AmendmentApplyRow[];
  documents: AmendmentApplyDocLink[];
};
