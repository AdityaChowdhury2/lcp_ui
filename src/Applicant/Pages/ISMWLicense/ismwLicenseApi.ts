import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

/** Authenticated axios instance for ISMW license endpoints + shared lookups. */
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Option {
  value: string;
  label: string;
}

const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};

/** All states (matches the app-wide states fetch, which does not filter by
 * country — the `country_id` column is not reliably populated). */
export async function fetchStates(_countryId = 1): Promise<Option[]> {
  const res = await api.get(`states`);
  const raw = Array.isArray(res.data?.data)
    ? res.data.data
    : Array.isArray(res.data)
    ? res.data
    : [];
  return raw.map((s: any) => ({
    value: String(s.id ?? s.code ?? ""),
    label: s.name ?? s.state_name ?? s.stateName ?? String(s),
  }));
}

/** Districts for a state (WB = 1). Value is the district_code. */
export async function fetchDistricts(stateId: string): Promise<Option[]> {
  if (!stateId) return [];
  const res = await api.get(`ismw-license/districts-by-state/${stateId}`);
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((d: any) => ({
    value: String(d.district_code),
    label: d.district_name,
  }));
}

export async function fetchSubdivisions(districtCode: string): Promise<Option[]> {
  if (!districtCode) return [];
  const res = await api.get(`subdivision/${districtCode}`);
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((s: any) => ({
    value: String(s.sub_div_code),
    label: s.sub_div_name,
  }));
}

/** Distinct area-type options derived from block_mun rows for a subdivision. */
export async function fetchAreaTypes(
  districtCode: string,
  subCode: string
): Promise<Option[]> {
  if (!districtCode || !subCode) return [];
  const res = await api.get(`areatype/${districtCode}/${subCode}`);
  const rows = Array.isArray(res.data) ? res.data : [];
  const seen = new Set<string>();
  const out: Option[] = [];
  for (const r of rows) {
    const t = String(r.type ?? "").toUpperCase();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push({ value: t, label: AREA_TYPE_LABELS[t] ?? t });
    }
  }
  return out;
}

export async function fetchBlocks(
  districtCode: string,
  subCode: string,
  areaType: string
): Promise<Option[]> {
  if (!districtCode || !subCode || !areaType) return [];
  const res = await api.get(`block/${districtCode}/${subCode}/${areaType}`);
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((b: any) => ({
    value: String(b.block_code),
    label: b.block_mun_name,
  }));
}

export async function fetchVillages(blockCode: string): Promise<Option[]> {
  if (!blockCode) return [];
  const res = await api.get(`villageward/${blockCode}`);
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((v: any) => ({
    value: String(v.village_code),
    label: v.village_name,
  }));
}

export async function fetchPoliceStations(districtCode: string): Promise<Option[]> {
  if (!districtCode) return [];
  const res = await api.get(`policestation/${districtCode}`);
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((p: any) => ({
    value: String(p.police_station_code),
    label: p.name_of_police_station,
  }));
}

export async function fetchNatureOfWork(): Promise<Option[]> {
  const res = await api.get(`ismw-license/nature-of-work`);
  const data = Array.isArray(res.data) ? res.data : [];
  return data.map((n: any) => ({ value: String(n.value), label: n.label }));
}

export interface RecruitmentContractorResponse {
  status: string;
  meta: {
    licenceId: number;
    licenceIdEnc: string;
    status: string;
    alreadyStarted: boolean;
    formSixRec: string;
    peRegistrationNumber: string;
  };
  prefill: Record<string, string>;
}

export async function fetchRecruitmentContractorInfo(
  licenceIdEnc: string
): Promise<RecruitmentContractorResponse> {
  const res = await api.get(
    `ismw-license/recruitment/contractor-info/${encodeURIComponent(licenceIdEnc)}`
  );
  return res.data;
}

export async function saveRecruitmentContractorInfo(
  payload: Record<string, unknown>
): Promise<{ status: string; route: string; message: string }> {
  const res = await api.post(`ismw-license/recruitment/contractor-info`, payload);
  return res.data;
}

/* -------------------- Employment Step 1: FORM-II -------------------- */

export interface EmploymentFormTwoResponse {
  status: string;
  meta: {
    formSixEnc: string;
    alreadyConfirmed: boolean;
    licenceStatus: string;
    licenceIdEnc: string;
  };
  establishment: {
    name: string;
    registrationNumber: string;
    registrationDate: string | null;
    address: string;
    natureOfWork: string;
    principalEmployerName: string;
    principalEmployerAddress: string;
  };
  contractor: {
    name: string;
    address: string;
    natureOfWork: string;
    maxWorkmen: number;
    dateCommencement: string | null;
    dateTermination: string | null;
  };
}

export async function fetchEmploymentFormTwo(
  formSixEnc: string
): Promise<EmploymentFormTwoResponse> {
  const res = await api.get(`ismw-license/employment/form-two/${encodeURIComponent(formSixEnc)}`);
  return res.data;
}

export async function confirmEmploymentFormTwo(
  formSixEnc: string
): Promise<{ status: string; licenceIdEnc: string; route: string; message: string }> {
  const res = await api.post(
    `ismw-license/employment/form-two/${encodeURIComponent(formSixEnc)}/confirm`
  );
  return res.data;
}

/* -------------------- Applied applications list -------------------- */

export interface IsmwApplicationRow {
  sl: number;
  id: number;
  actId: number;
  formSix: string | null;
  formSixRec: string | null;
  contractor: {
    name: string | null;
    licenceType: string | null;
    applicationDate: string | null;
  };
  establishment: {
    registrationNumber: string | null;
    issuedOn: string | null;
  };
  license:
    | string
    | { licenseNumber: string; issuedOn: string | null; validTill: string | null };
  service: string;
  status: string;
  certificate: { available: boolean; certificateId: string | null };
  moreServices: boolean;
  actions: Record<string, boolean>;
}

