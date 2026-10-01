import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { API_BASE } from "@/constants/constants";
import type { RootState } from "./store";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface StateOption {
  id: number | string;
  name: string;
}

export interface StatesState {
  items: StateOption[];
  loading: boolean;
  error: string | null;
}

const initialState: StatesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchStates = createAsyncThunk<
  StateOption[],
  void,
  { rejectValue: string }
>("states/fetchStates", async (_, { rejectWithValue }) => {
  try {
    const token = getAuthToken();
    const { data } = await axios.get(`${API_BASE}states`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // Try to normalize common backend shapes
    const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return raw.map((s: any, index: number) => ({
      id: s.id ?? s.code ?? index,
      name: s.name ?? s.state_name ?? s.stateName ?? String(s),
    }));
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (err as Error)?.message ??
      "Failed to load states";
    return rejectWithValue(message);
  }
});

const statesSlice = createSlice({
  name: "states",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load states";
      });
  },
});

export default statesSlice.reducer;

export const selectStates = (state: RootState) => state.states.items;
export const selectStatesLoading = (state: RootState) => state.states.loading;
export const selectStatesError = (state: RootState) => state.states.error;

