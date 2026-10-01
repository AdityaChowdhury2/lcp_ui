import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { API_BASE } from "@/constants/constants";
import type { Contractor } from "../contractor-management/constants";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const FINAL_PREVIEW_PATH = "clra/applications/final-preview";
const CLRA_AMENDMENT_PREVIEW_SUBMIT_PATH =
  "applicant-module/applications/amendment/clra-registration/preview-submit";

/* -------------------------------------------------------------------------- */
/* API response types (match backend)                                         */
/* -------------------------------------------------------------------------- */

export interface EstablishmentApi {
  id?: number;
  e_name?: string | null;
  est_type?: string | null;
  loc_e_name?: string | null;
  loc_e_pin_number?: string | null;
  district_name?: string | null;
  sub_div_name?: string | null;
  e_postal_address?: string | null;
  e_postal_pin_number?: string | null;
  e_nature_of_work?: string | null;
  max_num_wrkmen?: number | null;
  e_num_of_workmen_per_or_reg?: string | null;
  e_num_of_workmen_temp_or_reg?: string | null;
  con_lab_job_desc?: string | null;
  full_name_principal_emp?: string | null;
  gender_pe?: string | null;
  mobile_principal_emp?: string | null;
  address_principal_emp?: string | null;
  loc_emp_pin_number?: string | null;
  full_name_manager?: string | null;
  address_manager?: string | null;
  loc_manager_pin_number?: string | null;
  workmen_if_same_similar_kind_of_work?: number | null;
  con_lab_wage_rate_other_benefits?: string | null;
  e_settlement_award_judgement_min_wage?: string | null;
  con_lab_cat_desig_nom?: string | null;
  finalfees?: number | null;
  e_any_day_max_num_of_workmen?: string | number | null;
  /** Issue date of the registration certificate (ISO). New contractors cannot start work before this. */
  reg_certificate_issue_date?: string | null;
  [key: string]: unknown;
}

export interface ContractorApi {
  id: number;
  name_of_contractor?: string | null;
  address_of_contractor?: string | null;
  email_of_contractor?: string | null;
  contractor_max_no_of_labours_on_any_day?: number | null;
  est_date_of_work_of_each_labour_from_date?: string | null;
  est_date_of_work_of_each_labour_to_date?: string | null;
  est_date_of_work_of_each_labour_total_months?: number | null;
  contractor_type?: string | null;
  other_nature_work?: string | null;
  nature_of_work?: string | null;
  [key: string]: unknown;
}

export interface FinalPreviewResponse {
  establishment?: EstablishmentApi | null;
  similarKindOfWork?: string | null;
  natureOfWork?: string | null;
  contractors?: ContractorApi[] | null;
  documents?: Record<string, unknown> | Array<Record<string, unknown>> | null;
  tradeUnions?: Array<{ regNumber?: string; name?: string; address?: string }> | null;
  gender?: string | null;
  fees?: { total?: number; paid?: number; payable?: number } | null;
  amendmentParentId?: number | string | null;
  transactionIncomplete?: boolean;
  [key: string]: unknown;
}

export interface PreviewTableRow {
  label: string;
  value: string;
}

export interface PreviewData {
  authorizedOffice: string;
  establishmentLeftRows: PreviewTableRow[];
  establishmentRightRows: PreviewTableRow[];
  documents: Array<{
    name: string;
    status: string;
    uploaded: boolean;
    documentCode?: string;
    fileUrl?: string;
  }>;
  fees: { note: string; total: string; previous: string; payable: string };
  contractors: Contractor[];
  tradeUnions: Array<{ regNumber: string; name: string; address: string }>;
  /** Max contract labour per contractor (any day) */
  eAnyDayMaxNumOfWorkmen: string;
  /** Numeric application id from backend (when available) */
  applicationIdNumeric: number | null;
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isDocumentUploaded(doc: Record<string, unknown>): boolean {
  const uploadedValue = doc.uploaded;
  if (typeof uploadedValue === "boolean") return uploadedValue;
  if (typeof uploadedValue === "number") return uploadedValue > 0;
  if (typeof uploadedValue === "string") {
    const normalized = uploadedValue.trim().toLowerCase();
    return ["1", "true", "y", "yes", "uploaded"].includes(normalized);
  }
  return false;
}

function getDocumentFileUrl(doc: Record<string, unknown>): string | undefined {
  const urlKeys = [
    "url",
    "fileUrl",
    "file_url",
    "documentUrl",
    "document_url",
    "path",
    "filePath",
    "file_path",
    "docPath",
    "doc_path",
    "file",
    "document",
  ] as const;

  for (const key of urlKeys) {
    const value = toNonEmptyString(doc[key]);
    if (value) return value;
  }

  return undefined;
}

/** Format address line with optional PIN */
function formatAddress(addr: string | null | undefined, pin?: string | number | null): string {
  if (!addr) return "—";
  const parts = [addr];
  if (pin != null && String(pin).trim() !== "") parts.push(`PIN-${pin}`);
  return parts.join(", ");
}

/** Format ISO date to dd-mm-yyyy for display */
function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(iso);
  }
}

