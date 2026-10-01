import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import {
  parseClraLicenseRenewalAmendmentCtx,
  type ClraEligibilityContext,
} from "@/store/clraLicenseRenewalSlice";
import { mergeAmendmentApplySessionFromPreview } from "@/utils/amendmentApplyRoute";

export type ContractorLicenseAmendmentDetailsStatus = "idle" | "loading" | "succeeded" | "failed";

/** Scalar values returned on amendment details preview (API may use string or number). */
export type ContractorLicenseAmendmentDetailValue = string | number | boolean | null | undefined;

/**
 * `GET contractor-license/amendment/details` preview (snake_case). All optional; extra API keys allowed.
 */
export interface ContractorLicenseAmendmentDetails {
  category_of_contractor?: ContractorLicenseAmendmentDetailValue;
  category_designation?: ContractorLicenseAmendmentDetailValue;
  name_of_contractor?: ContractorLicenseAmendmentDetailValue;
  address_of_contractor?: ContractorLicenseAmendmentDetailValue;
  contractor_dist?: ContractorLicenseAmendmentDetailValue;
  contractor_subdivision?: ContractorLicenseAmendmentDetailValue;
  contractor_areatype?: ContractorLicenseAmendmentDetailValue;
  contractor_name_areatype?: ContractorLicenseAmendmentDetailValue;
  contractor_vill_ward?: ContractorLicenseAmendmentDetailValue;
  contractor_ps?: ContractorLicenseAmendmentDetailValue;
  contractor_pin?: ContractorLicenseAmendmentDetailValue;
  contractor_state?: ContractorLicenseAmendmentDetailValue;
  contrcator_country?: ContractorLicenseAmendmentDetailValue;
  father_contarctor_name?: ContractorLicenseAmendmentDetailValue;
  dob_contractor?: ContractorLicenseAmendmentDetailValue;
  age_contractor?: ContractorLicenseAmendmentDetailValue;
  remark_type?: ContractorLicenseAmendmentDetailValue;
  remark_field_title?: ContractorLicenseAmendmentDetailValue;
  name_of_agent?: ContractorLicenseAmendmentDetailValue;
  address_of_manager?: ContractorLicenseAmendmentDetailValue;
  contractor_manager_dist?: ContractorLicenseAmendmentDetailValue;
  contractor_manager_subdivision?: ContractorLicenseAmendmentDetailValue;
  contractor_manager_ps?: ContractorLicenseAmendmentDetailValue;
  manager_pin?: ContractorLicenseAmendmentDetailValue;
  contractor_max_no_of_labours_on_any_day?: ContractorLicenseAmendmentDetailValue;
  is_coparative?: ContractorLicenseAmendmentDetailValue;
  unskilled_rate_wages?: ContractorLicenseAmendmentDetailValue;
  semiskilled_rate_wages?: ContractorLicenseAmendmentDetailValue;
  skilled_rate_wages?: ContractorLicenseAmendmentDetailValue;
  highlyskilled_rate_wages?: ContractorLicenseAmendmentDetailValue;
  hours_work?: ContractorLicenseAmendmentDetailValue;
  spred_over?: ContractorLicenseAmendmentDetailValue;
  overtime?: ContractorLicenseAmendmentDetailValue;
  overtime_wages?: ContractorLicenseAmendmentDetailValue;
  weekly_holiday?: ContractorLicenseAmendmentDetailValue;
  no_holiday?: ContractorLicenseAmendmentDetailValue;
  holiday_wages?: ContractorLicenseAmendmentDetailValue;
  annual_leave_no?: ContractorLicenseAmendmentDetailValue;
  casual_leave_no?: ContractorLicenseAmendmentDetailValue;
  sick_leave_no?: ContractorLicenseAmendmentDetailValue;
  maternity_leave_no?: ContractorLicenseAmendmentDetailValue;
  earned_leave_no?: ContractorLicenseAmendmentDetailValue;
  other_leave_no?: ContractorLicenseAmendmentDetailValue;
  special_benifites?: ContractorLicenseAmendmentDetailValue;
  state_insurance?: ContractorLicenseAmendmentDetailValue;
  miscellaneous_provisions?: ContractorLicenseAmendmentDetailValue;
  contractor_convicted?: ContractorLicenseAmendmentDetailValue;
  details_contractor_convicted?: ContractorLicenseAmendmentDetailValue;
  contractor_previous_employer?: ContractorLicenseAmendmentDetailValue;
  details_previous_employer?: ContractorLicenseAmendmentDetailValue;
  contractor_revoking?: ContractorLicenseAmendmentDetailValue;
  details_contractor_revoking?: ContractorLicenseAmendmentDetailValue;
  worksite_address_line?: ContractorLicenseAmendmentDetailValue;
  reason_changing_worksite?: ContractorLicenseAmendmentDetailValue;
  worksite_dist?: ContractorLicenseAmendmentDetailValue;
  worksite_subdivision?: ContractorLicenseAmendmentDetailValue;
  work_site_areatype?: ContractorLicenseAmendmentDetailValue;
  name_work_site_areatype?: ContractorLicenseAmendmentDetailValue;
  work_site_vill_ward?: ContractorLicenseAmendmentDetailValue;
  worksite_ps?: ContractorLicenseAmendmentDetailValue;
  worksite_pin?: ContractorLicenseAmendmentDetailValue;
  [key: string]: ContractorLicenseAmendmentDetailValue;
}