/** Applied ISMW applications for the logged-in contractor. EMP or REC. */
export async function fetchIsmwApplications(
  licenseType: "EMP" | "REC"
): Promise<IsmwApplicationRow[]> {
  const res = await api.get(
    `ismw-license/application-lists/applications/type/${licenseType}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

/* -------------------- Employment Step 2: Application Details -------------------- */

export interface EmploymentApplicationResponse {
  status: string;
  maxWorkmenLimit: number;
  prefill: Record<string, string>;
}

export async function fetchEmploymentApplicationDetails(
  licenceIdEnc: string
): Promise<EmploymentApplicationResponse> {
  const res = await api.get(
    `ismw-license/employment/application-details/${encodeURIComponent(licenceIdEnc)}`
  );
  return res.data;
}

export async function saveEmploymentApplicationDetails(
  payload: Record<string, unknown>
): Promise<{ status: string; route: string; message: string }> {
  const res = await api.post(`ismw-license/employment/application-details`, payload);
  return res.data;
}

/* -------------------- Employment Step 3: Owners/Directors Details -------------------- */

export interface DirectorPartnerRow {
  id: string; // encrypted
  commonEmpId: string; // encrypted
  name: string;
  designation: string;
  designationOthers: string;
  address: string;
  email: string;
  contactNumber: string;
  isActive: number;
}

export interface DirectorPartnerListResponse {
  status: string;
  employees: DirectorPartnerRow[];
}

export async function fetchDirectorPartnerList(
  licenceIdEnc: string
): Promise<DirectorPartnerListResponse> {
  const res = await api.get(
    `ismw-license/director-partner-list/${encodeURIComponent(licenceIdEnc)}`
  );
  return res.data;
}

export async function saveDirectorPartnerDetails(
  payload: Record<string, unknown>
): Promise<{ status: string; route: string; message: string }> {
  const res = await api.post(`ismw-license/director-partner`, payload);
  return res.data;
}

/* -------------------- Employment Step 4: Migrant Workmen Details -------------------- */

export interface WorkmanRow {
  id: string; // encrypted
  name: string;
  guardianName: string;
  dob: string;
  contactNumber: string;
  email: string;
  idProof: string;
  address: string;
  rawAddress: string;
  state: string;
  policeStation: string;
  pinCode: string;
  workmenType: string;
  isActive: number;
}

export interface WorkmenListResponse {
  status: string;
  workmen: WorkmanRow[];
}

export async function fetchWorkmenList(
  licenceIdEnc: string
): Promise<WorkmenListResponse> {
  const res = await api.get(
    `ismw-license/workmen-list/${encodeURIComponent(licenceIdEnc)}`
  );
  return res.data;
}

export async function fetchWorkmanDetails(
  licenceIdEnc: string,
  workmanIdEnc: string
): Promise<{ code: number; result: { workman: any } }> {
  const res = await api.get(
    `ismw-license/migrant-workmen/${encodeURIComponent(licenceIdEnc)}`,
    { params: { workmanIdEnc } }
  );
  return res.data;
}

export async function saveWorkmanDetails(
  payload: Record<string, unknown>
): Promise<{ status: string; route: string; message: string }> {
  const res = await api.post(`ismw-license/migrant-workmen`, payload);
  return res.data;
}

export async function deleteWorkman(
  licenceIdEnc: string,
  workmanIdEnc: string
): Promise<{ status: string; message: string }> {
  const res = await api.post(`ismw-license/employment/workman/delete`, {
    licenceId: licenceIdEnc,
    workmanId: workmanIdEnc,
  });
  return res.data;
}

/* -------------------- Employment Step 5: Documents Section -------------------- */

export interface UploadedDocumentsStatus {
  status: string;
  data: {
    documentsId: number;
    formSixFile: string | null;
    workOrderFile: string | null;
    tradeLicenseFile: string | null;
    addressProofFile: string | null;
    otherDocFile: string | null;
  } | null;
}

export async function fetchUploadedDocumentsStatus(
  licenceIdEnc: string
): Promise<UploadedDocumentsStatus> {
  const res = await api.get(
    `ismw-license/documents/status/${encodeURIComponent(licenceIdEnc)}`
  );
  return res.data;
}

export async function uploadLicenseDocument(payload: {
  act: string;
  applicationType: string;
  applicationId: number;
  documentCode: string;
  filename: string;
  filecontent: string;
}): Promise<{ message: string; filename: string }> {
  const res = await api.post(`documents`, payload);
  return res.data;
}

/* -------------------- Employment Step 6: Application Preview -------------------- */

export async function fetchPreviewDetails(licenceIdEnc: string): Promise<any> {
  const res = await api.get(
    `ismw-license/application-preview/${encodeURIComponent(licenceIdEnc)}`
  );
  return res.data;
}

export async function finalSubmitLicenseApplication(
  licenceIdEnc: string
): Promise<{ status: string; message: string; referenceNo: string }> {
  const res = await api.post(`ismw-license/final-submit`, { licenceId: licenceIdEnc });
  return res.data;
}

/** Fetches an uploaded supporting document (base64) for viewing. */
export async function fetchEmploymentDocument(
  licenceIdEnc: string,
  documentCode: string
): Promise<{ filename: string; mimeType: string; filecontent: string }> {
  const res = await api.get(
    `ismw-license/document/${encodeURIComponent(licenceIdEnc)}/${documentCode}`
  );
  return res.data;
}