/** Build establishment left column rows from API establishment object */
function establishmentToLeftRows(
  est: EstablishmentApi,
  natureOfWork?: string | null
): PreviewTableRow[] {
  const locAddr = est.loc_e_name
    ? [est.loc_e_name, est.district_name, est.sub_div_name, est.loc_e_pin_number].filter(Boolean).join(", ")
    : "—";
  const postalAddr = est.e_postal_address
    ? [est.e_postal_address, est.e_postal_pin_number].filter(Boolean).join(", ")
    : "—";

  return [
    { label: "Name of the Establishment", value: est.e_name ?? "—" },
    { label: "Establishment type", value: est.est_type ? String(est.est_type) : "—" },
    { label: "Location of the Establishment", value: locAddr },
    { label: "Postal Address of the Establishment", value: postalAddr },
    { label: "Nature of Work Carried on in the Establishment", value: est.e_nature_of_work ?? natureOfWork ?? "—" },
    { label: "Maximum Number of Workmen Employed Directly", value: est.max_num_wrkmen != null ? String(est.max_num_wrkmen) : "—" },
    { label: "Number of Permanent / Regular Workmen", value: est.e_num_of_workmen_per_or_reg ?? "—" },
    { label: "Number of Temporary / Regular Workmen", value: est.e_num_of_workmen_temp_or_reg ?? "—" },
    { label: "Job description of contract labour", value: est.con_lab_job_desc ?? "—" },
  ];
}

/** Build establishment right column rows from API establishment object */
function establishmentToRightRows(
  est: EstablishmentApi,
  similarKindOfWork?: string | null,
  gender?: string | null
): PreviewTableRow[] {
  return [
    { label: "Full Name of the Principal Employer", value: est.full_name_principal_emp ?? "—" },
    { label: "Gender", value: gender ?? est.gender_pe ?? "—" },
    { label: "Mobile No.", value: est.mobile_principal_emp ?? "—" },
    {
      label: "Address of the Principal Employer",
      value: formatAddress(est.address_principal_emp ?? est.e_postal_address, est.loc_emp_pin_number ?? est.e_postal_pin_number),
    },
    { label: "Manager Responsible (Name)", value: est.full_name_manager ?? "—" },
    {
      label: "Manager Responsible (Address)",
      value: formatAddress(est.address_manager, est.loc_manager_pin_number),
    },
    { label: "Similar work by contractor?", value: similarKindOfWork ?? (est.workmen_if_same_similar_kind_of_work === 1 ? "Yes" : "No") },
    { label: "Wage rates & benefits", value: est.con_lab_wage_rate_other_benefits ?? "—" },
    { label: "Settlement / wages", value: est.e_settlement_award_judgement_min_wage ?? "—" },
    {
      label: "Maximum number of contract labour to be employed on any day through each contractor",
      value: est.e_any_day_max_num_of_workmen != null ? `${String(est.e_any_day_max_num_of_workmen)}**` : "—",
    },
    { label: "Category / designation", value: est.con_lab_cat_desig_nom ?? "—" },
  ];
}

const DEFAULT_DOCUMENT_NAMES = [
  "Trade License",
  "Article of Association / Partnership Deed",
  "Any supporting document",
  "Other registration certificates",
  "Factory License if any",
  "Form - I",
];

const DOC_NAME_TO_CODE_MAP: Record<string, string> = {
  "Trade License": "TL",
  "Article of Association / Partnership Deed": "AOA",
  "Any supporting document": "ODSC",
  "Other registration certificates": "CR",
  "Factory License if any": "FL",
  "Form - I": "FI",
};

const CLRA_PREVIEW_DOCUMENT_FIELD_MAP: Record<string, string[]> = {
  "Trade License": ["trade_license_file"],
  "Article of Association / Partnership Deed": [
    "article_of_assoc_file",
    "partnership_deed_file",
  ],
  "Any supporting document": [
    "other_doc_file",
    "memorandum_of_cert_file",
    "meomorandum_of_cert_file",
  ],
  "Other registration certificates": [
    "certificate_other_states",
    "backlog_certificate",
    "partnership_deed_file",
  ],
  "Factory License if any": ["factory_license_file"],
  "Form - I": [
    "form_1_clra_signed_pdf_file",
    "form_1_signed_pdf_file",
    "signed_pdf_file",
    "form_1_bocwa_signed_pdf_file",
  ],
};

