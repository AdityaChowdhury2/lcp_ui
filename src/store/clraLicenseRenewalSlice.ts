import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

export type ClraRenewalStatus = "idle" | "loading" | "succeeded" | "failed";

/** Stored in session (`CLRA_LICENSE_RENEWAL_AMENDMENT_CTX`) and returned from eligibility API. */
export interface ClraEligibilityContext {
  formVSerialNo: number;
  legacyLicenseId: number | null;
  paymentApplicationId?: number | null;
  contractorParticularId?: number | null;
  tagFlag?: string | null;
  statusCode?: string | null;
  payActId?: number;
  renewalApplicationId?: number | null;
  amendmentDraftId?: number | null;
  updatedFormV: number;
}

export interface ClraEligibility {
  renewal: boolean;
  amendment: boolean;
}

export interface ClraEligibilityState {
  status: ClraRenewalStatus;
  error: string | null;
  eligible: ClraEligibility | null;
  eligibilityRemarks: { renewal: string; amendment: string } | null;
  context: ClraEligibilityContext | null;
}

export interface ClraDetailsState {
  status: ClraRenewalStatus;
  error: string | null;
  renewalDetails: any | null;
}

export interface ClraLicenseRenewalRootState {
  clraLicenseRenewal: ClraLicenseRenewalState;
}

export interface ClraLicenseListItem {
  tagId: number;
  formVSerialNo: number;
  updatedFormV: number;
  formRef: string;
  licenseDetails: string;
  appliedFor: string;
  applicationDate: string | null;
  statusCode: string | null;
  statusLabel: string;
  applicationType: "License" | "Renewal" | "Amendment";
  flag: string;
  licenseApplicationId: number | null;
  paymentApplicationId?: number | null;
  renewalApplicationId?: number | null;
  contractorParticularId: number | null;
  payActId: number;
}

export interface ClraLicenseListState {
  status: ClraRenewalStatus;
  error: string | null;
  items: ClraLicenseListItem[];
}

export interface ClraLicenseRenewalState {
  eligibility: ClraEligibilityState;
  details: ClraDetailsState;
  list: ClraLicenseListState;
}

export function mapContractorLicenseStatusCodeToLabel(code: string | null | undefined): string {
  const c = String(code ?? "").trim().toUpperCase();
  const m: Record<string, string> = {
    F: "Applied",
    B: "Rectify Application",
    A: "Fees Pending",
    P: "Fees Paid",
    U: "Final Submit",
    S: "Final Submit",
    I: "Issued",
    AW: "Approved",
    R: "Rejected",
    BI: "In Process",
    FW: "In Process",
    C: "Call Applicant",
  };
  return m[c] ?? (c || "—");
}

export function canSubmitAmendmentInPhaseOne(code: string | null | undefined): boolean {
  const c = String(code ?? "").trim().toUpperCase();
  return c === "" || c === "I" || c === "B";
}

export function canSubmitRenewalApplication(code: string | null | undefined): boolean {
  const c = String(code ?? "").trim().toUpperCase();
  return c === "I" || c === "B";
}

export function canPayRenewalFees(code: string | null | undefined): boolean {
  return String(code ?? "").trim().toUpperCase() === "A";
}

// export function canUploadSignedAmendment(code: string | null | undefined): boolean {
//   const c = String(code ?? "").trim().toUpperCase();
//   // F = phase-1 apply saved (legacy Applied); applicant uploads signed PDF next.
//   return c === "F" || c === "P" || c === "AW" || c === "BF" || c === "B";
// }
export function canUploadSignedAmendment(code: string | null | undefined): boolean {
  const c = String(code ?? "").trim().toUpperCase();
  // F = phase-1 apply saved (legacy Applied); applicant uploads signed PDF next.
  return c === "P" || c === "AW" || c === "BF";
}

export function canUploadSignedRenewal(code: string | null | undefined): boolean {
  const c = String(code ?? "").trim().toUpperCase();
  return c === "P";
}

