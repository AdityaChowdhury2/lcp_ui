import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { store } from "@/store/store";
import { logout } from "@/store/authSlice";

let installed = false;
let loggingOut = false;

/**
 * Attach Bearer JWT to all axios requests and force logout on 401
 * when a session token was present (expired / invalid).
 */
export function installApiAuthInterceptors() {
  if (installed) return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const hadToken = !!getAuthToken();
      const url = String(error?.config?.url || "");
      const isPublicAuth =
        url.includes("/auth/login") ||
        url.includes("/auth/verify-login-otp") ||
        url.includes("/auth/send-login-otp") ||
        url.includes("/auth/verify-sli-login-otp") ||
        url.includes("/auth/send-sli-login-otp") ||
        url.includes("/auth/applicant-register") ||
        url.includes("/auth/register") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password");

      if (status === 401 && hadToken && !isPublicAuth && !loggingOut) {
        loggingOut = true;
        store.dispatch(logout());
        const path = window.location.pathname || "";
        const loginPath = path.includes("applicant") || path.includes("otp")
          ? "/applicant-login"
          : path.includes("employee")
            ? "/employee-login"
            : "/applicant-login";
        window.location.assign(loginPath);
      }
      return Promise.reject(error);
    },
  );
}