function getFirstDocumentValue(
  docObj: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = toNonEmptyString(docObj[key]);
    if (value) return value;
  }
  return undefined;
}

function resolveDocumentCodeByName(name: string): string | undefined {
  const normalized = name.trim().toLowerCase();
  if (normalized.includes("trade license")) return "TL";
  if (normalized.includes("article") || normalized.includes("partnership deed")) return "AOA";
  if (normalized.includes("factory license")) return "FL";
  if (normalized.includes("supporting") || normalized.includes("correctness")) return "ODSC";
  if (normalized.includes("other registration") || normalized.includes("certificate")) return "CR";
  if (normalized.includes("form - i") || normalized.includes("form i")) return "FI";
  return undefined;
}

/** Map API contractor to app Contractor type */
function normalizeContractor(c: ContractorApi, index: number): Contractor {
  const fromDate = formatDate(c.est_date_of_work_of_each_labour_from_date);
  const toDate = formatDate(c.est_date_of_work_of_each_labour_to_date);
  const rawAddress = c.address_of_contractor ?? c.address;
  const address = typeof rawAddress === "string" ? rawAddress : "";

  return {
    id: c.id ?? index + 1,
    name: c.name_of_contractor ?? "",
    address,
    nature: c.nature_of_work ?? "",
    maxLabour: Number(c.contractor_max_no_of_labours_on_any_day) || 0,
    status: "Pending",
    email: c.email_of_contractor ?? undefined,
    employmentFrom: fromDate !== "—" ? fromDate : undefined,
    employmentTo: toDate !== "—" ? toDate : undefined,
    totalDays: c.est_date_of_work_of_each_labour_total_months != null ? Number(c.est_date_of_work_of_each_labour_total_months) : undefined,
  };
}

/** Default preview data when no applicationId or on error */
export function getDefaultPreviewData(): PreviewData {
  return {
    authorizedOffice: "Regional Labour Office - —",
    establishmentLeftRows: [
      { label: "Name of the Establishment", value: "—" },
      { label: "Establishment type", value: "—" },
      { label: "Location of the Establishment", value: "—" },
      { label: "Postal Address of the Establishment", value: "—" },
      { label: "Nature of Work Carried on in the Establishment", value: "—" },
      { label: "Maximum Number of Workmen Employed Directly", value: "—" },
      { label: "Number of Permanent / Regular Workmen", value: "—" },
      { label: "Number of Temporary / Regular Workmen", value: "—" },
      { label: "Job description of contract labour", value: "—" },
    ],
    establishmentRightRows: [
      { label: "Full Name of the Principal Employer", value: "—" },
      { label: "Gender", value: "—" },
      { label: "Mobile No.", value: "—" },
      { label: "Address of the Principal Employer", value: "—" },
      { label: "Manager Responsible (Name)", value: "—" },
      { label: "Manager Responsible (Address)", value: "—" },
      { label: "Similar work by contractor?", value: "—" },
      { label: "Wage rates & benefits", value: "—" },
      { label: "Settlement / wages", value: "—" },
      { label: "Maximum number of contract labour to be employed on any day through each contractor", value: "—" },
      { label: "Category / designation", value: "—" },
    ],
    documents: DEFAULT_DOCUMENT_NAMES.map((name) => ({
      name,
      status: "No Document Uploaded",
      uploaded: false,
      documentCode: DOC_NAME_TO_CODE_MAP[name],
    })),
    fees: {
      note: "Fees depend on maximum contract labour",
      total: "0",
      previous: "0",
      payable: "0",
    },
    contractors: [],
    tradeUnions: [],
    eAnyDayMaxNumOfWorkmen: "",
    applicationIdNumeric: null,
  };
}

/**
 * Normalize API response to PreviewData for the UI.
 */
