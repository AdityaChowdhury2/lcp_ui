import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

/** Authenticated axios instance for the GRIPS fees-pending reconciliation endpoint. */
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Every branch the reconciliation can end on. Only `updated` means the application
 * actually moved to the next step — the rest leave it exactly as it was.
 */
export type ReconcileOutcome =
  | "updated"
  | "already_paid"
  | "grn_mismatch"
  | "not_paid"
  | "no_record"
  | "manual_review"
  | "unavailable";

export interface ReconcileResult {
  success: boolean;
  outcome: ReconcileOutcome;
  message: string;
  data?: {
    grn?: string;
    amount?: string;
    bank?: string;
    paidOn?: string;
    deptRefNo?: string;
  };
}

export async function reconcileFeesPendingByGrn(input: {
  applicationId: number;
  actId: number;
  grn: string;
  /**
   * `dd/MM/yyyy` from the challan. Optional, but GRIPS' verification service only answers
   * for the exact date it holds against the transaction — without it the server has to
   * guess forward from the day the challan was generated.
   */
  paymentDate?: string;
}): Promise<ReconcileResult> {
  const { data } = await api.post<ReconcileResult>(
    "grips/fees-pending/reconcile",
    input
  );
  return data;
}
