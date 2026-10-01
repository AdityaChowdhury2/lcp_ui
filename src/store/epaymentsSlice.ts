import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import type { RootState } from "./store";

// ---------- Types ----------
export interface EpaymentsPreviewData {
  applicationId: number;
  actId: number;
  payableAmount: number;
  totalFees: number;
  preFees: number;
  /** Sent when the act charges more than one head (e.g. a new contractor licence). */
  licenceFees?: number;
  securityDeposit?: number;
  applicantName: string;
  depositorMobile: string;
  depositorEmail: string;
  actName: string;
  serviceName: string;
  paymentModes: { value: string; label: string }[];
}

export interface InitiateEpaymentResponse {
  actionUrl: string;
  formData: Record<string, string>;
}

export interface EpaymentsState {
  preview: EpaymentsPreviewData | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  paymentMode: string;
}

// ---------- Async thunks ----------
export const fetchEpaymentsPreview = createAsyncThunk<
  EpaymentsPreviewData,
  { applicationIdEnc: string; actIdEnc: string },
  { rejectValue: string }
>(
  "epayments/fetchPreview",
  async ({ applicationIdEnc, actIdEnc }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_BASE}applicant-module/epayments/preview`,
        {
          params: { applicationId: applicationIdEnc, actId: actIdEnc },
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data as EpaymentsPreviewData;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = (err.response.data as { message?: string }).message;
        return rejectWithValue(msg ?? "Failed to load payment preview.");
      }
      return rejectWithValue(
        (err as Error)?.message ?? "Failed to load payment preview."
      );
    }
  }
);

export const initiateEpayment = createAsyncThunk<
  InitiateEpaymentResponse,
  {
    applicationId: number;
    actId: number;
    paymentMode: string;
  },
  { rejectValue: string }
>(
  "epayments/initiate",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post<InitiateEpaymentResponse>(
        `${API_BASE}applicant-module/epayments/initiate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
      if (!data?.actionUrl || !data?.formData) {
        return rejectWithValue("Invalid response from server.");
      }
      return data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = (err.response.data as { message?: string }).message;
        return rejectWithValue(msg ?? "Failed to initiate payment.");
      }
      return rejectWithValue(
        (err as Error)?.message ?? "Failed to initiate payment."
      );
    }
  }
);

// ---------- Initial state ----------
const initialState: EpaymentsState = {
  preview: null,
  loading: false,
  submitting: false,
  error: null,
  paymentMode: "1",
};

// ---------- Slice ----------
const epaymentsSlice = createSlice({
  name: "epayments",
  initialState,
  reducers: {
    setPaymentMode(state, action: PayloadAction<string>) {
      state.paymentMode = action.payload;
    },
    clearEpayments(state) {
      state.preview = null;
      state.error = null;
      state.loading = false;
      state.submitting = false;
      state.paymentMode = "1";
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPreview
      .addCase(fetchEpaymentsPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEpaymentsPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
        state.error = null;
        const modes = action.payload.paymentModes;
        if (modes?.length) state.paymentMode = modes[0].value;
      })
      .addCase(fetchEpaymentsPreview.rejected, (state, action) => {
        state.loading = false;
        state.preview = null;
        state.error = action.payload ?? "Failed to load payment preview.";
      })
      // initiate
      .addCase(initiateEpayment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(initiateEpayment.fulfilled, (state) => {
        state.submitting = true; // keep true until form navigates away
      })
      .addCase(initiateEpayment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to initiate payment.";
      });
  },
});

export const { setPaymentMode, clearEpayments } = epaymentsSlice.actions;
export default epaymentsSlice.reducer;

// ---------- Selectors ----------
export const selectEpaymentsPreview = (state: RootState) =>
  state.epayments.preview;
export const selectEpaymentsLoading = (state: RootState) =>
  state.epayments.loading;
export const selectEpaymentsSubmitting = (state: RootState) =>
  state.epayments.submitting;
export const selectEpaymentsError = (state: RootState) => state.epayments.error;
export const selectEpaymentsPaymentMode = (state: RootState) =>
  state.epayments.paymentMode;
