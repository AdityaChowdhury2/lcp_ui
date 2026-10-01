import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Contractor } from "@/Applicant/Pages/CLRAPE/contractor-management/constants";
import {
  fetchContractorDetails as fetchContractorDetailsApi,
  fetchContractorList as fetchContractorListApi,
  toggleContractorStatus as toggleContractorStatusApi,
} from "@/Applicant/Pages/CLRAPE/contractor-management/contractorApi";

/* -------------------------------------------------------------------------- */
/* Async thunks (API calls in slice)                                          */
/* -------------------------------------------------------------------------- */

export const fetchContractorDetails = createAsyncThunk<
  Contractor,
  string | number,
  { rejectValue: string }
>(
  "contractors/fetchDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchContractorDetailsApi(id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to load contractor";
      return rejectWithValue(message);
    }
  }
);

export const toggleContractorStatus = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>(
  "contractors/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      return await toggleContractorStatusApi(id);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        (err as Error)?.message ??
        "Failed to update contractor status";

      return rejectWithValue(message);
    }
  }
);

export interface FetchContractorsListParams {
  page?: number;
  limit?: number;
  applicationId?: string;
  identificationNumber?: string;
}

export const fetchContractorsList = createAsyncThunk<
  { contractors: Contractor[] },
  FetchContractorsListParams | void,
  { rejectValue: string }
>(
  "contractors/fetchList",
  async (params, { rejectWithValue }) => {
    try {
      const res = await fetchContractorListApi(params ?? undefined);

      // Use the already-transformed data from the API layer
      const mappedContractors: Contractor[] = res.contractors.map(
        (c: any) => ({
          ...c,
          nature:
            c.nature?.trim() ||
            c.other_nature_work?.trim() ||
            c.nature_of_work?.trim() ||
            "-",
          address: c.address ?? c.address_of_contractor ?? "-",
          maxLabour:
            c.maxLabour ??
            c.contractor_max_no_of_labours_on_any_day ??
            0,
          name: c.name ?? c.name_of_contractor ?? "-",
          status: c.status ?? 1,
        })
      );

      return { contractors: mappedContractors };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to load contractor list";

      return rejectWithValue(message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* State & initial                                                            */
/* -------------------------------------------------------------------------- */

export type ContractorsStatus = "idle" | "loading";

export interface ContractorsState {
  list: Contractor[];
  currentContractor: Contractor | null;
  status: ContractorsStatus;
  error: string | null;
  listStatus: ContractorsStatus;
  listError: string | null;
}

const initialState: ContractorsState = {
  list: [],
  currentContractor: null,
  status: "idle",
  error: null,
  listStatus: "idle",
  listError: null,
};

/* -------------------------------------------------------------------------- */
/* Slice                                                                      */
/* -------------------------------------------------------------------------- */

const contractorsSlice = createSlice({
  name: "contractors",
  initialState,
  reducers: {
    setContractors(state, action: PayloadAction<Contractor[]>) {
      state.list = action.payload;
    },
    addContractor(
      state,
      action: PayloadAction<Omit<Contractor, "id"> & { id?: number }>
    ) {
      const nextId =
        state.list.length > 0
          ? Math.max(...state.list.map((c) => c.id)) + 1
          : 1;
      const id = action.payload.id ?? nextId;
      state.list.push({ ...action.payload, id } as Contractor);
    },
    updateContractor(state, action: PayloadAction<Contractor>) {
      const index = state.list.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    clearContractors(state) {
      state.list = [];
    },
    clearCurrentContractor(state) {
      state.currentContractor = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractorDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchContractorDetails.fulfilled, (state, action) => {
        state.status = "idle";
        state.currentContractor = action.payload;
        state.error = null;
      })
      .addCase(fetchContractorDetails.rejected, (state, action) => {
        state.status = "idle";
        state.currentContractor = null;
        state.error = action.payload ?? "Failed to load contractor";
      })
      .addCase(fetchContractorsList.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchContractorsList.fulfilled, (state, action) => {
        state.listStatus = "idle";
        state.list = action.payload.contractors;
        state.listError = null;
      })
      .addCase(fetchContractorsList.rejected, (state, action) => {
        state.listStatus = "idle";
        state.listError = action.payload ?? "Failed to load contractor list";
      })
      .addCase(toggleContractorStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(toggleContractorStatus.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
      })
      .addCase(toggleContractorStatus.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to update contractor status";
      });
  },
});

export const {
  setContractors,
  addContractor,
  updateContractor,
  clearContractors,
  clearCurrentContractor,
} = contractorsSlice.actions;

/* -------------------------------------------------------------------------- */
/* Selectors                                                                  */
/* -------------------------------------------------------------------------- */

export interface ContractorsRootState {
  contractors: ContractorsState;
}

export const selectContractors = (state: ContractorsRootState) =>
  state.contractors.list;

export const selectCurrentContractor = (state: ContractorsRootState) =>
  state.contractors.currentContractor;

export const selectContractorsLoading = (state: ContractorsRootState) =>
  state.contractors.status === "loading";

export const selectContractorsError = (state: ContractorsRootState) =>
  state.contractors.error;

export const selectContractorsListLoading = (state: ContractorsRootState) =>
  state.contractors.listStatus === "loading";

export const selectContractorsListError = (state: ContractorsRootState) =>
  state.contractors.listError;

export default contractorsSlice.reducer;
