import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import type { RootState } from "./store";

interface FetchArgs {
  applicationId: string;
  applicantUserId: string;
}

export interface AlcClraApplicationState {
  application: any | null;
  remarks: any[];
  remarkOptions: Record<string, string>;
  loading: boolean;
  remarksLoading: boolean;
  actionsLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: AlcClraApplicationState = {
  application: null,
  remarks: [],
  remarkOptions: {},
  loading: false,
  remarksLoading: false,
  actionsLoading: false,
  submitting: false,
  error: null,
};

export const fetchAlcClraApplication = createAsyncThunk<
  any,
  FetchArgs,
  { rejectValue: string }
>("alcClraApplication/fetchApplication", async (args, { rejectWithValue }) => {
  try {
    const token = getAuthToken();
    const res = await axios.get(
      `${API_BASE}clra/applications/${args.applicationId}/${args.applicantUserId}/general-details`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return res.data;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (err as Error)?.message ??
      "Failed to load application details";
    return rejectWithValue(message);
  }
});

export const fetchAlcClraRemarks = createAsyncThunk<
  any[],
  FetchArgs,
  { rejectValue: string }
>("alcClraApplication/fetchRemarks", async (args, { rejectWithValue }) => {
  try {
    const token = getAuthToken();
    const res = await axios.get(
      `${API_BASE}clra/applications/${args.applicationId}/${args.applicantUserId}/remarks`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (err as Error)?.message ??
      "Failed to load remarks";
    return rejectWithValue(message);
  }
});

export const fetchAlcClraActions = createAsyncThunk<
  Record<string, string>,
  FetchArgs,
  { rejectValue: string }
>("alcClraApplication/fetchActions", async (args, { rejectWithValue }) => {
  try {
    const token = getAuthToken();
    const res = await axios.get(
      `${API_BASE}clra/${args.applicationId}/${args.applicantUserId}/alc/actions`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return (res.data ?? {}) as Record<string, string>;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (err as Error)?.message ??
      "Failed to load actions";
    return rejectWithValue(message);
  }
});

interface SubmitPayload {
  applicationId: string;
  applicantUserId: string;
  alcUserId: string | null;
  remarkType: string;
  remarksText: string;
  fieldname: string;
  signedCertificateFileId: number;
}

export const submitAlcClraAction = createAsyncThunk<
  any,
  SubmitPayload,
  { rejectValue: string }
>("alcClraApplication/submitAction", async (payload, { rejectWithValue }) => {
  try {
    const token = getAuthToken();
    const res = await axios.post(`${API_BASE}clra/amendment/submit`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (err as Error)?.message ??
      "Failed to submit action";
    return rejectWithValue(message);
  }
});

const alcClraApplicationSlice = createSlice({
  name: "alcClraApplication",
  initialState,
  reducers: {
    clearAlcClraApplication(state) {
      state.application = null;
      state.remarks = [];
      state.remarkOptions = {};
      state.loading = false;
      state.remarksLoading = false;
      state.actionsLoading = false;
      state.submitting = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlcClraApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlcClraApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
      })
      .addCase(fetchAlcClraApplication.rejected, (state, action) => {
        state.loading = false;
        state.application = null;
        state.error = action.payload ?? "Failed to load application details";
      })
      .addCase(fetchAlcClraRemarks.pending, (state) => {
        state.remarksLoading = true;
      })
      .addCase(fetchAlcClraRemarks.fulfilled, (state, action) => {
        state.remarksLoading = false;
        state.remarks = action.payload;
      })
      .addCase(fetchAlcClraRemarks.rejected, (state) => {
        state.remarksLoading = false;
        state.remarks = [];
      })
      .addCase(fetchAlcClraActions.pending, (state) => {
        state.actionsLoading = true;
      })
      .addCase(fetchAlcClraActions.fulfilled, (state, action) => {
        state.actionsLoading = false;
        state.remarkOptions = action.payload ?? {};
      })
      .addCase(fetchAlcClraActions.rejected, (state) => {
        state.actionsLoading = false;
        state.remarkOptions = {};
      })
      .addCase(submitAlcClraAction.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitAlcClraAction.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitAlcClraAction.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Failed to submit action";
      });
  },
});

export const { clearAlcClraApplication } = alcClraApplicationSlice.actions;
export default alcClraApplicationSlice.reducer;

export const selectAlcClraApplicationState = (state: RootState) =>
  state.alcClraApplication;