export interface ContractorLicenseAmendmentState {
  /** Flow identifiers mirrored from session / eligibility / apply preview (single source in Redux for amendment routes). */
  context: ClraEligibilityContext | null;
  amendmentDetails: ContractorLicenseAmendmentDetails | null;
  amendmentDetailsStatus: ContractorLicenseAmendmentDetailsStatus;
  amendmentDetailsError: string | null;
  documentFetchStatus: ContractorLicenseAmendmentDetailsStatus;
  documentFetchError: string | null;
}

const initialState: ContractorLicenseAmendmentState = {
  context: null,
  amendmentDetails: null,
  amendmentDetailsStatus: "idle",
  amendmentDetailsError: null,
  documentFetchStatus: "idle",
  documentFetchError: null,
};

export const fetchContractorLicenseAmendmentDetails = createAsyncThunk<
  ContractorLicenseAmendmentDetails,
  { formVSerialNo: number; renewalApplicationId?: number | null },
  { rejectValue: string }
>(
  "contractorLicenseAmendment/fetchDetails",
  async ({ formVSerialNo, renewalApplicationId }, { dispatch, rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) return rejectWithValue("Authentication error. Please login again.");
  const q = new URLSearchParams({ formVSerialNo: String(formVSerialNo) });
  const resolvedRenewalId =
    renewalApplicationId ??
    parseClraLicenseRenewalAmendmentCtx()?.renewalApplicationId ??
    null;
  if (
    resolvedRenewalId != null &&
    Number.isFinite(Number(resolvedRenewalId)) &&
    Number(resolvedRenewalId) > 0
  ) {
    q.set("renewalApplicationId", String(Math.trunc(Number(resolvedRenewalId))));
  }

  const res = await fetch(
    `${API_BASE}contractor-license/amendment/details?${q.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  const code = data?.code;
  const ok = code === 200 || code === "200" || Number(code) === 200;
  if (!ok) {
    const msg =
      data?.content?.status_remarks ||
      data?.message ||
      "Form‑V is not eligible for amendment. Please contact principal employer.";
    return rejectWithValue(msg);
  }

  let inner = data?.content ?? data;
  if (inner && typeof inner === "object" && "content" in inner && inner.content != null) {
    inner = inner.content;
  }

  mergeAmendmentApplySessionFromPreview(inner as Record<string, unknown>);
  const ctx = parseClraLicenseRenewalAmendmentCtx();
  if (ctx) dispatch(replaceContractorLicenseAmendmentContext(ctx));

  return inner as ContractorLicenseAmendmentDetails;
});

export const fetchContractorLicenseAmendmentFileManagedDocument = createAsyncThunk<
  { filename: string; blobUrl: string },
  { fid: string },
  { rejectValue: string }
>(
  "contractorLicenseAmendment/fetchFileManagedDocument",
  async ({ fid }, { rejectWithValue }) => {
    const token = getAuthToken();
    if (!token) return rejectWithValue("Authentication error. Please login again.");

    const res = await fetch(`${API_BASE}documents/file-managed/${encodeURIComponent(fid)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.message || `Unable to fetch document (HTTP ${res.status}).`;
      return rejectWithValue(typeof msg === "string" ? msg : "Unable to fetch document.");
    }

    const filecontent = data?.filecontent;
    if (!filecontent || typeof filecontent !== "string") {
      return rejectWithValue("File content not available.");
    }

    const byteCharacters = atob(filecontent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    return {
      filename: String(data?.filename || `${fid}.pdf`),
      blobUrl: URL.createObjectURL(blob),
    };
  }
);

const contractorLicenseAmendmentSlice = createSlice({
  name: "contractorLicenseAmendment",
  initialState,
  reducers: {
    replaceContractorLicenseAmendmentContext(state, action: PayloadAction<ClraEligibilityContext | null>) {
      state.context = action.payload;
    },
    clearContractorLicenseAmendmentFlow(state) {
      state.context = null;
      state.amendmentDetails = null;
      state.amendmentDetailsStatus = "idle";
      state.amendmentDetailsError = null;
      state.documentFetchStatus = "idle";
      state.documentFetchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractorLicenseAmendmentDetails.pending, (state) => {
        state.amendmentDetailsStatus = "loading";
        state.amendmentDetailsError = null;
      })
      .addCase(fetchContractorLicenseAmendmentDetails.fulfilled, (state, action) => {
        state.amendmentDetailsStatus = "succeeded";
        state.amendmentDetails = action.payload;
        state.amendmentDetailsError = null;
      })
      .addCase(fetchContractorLicenseAmendmentDetails.rejected, (state, action) => {
        state.amendmentDetailsStatus = "failed";
        state.amendmentDetails = null;
        state.amendmentDetailsError = action.payload ?? "Unable to load amendment details.";
      })
      .addCase(fetchContractorLicenseAmendmentFileManagedDocument.pending, (state) => {
        state.documentFetchStatus = "loading";
        state.documentFetchError = null;
      })
      .addCase(fetchContractorLicenseAmendmentFileManagedDocument.fulfilled, (state) => {
        state.documentFetchStatus = "succeeded";
        state.documentFetchError = null;
      })
      .addCase(fetchContractorLicenseAmendmentFileManagedDocument.rejected, (state, action) => {
        state.documentFetchStatus = "failed";
        state.documentFetchError = action.payload ?? "Unable to fetch document.";
      });
  },
});

export const { replaceContractorLicenseAmendmentContext, clearContractorLicenseAmendmentFlow } =
  contractorLicenseAmendmentSlice.actions;

/** Narrow root state shape for selectors (compatible with full `RootState`). */
export type ContractorLicenseAmendmentRootState = { contractorLicenseAmendment: ContractorLicenseAmendmentState };

export const selectContractorLicenseAmendmentContext = (state: ContractorLicenseAmendmentRootState) =>
  state.contractorLicenseAmendment.context;

export const selectContractorLicenseAmendmentDetails = (state: ContractorLicenseAmendmentRootState) =>
  state.contractorLicenseAmendment.amendmentDetails;

export const selectContractorLicenseAmendmentDetailsStatus = (state: ContractorLicenseAmendmentRootState) =>
  state.contractorLicenseAmendment.amendmentDetailsStatus;

export const selectContractorLicenseAmendmentDetailsError = (state: ContractorLicenseAmendmentRootState) =>
  state.contractorLicenseAmendment.amendmentDetailsError;

export const selectContractorLicenseAmendmentDocumentFetchStatus = (state: ContractorLicenseAmendmentRootState) =>
  state.contractorLicenseAmendment.documentFetchStatus;

export const selectContractorLicenseAmendmentDocumentFetchError = (state: ContractorLicenseAmendmentRootState) =>
  state.contractorLicenseAmendment.documentFetchError;

export default contractorLicenseAmendmentSlice.reducer;