export function normalizePreviewResponse(res: FinalPreviewResponse): PreviewData {
  const est = (res.establishment ?? {}) as EstablishmentApi;
  const defaultData = getDefaultPreviewData();

  const establishmentLeftRows = establishmentToLeftRows(est, res.natureOfWork);
  const establishmentRightRows = establishmentToRightRows(
    est,
    res.similarKindOfWork,
    res.gender
  );

  const documents = Array.isArray(res.documents) && res.documents.length > 0
    ? res.documents.map((d) => {
      const doc = (d ?? {}) as Record<string, unknown>;
      const fileUrl = getDocumentFileUrl(doc);
      const uploaded = isDocumentUploaded(doc) || Boolean(fileUrl);

      return {
        name: String(doc.name ?? ""),
        status: uploaded ? "Uploaded" : "No Document Uploaded",
        uploaded,
        documentCode:
          toNonEmptyString(doc.documentCode) ??
          toNonEmptyString(doc.document_code) ??
          resolveDocumentCodeByName(String(doc.name ?? "")),
        ...(fileUrl ? { fileUrl } : {}),
      };
    })
    : res.documents && typeof res.documents === "object" && !Array.isArray(res.documents)
      ? DEFAULT_DOCUMENT_NAMES.map((name) => {
        const docObj = res.documents as Record<string, unknown>;
        const matchingKeys = CLRA_PREVIEW_DOCUMENT_FIELD_MAP[name] ?? [];
        const fileValue = getFirstDocumentValue(docObj, matchingKeys);
        const looksLikeUrl =
          typeof fileValue === "string" &&
          (fileValue.startsWith("http://") ||
            fileValue.startsWith("https://") ||
            fileValue.startsWith("/"));

        return {
          name,
          status: fileValue ? "Uploaded" : "No Document Uploaded",
          uploaded: Boolean(fileValue),
          documentCode: DOC_NAME_TO_CODE_MAP[name],
          ...(looksLikeUrl ? { fileUrl: fileValue } : {}),
        };
      })
      : defaultData.documents;

  // const fees = res.fees
  //   ? {
  //     note: "Fees depend on maximum contract labour",
  //     total: String(res.fees.total ?? 0),
  //     previous: String(res.fees.paid ?? 0),
  //     payable: String(res.fees.payable ?? res.fees.total ?? 0),
  //   }
  //   : defaultData.fees;

  const fees = res.fees
    ? {
      note: "Fees depend on maximum contract labour",
      total: String(res.fees.total ?? 0),
      previous: String(res.fees.paid ?? 0),
      payable: String(
        est.finalfees ??
        res.fees.payable ??
        res.fees.total ??
        0
      ),
    }
    : defaultData.fees;

  const contractors = Array.isArray(res.contractors)
    ? res.contractors.map((c, i) => normalizeContractor(c, i))
    : defaultData.contractors;

  const tradeUnions = Array.isArray(res.tradeUnions)
    ? res.tradeUnions.map((tu) => ({
      regNumber: String((tu as { reg_number?: string; e_trade_union_regn_no?: string }).reg_number ?? (tu as { reg_number?: string; e_trade_union_regn_no?: string }).e_trade_union_regn_no ?? ""),
      name: String((tu as { e_trade_union_name?: string }).e_trade_union_name ?? ""),
      address: String((tu as { e_trade_union_address?: string }).e_trade_union_address ?? ""),
    }))
    : defaultData.tradeUnions;

  const eAnyDayMaxNumOfWorkmen = est.e_any_day_max_num_of_workmen != null &&
    String(est.e_any_day_max_num_of_workmen).trim() !== ""
    ? String(est.e_any_day_max_num_of_workmen)
    : "";

  const applicationIdNumeric = typeof est.id === "number" ? est.id : defaultData.applicationIdNumeric;

  return {
    authorizedOffice: est.sub_div_name
      ? `Regional Labour Office - ${est.sub_div_name}`
      : "Regional Labour Office - —",

    establishmentLeftRows,
    establishmentRightRows,
    documents,
    fees,
    contractors,
    tradeUnions,
    eAnyDayMaxNumOfWorkmen,
    applicationIdNumeric,
  };
}

export async function fetchDocumentByCode(params: {
  enapplicationId: string | number;
  documentCode: string;
  source?: "F" | "D";
}): Promise<{ filename?: string; filecontent?: string }> {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const { data } = await axios.get(`${API_BASE}documents`, {
    headers,
    params: {
      enapplicationId: String(params.enapplicationId),
      documentCode: params.documentCode,
      source: params.source ?? "F",
    },
  });

  return data;
}

/**
 * GET clra/applications/final-preview/{{applicationId}}
 * Sends Bearer token for authentication (avoids 401).
 */
export async function fetchFinalPreview(
  applicationId: string | number
): Promise<FinalPreviewResponse> {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const encodedApplicationId = encodeURIComponent(String(applicationId));
  const { data } = await axios.get<FinalPreviewResponse>(
    `${API_BASE}${FINAL_PREVIEW_PATH}?enapplicationId=${encodedApplicationId}`,
    { headers }
  );
  return data;
}

/**
 * POST applicant-module/applications/amendment/clra-registration/preview-submit
 * Used for final submission from the Application Preview tab (amendment flow).
 */
export async function submitClraAmendmentPreview(params: {
  applicationId: number | string;
  retFees: string;
  eAnyDayMaxNumOfWorkmen: string;
}) {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const payload = {
    application_id: params.applicationId,
    backlog_id: "",
    retFees: params.retFees,
    update_status: "N",
    e_any_day_max_num_of_workmen: params.eAnyDayMaxNumOfWorkmen,
  };

  const { data } = await axios.post(
    `${API_BASE}${CLRA_AMENDMENT_PREVIEW_SUBMIT_PATH}`,
    payload,
    { headers }
  );

  return data;
}
