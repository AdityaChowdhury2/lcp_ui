import { createSlice } from "@reduxjs/toolkit";

/** Placeholder for other CLRAPE amendment state (e.g. trade unions). Contractors live in contractorsSlice. */
export interface ClrapeState {
  _placeholder?: unknown;
}

const initialState: ClrapeState = {};

const clrapeSlice = createSlice({
  name: "clrape",
  initialState,
  reducers: {},
});

export default clrapeSlice.reducer;
