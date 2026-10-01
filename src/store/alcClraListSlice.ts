import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { encryptionDecryptionFun } from "@/utils/encryption";
import type { RootState } from "./store";

export interface ClraListRow {
  application_id: string;
  applicantUserId: string;
  id_no: string;
  reg_no: string;
  reg_date: string;
  bmcnasez: string;
  establishment: string;
  applydate: string;
  status: string;
  highlight?: boolean;
}

export interface AlcClraListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AlcClraListState {
  items: ClraListRow[];
  meta: AlcClraListMeta;
  loading: boolean;
  error: string | null;
}

const emptyMeta: AlcClraListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const initialState: AlcClraListState = {
  items: [],
  meta: emptyMeta,
  loading: false,
  error: null,
};

interface FetchListArgs {
  statusCode: number;
  page: number;
  limit: number;
}

interface FetchListResult {
  items: ClraListRow[];
  meta: AlcClraListMeta;
}

export const fetchAlcClraList = createAsyncThunk<
  FetchListResult,
  FetchListArgs,
  { rejectValue: string }
>("alcClraList/fetch", async ({ statusCode, page, limit }, { rejectWithValue }) => {
  try {
    const token = getAuthToken();
    const encryptedType =
      encryptionDecryptionFun(
        "encrypt",
        JSON.stringify({ act_id: 1, status: statusCode })
      ) ?? "";

    const response = await axios.get(
      `${API_BASE}receivedapplications`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
        params: {
          encrypted: encryptedType,
          type: "",
          page,
          limit,
        },
      }
    );

    if (response.data?.ok === false) {
      return rejectWithValue(response.data?.message ?? "Failed to load CLRA applications");
    }

    const applications = response.data?.applications ?? [];
    const meta = response.data?.meta ?? emptyMeta;

    const mapped: ClraListRow[] = applications.map((item: any) => ({
      application_id: item.id,
      applicantUserId: item.user_id,
      id_no: item.identification_number,
      reg_no: item.registration_number
        ? String(item.registration_number)
        : "NEW APPLICATION",
      reg_date: item.registration_date
        ? new Date(item.registration_date).toLocaleDateString()
        : "",
      bmcnasez: item.block_name,
      establishment: item.unit_name,
      applydate: item.apply_date
        ? new Date(item.apply_date).toLocaleDateString()
        : "",
      status: item.status_label,
    }));

    return {
      items: mapped,
      meta: {
        page: Number(meta.page ?? page),
        limit: Number(meta.limit ?? limit),
        total: Number(meta.total ?? 0),
        totalPages: Number(meta.totalPages ?? 0),
      },
    };
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (err as Error)?.message ??
      "Failed to load CLRA applications";
    return rejectWithValue(message);
  }
});

const alcClraListSlice = createSlice({
  name: "alcClraList",
  initialState,
  reducers: {
    clearAlcClraList(state) {
      state.items = [];
      state.meta = emptyMeta;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlcClraList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlcClraList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAlcClraList.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.meta = emptyMeta;
        state.error = action.payload ?? "Failed to load CLRA applications";
      });
  },
});

export const { clearAlcClraList } = alcClraListSlice.actions;
export default alcClraListSlice.reducer;

export const selectAlcClraListState = (state: RootState) => state.alcClraList;