const initialState: ClraLicenseRenewalState = {
  eligibility: {
    status: "idle",
    error: null,
    eligible: null,
    eligibilityRemarks: null,
    context: null,
  },
  details: {
    status: "idle",
    error: null,
    renewalDetails: null,
  },
  list: {
    status: "idle",
    error: null,
    items: [],
  },
};

export function parseClraLicenseRenewalAmendmentCtx(): ClraEligibilityContext | null {
  const raw = sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClraEligibilityContext;
  } catch {
    return null;
  }
}

export interface ContractorLicenseRemarkRow {
  id: number;
  remarkText: string;
  remarkType: string;
  remarkDate: string | null;
  remarkByName: string;
}

/** GET contractor-license/remarks — used by the remarks screen (no Redux state). */
export async function fetchContractorLicenseRemarks(params: {
  formVSerialNo: number;
  particularId: number;
  flag: string;
}): Promise<{ success: true; remarks: ContractorLicenseRemarkRow[] }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");

  const q = new URLSearchParams({
    formVSerialNo: String(params.formVSerialNo),
    particularId: String(params.particularId),
    flag: (params.flag ?? "L").trim() || "L",
  });

  const res = await fetch(`${API_BASE}contractor-license/remarks?${q.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.success !== true || !Array.isArray(data.remarks)) {
    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message)
        : null) ||
      (res.status === 403 ? "Access denied." : null) ||
      "Unable to load remarks.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load remarks.");
  }

  return data as { success: true; remarks: ContractorLicenseRemarkRow[] };
}

/** Legacy `check_amendment` checkbox groups — matches API DTO. */
export type AmendmentFieldSelectionPayload = {
  formVSerialNo: number;
  contrctorDetails: boolean;
  managerDetails: boolean;
  maxLabour: boolean;
  worksiteAddress: boolean;
  category: boolean;
  rateWages: boolean;
  workWages: boolean;
  leaveDetails: boolean;
  specialBenifites: boolean;
  stateInsurance: boolean;
  miscellaneous: boolean;
  convicted: boolean;
  pastFive: boolean;
  revoking: boolean;
};

const defaultAmendmentSelection = (): Omit<AmendmentFieldSelectionPayload, "formVSerialNo"> => ({
  contrctorDetails: false,
  managerDetails: false,
  maxLabour: false,
  worksiteAddress: false,
  category: false,
  rateWages: false,
  workWages: false,
  leaveDetails: false,
  specialBenifites: false,
  stateInsurance: false,
  miscellaneous: false,
  convicted: false,
  pastFive: false,
  revoking: false,
});

export async function getAmendmentFieldSelectionApi(formVSerialNo: number): Promise<{
  success: true;
  saved: boolean;
  selection: Omit<AmendmentFieldSelectionPayload, "formVSerialNo">;
}> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(
    `${API_BASE}contractor-license/amendment/field-selection?formVSerialNo=${encodeURIComponent(
      String(formVSerialNo)
    )}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true || !data.selection) {
    const msg = data?.message || "Unable to load amendment field selection.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load.");
  }
  return {
    success: true,
    saved: Boolean(data.saved),
    selection: { ...defaultAmendmentSelection(), ...data.selection },
  };
}

