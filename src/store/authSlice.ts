import { API_BASE, AUTH_STORAGE_KEY } from "@/constants/constants";
import { User } from "@/types/auth";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";


// ---------- Types ----------
export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface LoginPayload {
  name: string;
  password: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
}

export interface LoginResponse {
  status?: boolean;
  data?: LoginResponseData;
  message?: string;
  access_token?: string;
  user?: User;
  [key: string]: unknown;
}

export interface ServerErrorPayload {
  errors?: Record<string, string | string[]>;
  message?: string;
  [key: string]: unknown;
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  error: ServerErrorPayload | string | null;
}

// ---------- Async thunk ----------
export const loginUser = createAsyncThunk<
  LoginResponse, // return type
  LoginPayload, // argument type
  { rejectValue: ServerErrorPayload | { message: string } }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post<LoginResponse>(
      `${API_BASE}auth/login`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return rejectWithValue(err.response.data as ServerErrorPayload);
    }

    return rejectWithValue({
      message: (err as Error).message || "Network error",
    });
  }
});

export type MobileOtpSendPayload = { mobile: string };

export type MobileOtpSendResult = {
  status: string;
  message: string;
  encryptedOtp: string;
  expiresAt: number;
  mobile: string;
};

export type MobileOtpVerifyPayload = {
  mobile: string;
  otp: string;
  encryptedOtp: string;
  expiresAt: number;
};

export const sendLoginOtp = createAsyncThunk<
  MobileOtpSendResult,
  MobileOtpSendPayload,
  { rejectValue: ServerErrorPayload | { message: string } }
>("auth/sendLoginOtp", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post<MobileOtpSendResult>(
      `${API_BASE}auth/send-login-otp`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return rejectWithValue(err.response.data as ServerErrorPayload);
    }
    return rejectWithValue({
      message: (err as Error).message || "Failed to send OTP",
    });
  }
});

export const verifyLoginOtp = createAsyncThunk<
  LoginResponse,
  MobileOtpVerifyPayload,
  { rejectValue: ServerErrorPayload | { message: string } }
>("auth/verifyLoginOtp", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post<LoginResponse>(
      `${API_BASE}auth/verify-login-otp`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return rejectWithValue(err.response.data as ServerErrorPayload);
    }
    return rejectWithValue({
      message: (err as Error).message || "OTP verification failed",
    });
  }
});

export const sendSliOtp = createAsyncThunk<
  MobileOtpSendResult,
  MobileOtpSendPayload,
  { rejectValue: ServerErrorPayload | { message: string } }
>("auth/sendSliOtp", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post<MobileOtpSendResult>(
      `${API_BASE}auth/send-sli-login-otp`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return rejectWithValue(err.response.data as ServerErrorPayload);
    }
    return rejectWithValue({
      message: (err as Error).message || "Failed to send OTP",
    });
  }
});

export const verifySliOtp = createAsyncThunk<
  LoginResponse,
  MobileOtpVerifyPayload,
  { rejectValue: ServerErrorPayload | { message: string } }
>("auth/verifySliOtp", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post<LoginResponse>(
      `${API_BASE}auth/verify-sli-login-otp`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return rejectWithValue(err.response.data as ServerErrorPayload);
    }
    return rejectWithValue({
      message: (err as Error).message || "OTP verification failed",
    });
  }
});

// ---------- Initial state ----------
const initialState: AuthState = {
  status: "idle",
  user: null,
  token: null,
  error: null,
};

// ---------- Slice ----------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.status = "idle";
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.clear();
      sessionStorage.clear();
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
    setUserFromStorage(
      state,
      action: PayloadAction<{ user: unknown; token: string } | null>
    ) {
      const payload = action.payload;
      const user = payload?.user ?? null;
      const token = payload?.token ?? null;

      state.user = user as User | null;
      state.token = token;
      state.status = user ? "succeeded" : "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload ?? {};

        // Some backends send user/token inside `data`, others top-level.
        const user =
          (payload.data as LoginResponseData | undefined)?.user ??
          (payload as any).user ??
          null;

        const token =
          (payload.data as LoginResponseData | undefined)?.token ??
          (payload as any).access_token ??
          null;

        state.user = user;
        state.token = token;
        state.error = null;

        if (token) {
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ token, user })
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";

        if (action.payload) {
          state.error = action.payload;
        } else if (action.error?.message) {
          state.error = action.error.message;
        } else {
          state.error = "Login failed";
        }
      })
      .addCase(sendLoginOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendLoginOtp.fulfilled, (state) => {
        state.status = "idle";
        state.error = null;
      })
      .addCase(sendLoginOtp.rejected, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          state.error = action.payload;
        } else if (action.error?.message) {
          state.error = action.error.message;
        } else {
          state.error = "Failed to send OTP";
        }
      })
      .addCase(verifyLoginOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload ?? {};
        const user =
          (payload.data as LoginResponseData | undefined)?.user ??
          (payload as LoginResponse).user ??
          null;
        const token =
          (payload.data as LoginResponseData | undefined)?.token ??
          (payload as LoginResponse).access_token ??
          null;
        state.user = user;
        state.token = token;
        state.error = null;
        if (token) {
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ token, user }),
          );
        }
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.status = "failed";
        if (action.payload) {
          state.error = action.payload;
        } else if (action.error?.message) {
          state.error = action.error.message;
        } else {
          state.error = "OTP verification failed";
        }
      })
      .addCase(sendSliOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendSliOtp.fulfilled, (state) => {
        state.status = "idle";
        state.error = null;
      })
      .addCase(sendSliOtp.rejected, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          state.error = action.payload;
        } else if (action.error?.message) {
          state.error = action.error.message;
        } else {
          state.error = "Failed to send OTP";
        }
      })
      .addCase(verifySliOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifySliOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        const payload = action.payload ?? {};
        const user =
          (payload.data as LoginResponseData | undefined)?.user ??
          (payload as LoginResponse).user ??
          null;
        const token =
          (payload.data as LoginResponseData | undefined)?.token ??
          (payload as LoginResponse).access_token ??
          null;
        state.user = user;
        state.token = token;
        state.error = null;
        if (token) {
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ token, user }),
          );
        }
      })
      .addCase(verifySliOtp.rejected, (state, action) => {
        state.status = "failed";
        if (action.payload) {
          state.error = action.payload;
        } else if (action.error?.message) {
          state.error = action.error.message;
        } else {
          state.error = "OTP verification failed";
        }
      });
  },
});

export const { logout, clearAuthError, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
