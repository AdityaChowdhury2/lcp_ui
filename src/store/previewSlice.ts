import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PreviewData } from "@/Applicant/Pages/CLRAPE/application-preview/previewApi";
import {
  fetchFinalPreview,
  normalizePreviewResponse,
  getDefaultPreviewData,
} from "@/Applicant/Pages/CLRAPE/application-preview/previewApi";

export interface PreviewState {
  data: PreviewData;
  loading: boolean;
  error: string | null;
  /** true when data came from API successfully, false when using default/fallback */
  dataFromApi: boolean;
  applicationId: string | null;
}

const initialState: PreviewState = {
  data: getDefaultPreviewData(),
  loading: false,
  error: null,
  dataFromApi: false,
  applicationId: null,
};

export const fetchApplicationPreview = createAsyncThunk<
  PreviewData,
  string,
  { rejectValue: string }
>("preview/fetchApplicationPreview", async (applicationId, { rejectWithValue }) => {
  try {
    const res = await fetchFinalPreview(applicationId);
    return normalizePreviewResponse(res);
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (err as Error)?.message ??
      "Failed to load preview";
    return rejectWithValue(message);
  }
});

const previewSlice = createSlice({
  name: "preview",
  initialState,
  reducers: {
    resetPreview(state) {
      state.data = getDefaultPreviewData();
      state.loading = false;
      state.error = null;
      state.dataFromApi = false;
      state.applicationId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationPreview.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.applicationId = action.meta.arg ?? null;
        state.dataFromApi = false;
      })
      .addCase(fetchApplicationPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.dataFromApi = true;
      })
      .addCase(fetchApplicationPreview.rejected, (state, action) => {
        state.loading = false;
        state.data = getDefaultPreviewData();
        state.error = action.payload ?? "Failed to load preview";
        state.dataFromApi = false;
      });
  },
});

export const { resetPreview } = previewSlice.actions;

export default previewSlice.reducer;

// Selectors
import type { RootState } from "./store";

export const selectPreviewState = (state: RootState) => state.preview;
export const selectPreviewData = (state: RootState) => state.preview.data;
export const selectPreviewLoading = (state: RootState) => state.preview.loading;
export const selectPreviewError = (state: RootState) => state.preview.error;
export const selectPreviewDataFromApi = (state: RootState) => state.preview.dataFromApi;