export async function getAmendmentSectionCompletionApi(formVSerialNo: number): Promise<{
  success: true;
  saved: boolean;
  selection: Omit<AmendmentFieldSelectionPayload, "formVSerialNo">;
  completed: {
    worksite: boolean;
    contractor: boolean;
    manager: boolean;
    category: boolean;
    labourWages: boolean;
    conditionsBenefits: boolean;
    complianceHistory: boolean;
  };
  missingLabels: string[];
}> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(
    `${API_BASE}contractor-license/amendment/section-completion?formVSerialNo=${encodeURIComponent(
      String(formVSerialNo)
    )}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to load amendment section completion.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load.");
  }
  return {
    success: true,
    saved: Boolean(data.saved),
    selection: { ...defaultAmendmentSelection(), ...(data.selection ?? {}) },
    completed: {
      worksite: Boolean(data?.completed?.worksite),
      contractor: Boolean(data?.completed?.contractor),
      manager: Boolean(data?.completed?.manager),
      category: Boolean(data?.completed?.category),
      labourWages: Boolean(data?.completed?.labourWages),
      conditionsBenefits: Boolean(data?.completed?.conditionsBenefits),
      complianceHistory: Boolean(data?.completed?.complianceHistory),
    },
    missingLabels: Array.isArray(data?.missingLabels)
      ? data.missingLabels.filter((v: unknown) => typeof v === "string")
      : [],
  };
}

// Unused function - throughout the project, this function is not used
export async function saveAmendmentWorksiteApi(payload: {
  formVSerialNo: number;
  worksiteAddressLine: string;
  reasonChangingWorksite?: string;
  worksiteDist?: string;
  worksiteSubdivision?: number;
  workSiteAreatype?: string;
  nameWorkSiteAreatype?: number;
  workSiteVillWard?: number;
  worksitePs?: string;
  worksitePin?: number;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-worksite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update worksite address.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export async function saveAmendmentContractorApi(payload: {
  formVSerialNo: number;
  nameOfContractor?: string;
  addressOfContractor?: string;
  contractorDist?: string;
  fatherContarctorName?: string;
  dobContractor?: string;
  ageContractor?: number;
  categoryOfContractor?: number;
  contractorState?: number;
  contrcatorCountry?: number;
  contractorSubdivision?: number;
  contractorAreatype?: string;
  contractorNameAreatype?: number;
  contractorVillWard?: number;
  contractorPs?: string;
  contractorPin?: number;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-contractor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update contractor details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export async function saveAmendmentManagerApi(payload: {
  formVSerialNo: number;
  nameOfAgent?: string;
  addressOfManager?: string;
  contractorManagerDist?: string;
  contractorManagerSubdivision?: number;
  contractorManagerAreatype?: string;
  contractorManagerNameAreatype?: number;
  contractorManagerrVillWard?: number;
  contractorManagerPs?: string;
  managerPin?: number;
  managerState?: number;
  managerCountry?: number;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-manager`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update manager details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export async function saveAmendmentLabourWagesApi(payload: {
  formVSerialNo: number;
  contractorMaxNoOfLaboursOnAnyDay?: number;
  isCoparative?: number;
  unskilledRateWages?: number;
  semiskilledRateWages?: number;
  skilledRateWages?: number;
  highlyskilledRateWages?: number;
  hoursWork?: number;
  spredOver?: number;
  overtime?: number;
  overtimeWages?: number;
  weeklyHoliday?: number;
  noHoliday?: string;
  holidayWages?: number;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-labour-wages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update labour/wages details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export type AmendmentWorksiteFeesPreview = {
  success: true;
  applicableAmendmentFee: number;
  applicableSecurityFees: number;
  payableAmendmentFees: number;
  payableAmendmentSecurityFees: number;
  dueSecurityFees: number;
  highestFeesPaid: number;
  highestSecurityFeesPaid: number;
};

export async function previewAmendmentWorksiteFeesApi(payload: {
  formVSerialNo: number;
  contractorMaxNoOfLaboursOnAnyDay?: number;
  isCoparative?: number;
}): Promise<AmendmentWorksiteFeesPreview> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/preview-worksite-fees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to preview fees.";
    throw new Error(typeof msg === "string" ? msg : "Unable to preview.");
  }
  return data as AmendmentWorksiteFeesPreview;
}

export async function saveAmendmentConditionsBenefitsApi(payload: {
  formVSerialNo: number;
  weeklyHoliday?: number;
  noHoliday?: string;
  holidayWages?: number;
  annualLeaveNo?: number;
  casualLeaveNo?: number;
  sickLeaveNo?: number;
  maternityLeaveNo?: number;
  earnedLeaveNo?: number;
  otherLeaveNo?: number;
  specialBenifites?: string;
  stateInsurance?: string;
  miscellaneousProvisions?: string;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-conditions-benefits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update leave/benefits details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export async function saveAmendmentComplianceHistoryApi(payload: {
  formVSerialNo: number;
  contractorConvicted?: number;
  detailsContractorConvicted?: string;
  contractorPreviousEmployer?: number;
  detailsPreviousEmployer?: string;
  contractorRevoking?: number;
  detailsContractorRevoking?: string;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-compliance-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update compliance history details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export async function saveAmendmentCategoryApi(payload: {
  formVSerialNo: number;
  categoryOfContractor?: number;
  categoryDesignation?: string;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/update-category`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to update category details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to update.");
  }
  return data as { success: true; message: string };
}

export async function uploadRenewalSignedFormViiApi(payload: {
  formVSerialNo: number;
  file: File;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const fd = new FormData();
  fd.append("formVSerialNo", String(payload.formVSerialNo));
  fd.append("file", payload.file);
  const res = await fetch(`${API_BASE}contractor-license/renewal/upload-form-vii`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to upload signed FORM-VII.";
    throw new Error(typeof msg === "string" ? msg : "Unable to upload.");
  }
  return data as { success: true; message: string };
}

export async function uploadRenewalWorkOrderApi(payload: {
  formVSerialNo: number;
  file: File;
}): Promise<{ success: true; message: string; fileId: number; fileUrl: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const fd = new FormData();
  fd.append("formVSerialNo", String(payload.formVSerialNo));
  fd.append("file", payload.file);
  const res = await fetch(`${API_BASE}contractor-license/renewal/upload-work-order`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to upload extended work-order.";
    throw new Error(typeof msg === "string" ? msg : "Unable to upload.");
  }
  return data as { success: true; message: string; fileId: number; fileUrl: string };
}

export async function uploadAmendmentSignedFormApi(payload: {
  formVSerialNo: number;
  file: File;
}): Promise<{ success: true; message: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const fd = new FormData();
  fd.append("formVSerialNo", String(payload.formVSerialNo));
  fd.append("file", payload.file);
  const res = await fetch(`${API_BASE}contractor-license/amendment/upload-signed-form`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to upload signed amendment application.";
    throw new Error(typeof msg === "string" ? msg : "Unable to upload.");
  }
  return data as { success: true; message: string };
}

export async function fetchContractorLicenseRenewalPreviewApi(payload: {
  formVSerialNo: number;
  licenseId: number;
  updatedFormV?: number;
}): Promise<any> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");

  const queryParams = new URLSearchParams({
    formVSerialNo: String(payload.formVSerialNo),
    licenseId: String(payload.licenseId),
    // updatedFormV: String(payload.updatedFormV), // to indicate that we want the latest FORM-V details even if not yet submitted by the user (for better UX in the amendment flow)
  });

  const res = await fetch(
    `${API_BASE}contractor-license/renewal/preview?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || data?.error || "Unable to load renewal preview.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load renewal preview.");
  }
  return data;
}

export async function fetchContractorLicenseAmendmentDetailsNewApi(payload: {
  formVNo: string;
  updatedFormVNo: string;
  amendId?: string;
}): Promise<Record<string, unknown>> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");

  // const queryParams = new URLSearchParams({
  //   formVNo: String(payload.formVNo),
  //   updatedFormVNo: String(payload.updatedFormVNo),
  // });

  // if (
  //   payload.amendId != null &&
  //   Number.isFinite(Number(payload.amendId)) &&
  //   Number(payload.amendId) > 0
  // ) {
  //   queryParams.set("amendId", String(payload.amendId));
  // }

  const res = await fetch(
    `${API_BASE}contractor-license/amendment/details-new?formVNo=${payload.formVNo}&updatedFormVNo=${payload.updatedFormVNo}&amendId=${payload.amendId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.success !== true) {
    const msg =
      data?.message ||
      data?.error ||
      "Unable to load amendment preview.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load amendment preview.");
  }

  return data;
}

export async function submitContractorLicenseRenewalApi(payload: {
  formVSerialNo: number;
  workOrderFileId?: number;
}): Promise<{
  success: true;
  message: string;
  renewalApplicationId: number;
  statusCode: string;
  statusText: string;
  payableTotalAmt: number;
  paymentDetails: Array<{ payableamt: number; hoa: string; purpose: string }>;
}> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");

  const res = await fetch(`${API_BASE}contractor-license/renewal/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || data?.error || "Unable to submit renewal application.";
    throw new Error(typeof msg === "string" ? msg : "Unable to submit renewal application.");
  }
  return data as {
    success: true;
    message: string;
    renewalApplicationId: number;
    statusCode: string;
    statusText: string;
    payableTotalAmt: number;
    paymentDetails: Array<{ payableamt: number; hoa: string; purpose: string }>;
  };
}

export type LegacyFormIvUploadState = {
  success: true;
  formVSerialNo: number;
  licenseId: number;
  status: string;
  finalStatus: string;
  canSubmit: boolean;
  editableFields: {
    workOrder: boolean;
    formV: boolean;
    residential: boolean;
    other: boolean;
  };
  files: {
    workOrderFileId: number | null;
    formVFileId: number | null;
    residentialFileId: number | null;
    otherFileId: number | null;
  };
};

export async function fetchLegacyFormIvUploadStateApi(formVSerialNo: number): Promise<LegacyFormIvUploadState> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(
    `${API_BASE}contractor-license/apply-upload/${encodeURIComponent(String(formVSerialNo))}/state`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || data?.error || "Unable to load legacy upload state.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load legacy upload state.");
  }
  return data as LegacyFormIvUploadState;
}

export async function submitLegacyFormIvUploadApi(payload: {
  formVSerialNo: number;
  workOrder?: File | null;
  formV?: File | null;
  residential?: File | null;
  other?: File | null;
}): Promise<{ success: true; message: string; redirectPath?: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const fd = new FormData();
  if (payload.workOrder) fd.append("workOrder", payload.workOrder);
  if (payload.formV) fd.append("formV", payload.formV);
  if (payload.residential) fd.append("residential", payload.residential);
  if (payload.other) fd.append("other", payload.other);
  const res = await fetch(
    `${API_BASE}contractor-license/apply-upload/${encodeURIComponent(String(payload.formVSerialNo))}/submit`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || data?.error || "Unable to save uploaded documents.";
    throw new Error(typeof msg === "string" ? msg : "Unable to save uploaded documents.");
  }
  return data as { success: true; message: string; redirectPath?: string };
}

export async function fetchLegacyFormIvDocApi(payload: {
  formVSerialNo: number;
  licenseId: number;
  docType: "WO" | "FV" | "TL" | "OD";
}): Promise<{ filename: string; blobUrl: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(
    `${API_BASE}contractor-license/apply-upload/${encodeURIComponent(String(payload.formVSerialNo))}/${encodeURIComponent(
      String(payload.licenseId)
    )}/doc/${encodeURIComponent(payload.docType)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true || !data?.fileContentBase64) {
    const msg = data?.message || data?.error || "Unable to load document.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load document.");
  }
  const binary = atob(String(data.fileContentBase64));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    filename: String(data.filename || `${payload.docType}.pdf`),
    blobUrl: URL.createObjectURL(blob),
  };
}

/** Legacy apply-amendment screen: multipart with optional PDFs + required self-declaration. */
export async function submitContractorLicenseAmendmentApplyApi(payload: {
  formVSerialNo: number;
  selfDeclaration: boolean;
  comment?: string;
  workOrder?: File | null;
  formV?: File | null;
  tradeLicense?: File | null;
  otherDocument?: File | null;
}): Promise<{
  success: true;
  message: string;
  statusCode: string;
  statusText: string;
}> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");

  const fd = new FormData();
  fd.append("formVSerialNo", String(payload.formVSerialNo));
  fd.append("selfDeclaration", payload.selfDeclaration ? "1" : "0");
  if (payload.comment) fd.append("comment", payload.comment);
  if (payload.workOrder) fd.append("workOrder", payload.workOrder);
  if (payload.formV) fd.append("formV", payload.formV);
  if (payload.tradeLicense) fd.append("tradeLicense", payload.tradeLicense);
  if (payload.otherDocument) fd.append("otherDocument", payload.otherDocument);

  const res = await fetch(`${API_BASE}contractor-license/amendment/submit-apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || data?.error || "Unable to save amendment application.";
    throw new Error(typeof msg === "string" ? msg : "Unable to save amendment application.");
  }
  return data as {
    success: true;
    message: string;
    statusCode: string;
    statusText: string;
  };
}

export async function fetchContractorLicenseAmendmentApplyDetails(
  formVSerialNo: number,
  renewalApplicationId?: number | null,
): Promise<Record<string, unknown>> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const q = new URLSearchParams({ formVSerialNo: String(formVSerialNo) });
  if (renewalApplicationId != null && Number.isFinite(Number(renewalApplicationId)) && Number(renewalApplicationId) > 0) {
    q.set("renewalApplicationId", String(Math.trunc(Number(renewalApplicationId))));
  }
  const res = await fetch(
    `${API_BASE}contractor-license/amendment/details?${q.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  const code = data?.code;
  const ok = code === 200 || code === "200" || Number(code) === 200;
  if (!ok) {
    const msg =
      (data?.content as { status_remarks?: string } | undefined)?.status_remarks ||
      data?.message ||
      "Unable to load amendment details.";
    throw new Error(typeof msg === "string" ? msg : "Unable to load amendment details.");
  }
  const inner = (data?.content ?? data) as Record<string, unknown>;
  // Some gateways wrap once more
  if (inner && typeof inner === "object" && "content" in inner && inner.content != null) {
    return inner.content as Record<string, unknown>;
  }
  return inner;
}

export async function saveFieldsAndAmendDraftApi(payload: {
  licenseId: number;
  orgFormVno: number;
  updatedFormV: number;
  fields: Omit<AmendmentFieldSelectionPayload, "formVSerialNo">;
}): Promise<{
  success: true;
  message: string;
  amendmentDraftId: number;
}> {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication error. Please login again.");
  const res = await fetch(`${API_BASE}contractor-license/amendment/save-fields-and-amend-draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success !== true) {
    const msg = data?.message || "Unable to save amendment fields and draft.";
    throw new Error(typeof msg === "string" ? msg : "Unable to save.");
  }
  return data as {
    success: true;
    message: string;
    amendmentDraftId: number;
  };
}

