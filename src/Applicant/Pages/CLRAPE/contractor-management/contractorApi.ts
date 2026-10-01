import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import type { Contractor } from "./constants";
import { API_BASE } from "@/constants/constants";

/** GET contractor list: {{baseURL}}/contractor ; details: {{baseURL}}/contractor/:id */
const CONTRACTOR_INFO_PATH = "contractor";

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** Raw contractor item from contractor API (snake_case) */
export interface ContractorInfoApiItem {
  id: number;
  identification_number?: string;
  name_of_contractor?: string;
  address_of_contractor?: string;
  email_of_contractor?: string;
  contractor_max_no_of_labours_on_any_day?: number;
  est_date_of_work_of_each_labour_from_date?: string;
  est_date_of_work_of_each_labour_to_date?: string;
  est_date_of_work_of_each_labour_total_months?: number;
  status?: number | string;
  state?: string | null;
  state_opts?: number | string | null;
  con_loc_e_dist?: string | null;
  con_loc_e_subdivision?: number | string | null;
  con_loc_e_areatype?: string | null;
  con_name_areatype?: number | string | null;
  con_loc_e_vill_ward?: number | string | null;
  con_l_e_ps?: string | null;
  contractor_pin?: number | string | null;
  worksite_address?: string | null;
  worksite_dist?: string | null;
  worksite_subdivision?: number | string | null;
  worksite_areatype?: string | null;
  worksite_area_code?: number | string | null;
  worksite_vill_ward?: number | string | null;
  worksite_ps?: string | null;
  worksite_pin?: number | string | null;
  nature_of_work_ids?: string[];
  other_nature_work?: string;
  /** Set when this row amends an existing contractor. */
  contractor_parent_id?: number | string | null;
  /** Form V gating, resolved server-side. */
  existed_before_amendment?: boolean;
  formv_reference_number?: string;
  can_download_form_v?: boolean;
  [key: string]: unknown;
}

export interface ContractorListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ContractorListResponse {
  data: ContractorInfoApiItem[];
  meta: ContractorListMeta;
}

/** Format ISO date to dd-mm-yyyy for display */
function formatDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return undefined;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return undefined;
  }
}

/** Map contractor API item to Contractor */
function normalizeContractorFromList(raw: ContractorInfoApiItem): Contractor {
  const fromDate = raw.est_date_of_work_of_each_labour_from_date;
  const toDate = raw.est_date_of_work_of_each_labour_to_date;
  const totalMonths = raw.est_date_of_work_of_each_labour_total_months;
  const statusValue =
    typeof raw.status === "number"
      ? raw.status
      : String(raw.status ?? "").toLowerCase() === "active"
        ? 1
        : Number(raw.status) || 0;
  const statusLabel =
    raw.status != null
      ? typeof raw.status === "number"
        ? raw.status === 1
          ? "Active"
          : "Pending"
        : String(raw.status)
      : "";
  return {
    id: Number(raw.id) || 0,
    name: String(raw.name_of_contractor ?? ""),
    address: String(raw.address_of_contractor ?? ""),
    nature: raw.nature_of_work != null ? String(raw.nature_of_work) : "",
    maxLabour: Number(raw.contractor_max_no_of_labours_on_any_day) || 0,
    status: statusValue,
    statusLabel,
    identificationNumber:
      raw.identification_number != null ? String(raw.identification_number) : undefined,
    email: raw.email_of_contractor != null ? String(raw.email_of_contractor) : undefined,
    state: raw.state != null ? String(raw.state) : undefined,
    stateName: raw.state_name != null ? String(raw.state_name) : undefined,
    stateOpts: raw.state_opts != null ? Number(raw.state_opts) : undefined,
    districtCode: raw.con_loc_e_dist != null ? String(raw.con_loc_e_dist) : undefined,
    subdivisionCode:
      raw.con_loc_e_subdivision != null ? String(raw.con_loc_e_subdivision) : undefined,
    areaType: raw.con_loc_e_areatype != null ? String(raw.con_loc_e_areatype) : undefined,
    areaCode: raw.con_name_areatype != null ? String(raw.con_name_areatype) : undefined,
    villageWardCode:
      raw.con_loc_e_vill_ward != null ? String(raw.con_loc_e_vill_ward) : undefined,
    policeStationCode: raw.con_l_e_ps != null ? String(raw.con_l_e_ps) : undefined,
    pinCode: raw.contractor_pin != null ? String(raw.contractor_pin) : undefined,
    natureOfWork: Array.isArray(raw.nature_of_work_ids) ? raw.nature_of_work_ids : [],
    otherNatureWork: raw.other_nature_work != null ? String(raw.other_nature_work) : undefined,
    employmentFrom: formatDate(fromDate),
    employmentTo: formatDate(toDate),
    totalDays: totalMonths != null ? Number(totalMonths) : undefined,
    worksiteAddress: raw.worksite_address != null ? String(raw.worksite_address) : undefined,
    worksiteDistrictCode: raw.worksite_dist != null ? String(raw.worksite_dist) : undefined,
    worksiteSubdivisionCode:
      raw.worksite_subdivision != null ? String(raw.worksite_subdivision) : undefined,
    worksiteAreaType: raw.worksite_areatype != null ? String(raw.worksite_areatype) : undefined,
    worksiteAreaCode: raw.worksite_area_code != null ? String(raw.worksite_area_code) : undefined,
    worksiteVillageWardCode:
      raw.worksite_vill_ward != null ? String(raw.worksite_vill_ward) : undefined,
    worksitePoliceStationCode: raw.worksite_ps != null ? String(raw.worksite_ps) : undefined,
    worksitePinCode: raw.worksite_pin != null ? String(raw.worksite_pin) : undefined,
    application_id: raw.application_id != null ? String(raw.application_id) : undefined,
    contractorParentId:
      raw.contractor_parent_id != null ? String(raw.contractor_parent_id) : undefined,
    formv_serial_number: raw.formv_serial_number != null ? String(raw.formv_serial_number) : (raw.id != null ? String(raw.id) : undefined),
    existedBeforeAmendment:
      raw.existed_before_amendment ??
      (raw.contractor_parent_id != null && Number(raw.contractor_parent_id) > 0),
    formvReferenceNumber:
      raw.formv_reference_number != null ? String(raw.formv_reference_number) : undefined,
    canDownloadFormV: raw.can_download_form_v ?? undefined,
  };
}

