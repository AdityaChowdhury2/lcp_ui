// Role IDs that can access the officer/admin dashboard area
export const OFFICER_ROLES: number[] = [
  3,  // administrator
  4,  // ALC
  5,  // DLC
  6,  // JLC
  7,  // Inspector
  11, // Trade Union Admin
  12, // SUPER ADMIN
  15, // STATISTICS (minimum wages module only)
  17, // ADDLC
  18, // DEOMSTR
  19, // MCDLSCCKCO
  23, // SLI Admin
  28, // BOCWADMIN
  29, // LC
];

// Role IDs that can access the applicant dashboard area
export const APPLICANT_ROLES: number[] = [
  8,  // Applicant
  9,  // Contractor
  16, // TUAPPLICANT
];

/** Renewal FORM‑VI (certificate) viewer: applicants/contractors + ALC */
export const CONTRACTOR_RENEWAL_FORM_VI_VIEWER_ROLES: number[] = [
  ...APPLICANT_ROLES,
  4, // ALC
];

// Role IDs that can access the ctu dashboard area
/** Minimum-wages officer (STATISTICS) — limited sidebar and routes */
export const STATISTICS_ROLE_ID = 15 as const;

export const STATISTICS_MIN_WAGES_PATHS = [
  "/min-wages/scheduled-employment",
  "/min-wages/non-scheduled-employment",
  "/insvariousreport", // <-- Add this
] as const;

export const CTU_ROLES: number[] = [
  16, // Trade Union Applicant
  22, // CTU - Central Trade Union
  11, // Whole Trade Union Module - Super Admin
];