export { defaultAmendmentSelection };

export const checkClraLicenseEligibility = createAsyncThunk<
  {
    eligible: ClraEligibility;
    eligibilityRemarks: { renewal: string; amendment: string } | null;
    context: ClraEligibilityContext;
  },
  { refNo: string; licenseNo: string },
  { rejectValue: string }
>("clraLicenseRenewal/checkEligibility", async (payload, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) return rejectWithValue("Authentication error. Please login again.");

  const res = await fetch(
    `${API_BASE}contractor-license/renewal/step-one`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (data?.success !== true) {
    return rejectWithValue(data?.message || "Unable to verify details.");
  }

  const eligible: ClraEligibility = data.eligible;
  const eligibilityRemarks =
    data?.eligibilityRemarks && typeof data.eligibilityRemarks === "object"
      ? (data.eligibilityRemarks as { renewal: string; amendment: string })
      : null;
  const context: ClraEligibilityContext = data.context;

  sessionStorage.setItem(
    "CLRA_LICENSE_RENEWAL_AMENDMENT_CTX",
    JSON.stringify(context)
  );

  return { eligible, eligibilityRemarks, context };
});

export const fetchClraLicenseRenewalDetails = createAsyncThunk<
  any,
  { formVSerialNo: number },
  { rejectValue: string }
