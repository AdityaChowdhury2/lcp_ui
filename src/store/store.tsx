import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import clrapeReducer from "./clrapeSlice";
import contractorsReducer from "./contractorsSlice";
import epaymentsReducer from "./epaymentsSlice";
import previewReducer from "./previewSlice";
import statesReducer from "./statesSlice";
import alcClraApplicationReducer from "./alcClraApplicationSlice";
import alcClraListReducer from "./alcClraListSlice";
import clraLicenseRenewalReducer from "./clraLicenseRenewalSlice";
import contractorLicenseAmendmentReducer from "./contractorLicenseAmendmentSlice";

// 🔥 Configure Redux store with TypeScript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    clrape: clrapeReducer,
    contractors: contractorsReducer,
    epayments: epaymentsReducer,
    preview: previewReducer,
    states: statesReducer,
    alcClraApplication: alcClraApplicationReducer,
    alcClraList: alcClraListReducer,
    clraLicenseRenewal: clraLicenseRenewalReducer,
    contractorLicenseAmendment: contractorLicenseAmendmentReducer,
  },
});

// ⛳ Infer types for global Redux state
export type RootState = ReturnType<typeof store.getState>;

// ⛳ Infer type for dispatch usage
export type AppDispatch = typeof store.dispatch;

export default store;
