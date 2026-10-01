import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { ActSelection } from "./arTypes";

/** Axios instance that attaches the applicant bearer token. */
const client = axios.create({ baseURL: `${API_BASE}annual-return-ll` });
client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface EstablishmentContext {
  estName: string;
  establishmentAddress: string;
  registeredAddress: string;
  tradeUnions: { regNo: string; name: string; address: string }[];
}

export interface ArListRow {
  id: string;
  slno: number;
  year: string;
  services: string[];
  status: "Submitted" | "Draft";
}

/** Address block returned by the self-cert particulars lookup. */
export interface PartiAddress {
  addressLine?: string;
  district?: string;
  subdivision?: string;
  areaType?: string;
  areaTypeCode?: string;
  villageWard?: string;
  policeStation?: string;
  pinCode?: string;
  state?: string;
  country?: string;
}

export interface PartiEstDetails {
  estDetails: {
    establishmentName?: string;
    phoneNumber?: string;
    emailAddress?: string;
    address?: PartiAddress;
    fullAddress?: string;
  } | null;
  peDetails: {
    employerName?: string;
    address?: PartiAddress;
    fullAddress?: string;
  } | null;
}

export interface SubmitReturnPayload {
  wizardId: string;
  year: string;
  common: Record<string, string>;
  nature: string[];
  managers: Record<string, string>[];
  particulars: Record<string, string>[];
  retrenchments: Record<string, string>[];
  pfEsi: Record<string, string>;
  acts: Record<string, Record<string, string>>;
}

export const annualReturnLLApi = {
  saveWizard: (year: string, acts: ActSelection) =>
    client
      .post<{ wizardId: string; year: string }>("/wizard", { year, acts })
      .then((r) => r.data),

  getEstablishment: () =>
    client.get<EstablishmentContext>("/establishment").then((r) => r.data),

  getList: () => client.get<ArListRow[]>("/list").then((r) => r.data),

  submit: (payload: SubmitReturnPayload) =>
    client
      .post<{ success: boolean; wizardId: string }>("/submit", payload)
      .then((r) => r.data),

  /** Download the applicant's own combined annual-return PDF as a Blob. */
  downloadPdf: (encWizardId: string) =>
    client
      .get(`/pdf/${encodeURIComponent(encWizardId)}`, { responseType: "blob" })
      .then((r) => r.data as Blob),

  /** Download the acknowledgement slip for a submitted return as a Blob. */
  downloadAcknowledgement: (encWizardId: string) =>
    client
      .get(`/acknowledgement/${encodeURIComponent(encWizardId)}`, {
        responseType: "blob",
      })
      .then((r) => r.data as Blob),

  /** Verify a registration / license number against the applicant's own records
   *  and pull the establishment + principal-employer particulars. Reuses the
   *  self-certification lookup (root path, not the annual-return-ll base). */
  verifyRegistration: (actId: number, regNo: string) =>
    axios
      .post<PartiEstDetails>(
        `${API_BASE}self-cert/parti-est-details`,
        { actId, regNo },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
      .then((r) => r.data),
};