export interface CreateOrUpdateContractorPayload {
  application_id: string | number;
  identification_number?: string;
  amendment_id: string | number;
  name_of_contractor: string;
  email_of_contractor: string;
  address_of_contractor: string;
  state_opts: number;
  state: string | number;
  state_others?: string;
  con_loc_e_dist?: string;
  con_loc_e_subdivision?: number;
  con_loc_e_areatype?: string;
  con_name_areatype?: number;
  con_loc_e_vill_ward?: number;
  con_l_e_ps?: string;
  contractor_pin?: number;
  contractor_max_no_of_labours_on_any_day: number;
  est_date_of_work_of_each_labour_from_date: string;
  est_date_of_work_of_each_labour_to_date: string;
  est_date_of_work_of_each_labour_total_months: number;
  other_nature_work?: string;
  natureOfWork: string[];
  act_id?: number;
  status?: number;
  contractor_type?: number;
  // Worksite address
  worksite_address?: string;
  worksite_dist?: string;
  worksite_subdivision?: number;
  worksite_areatype?: string;
  worksite_area_code?: number;
  worksite_vill_ward?: number;
  worksite_ps?: string;
  worksite_pin?: number;
}

/**
 * Fetches contractor list from GET {{baseURL}}/contractor.
 * Supports optional pagination (page, limit).
 */
export async function fetchContractorList(params?: any): Promise<{ contractors: Contractor[]; meta: ContractorListMeta }> {
  const { data } = await axios.get<ContractorListResponse>(
    `${API_BASE}${CONTRACTOR_INFO_PATH}`,
    {
      headers: authHeaders(),
      params: params ?? {},
    }
  );
  const contractors = (data.data ?? []).map(normalizeContractorFromList);
  return { contractors, meta: data.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
}

/**
 * Fetches contractor details by id: GET {{baseURL}}/contractor/:id.
 * Used by View details page and Edit form. Response uses same shape as list item (snake_case).
 */
export async function fetchContractorDetails(id: number | string): Promise<Contractor> {
  const { data } = await axios.get<ContractorInfoApiItem>(
    `${API_BASE}${CONTRACTOR_INFO_PATH}/${id}`,
    { headers: authHeaders() }
  );
  return normalizeContractorFromList(data);
}

export async function createContractor(payload: CreateOrUpdateContractorPayload): Promise<Contractor> {
  const { data } = await axios.post<ContractorInfoApiItem>(
    `${API_BASE}${CONTRACTOR_INFO_PATH}`,
    payload,
    { headers: authHeaders() }
  );
  return normalizeContractorFromList(data);
}

export async function editContractor(
  id: number | string,
  payload: CreateOrUpdateContractorPayload
): Promise<Contractor> {
  const { data } = await axios.put<ContractorInfoApiItem>(
    `${API_BASE}${CONTRACTOR_INFO_PATH}/${id}`,
    payload,
    { headers: authHeaders() }
  );
  return normalizeContractorFromList(data);
}

export async function toggleContractorStatus(
  id: number | string,
): Promise<any> {
  const { data } = await axios.put(
    `${API_BASE}${CONTRACTOR_INFO_PATH}/toggle-status-contractor?id=${id}`,
    {},
    {
      headers: authHeaders(),
    }
  );

  return data;
}