>(
  "clraLicenseRenewal/fetchRenewalDetails",
  async ({ formVSerialNo }, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) return rejectWithValue("Authentication error. Please login again.");

    const res = await fetch(
      `${API_BASE}contractor-license/renewal/details?formVSerialNo=${encodeURIComponent(
        String(formVSerialNo)
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();

    if (data?.code !== 200) {
      const msg =
        data?.content?.status_remarks ||
        data?.message ||
        "Form‑V is not eligible for renewal. Please contact principal employer.";
      return rejectWithValue(msg);
    }

    return data.content || data;
  }
);

export const fetchContractorLicenseRenewalAmendmentList = createAsyncThunk<
  ClraLicenseListItem[],
  void,
  { rejectValue: string }
>("clraLicenseRenewal/fetchRenewalAmendmentList", async (_, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) return rejectWithValue("Authentication error. Please login again.");

  const res = await fetch(
    `${API_BASE}contractor-license/renewal-amendment-list`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();

  if (!data?.success || !Array.isArray(data.items)) {
    return rejectWithValue(data?.message || "Unable to load application list.");
  }

  return data.items as ClraLicenseListItem[];
});

const clraLicenseRenewalSlice = createSlice({
  name: "clraLicenseRenewal",
  initialState,
  reducers: {
    clearEligibility(state) {
      state.eligibility = { ...initialState.eligibility };
    },
    clearRenewalDetails(state) {
      state.details.renewalDetails = null;
      state.details.error = null;
    },
    clearLicenseList(state) {
      state.list = { ...initialState.list };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkClraLicenseEligibility.pending, (state) => {
        state.eligibility.status = "loading";
        state.eligibility.error = null;
      })
      .addCase(
        checkClraLicenseEligibility.fulfilled,
        (
          state,
          action: PayloadAction<{
            eligible: ClraEligibility;
            eligibilityRemarks: { renewal: string; amendment: string } | null;
            context: ClraEligibilityContext;
          }>
        ) => {
          state.eligibility.status = "succeeded";
          state.eligibility.eligible = action.payload.eligible;
          state.eligibility.eligibilityRemarks = action.payload.eligibilityRemarks;
          state.eligibility.context = action.payload.context;
          state.eligibility.error = null;
        }
      )
      .addCase(checkClraLicenseEligibility.rejected, (state, action) => {
        state.eligibility.status = "failed";
        state.eligibility.error = action.payload ?? "Unable to verify details.";
        state.eligibility.eligible = null;
        state.eligibility.eligibilityRemarks = null;
        state.eligibility.context = null;
      })
      .addCase(fetchClraLicenseRenewalDetails.pending, (state) => {
        state.details.status = "loading";
        state.details.error = null;
      })
      .addCase(fetchClraLicenseRenewalDetails.fulfilled, (state, action) => {
        state.details.status = "succeeded";
        state.details.renewalDetails = action.payload;
        state.details.error = null;
      })
      .addCase(fetchClraLicenseRenewalDetails.rejected, (state, action) => {
        state.details.status = "failed";
        state.details.renewalDetails = null;
        state.details.error = action.payload ?? "Unable to load renewal details.";
      })
      .addCase(fetchContractorLicenseRenewalAmendmentList.pending, (state) => {
        state.list.status = "loading";
        state.list.error = null;
      })
      .addCase(fetchContractorLicenseRenewalAmendmentList.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.items = action.payload;
        state.list.error = null;
      })
      .addCase(fetchContractorLicenseRenewalAmendmentList.rejected, (state, action) => {
        state.list.status = "failed";
        state.list.items = [];
        state.list.error = action.payload ?? "Unable to load application list.";
      });
  },
});

export const { clearEligibility, clearRenewalDetails, clearLicenseList } = clraLicenseRenewalSlice.actions;

export const selectClraEligibility = (state: ClraLicenseRenewalRootState) =>
  state.clraLicenseRenewal.eligibility;

export const selectClraRenewalDetails = (state: ClraLicenseRenewalRootState) =>
  state.clraLicenseRenewal.details.renewalDetails;

export const selectClraLicenseRenewalAmendmentList = (state: ClraLicenseRenewalRootState) =>
  state.clraLicenseRenewal.list;

export default clraLicenseRenewalSlice.reducer;

