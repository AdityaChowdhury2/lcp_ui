import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { API_BASE, AUTH_STORAGE_KEY } from "@/constants/constants";
import type { RootState } from "@/store/store";
import { logout, setUserFromStorage } from "@/store/authSlice";
import {
  getAuthToken,
  getTokenSecondsRemaining,
  getUserDetails,
} from "@/utils/auth";
import type { User } from "@/types/auth";

const WARN_WITHIN_SECONDS = 120;

/**
 * Banking-style session watcher: when the JWT is within 2 minutes of expiry,
 * show a continue/logout modal with a countdown. Continue refreshes the token.
 */
export function SessionTimeoutWatcher() {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);

  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARN_WITHIN_SECONDS);
  const [refreshing, setRefreshing] = useState(false);
  const loggingOutRef = useRef(false);

  const forceLogout = useCallback(() => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setOpen(false);
    dispatch(logout());
    const path = window.location.pathname || "";
    const loginPath = path.includes("employee")
      ? "/employee-login"
      : "/applicant-login";
    window.location.assign(loginPath);
  }, [dispatch]);

  const handleContinue = useCallback(async () => {
    try {
      setRefreshing(true);
      const current = getAuthToken();
      if (!current) {
        forceLogout();
        return;
      }
      const res = await axios.post(
        `${API_BASE}auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${current}` } },
      );
      const accessToken =
        res.data?.access_token ?? res.data?.data?.token ?? null;
      const nextUser = (res.data?.user ??
        res.data?.data?.user ??
        getUserDetails()) as User | null;
      if (!accessToken || !nextUser) {
        forceLogout();
        return;
      }
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ token: accessToken, user: nextUser }),
      );
      dispatch(setUserFromStorage({ token: accessToken, user: nextUser }));
      setOpen(false);
      setSecondsLeft(WARN_WITHIN_SECONDS);
      loggingOutRef.current = false;
    } catch {
      forceLogout();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, forceLogout]);

  useEffect(() => {
    if (!token || !user) {
      setOpen(false);
      return;
    }

    const check = () => {
      // Prefer live localStorage token after refresh; fall back to Redux token
      const remaining = getTokenSecondsRemaining(getAuthToken() ?? token);
      if (remaining == null) return;
      if (remaining <= 0) {
        forceLogout();
        return;
      }
      if (remaining <= WARN_WITHIN_SECONDS) {
        setOpen(true);
        setSecondsLeft(remaining);
      } else {
        setOpen(false);
      }
    };

    check();
    const id = window.setInterval(check, 1000);
    return () => window.clearInterval(id);
  }, [token, user, forceLogout]);

  if (!open || !user) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 p-6"
      >
        <h2
          id="session-timeout-title"
          className="text-lg font-semibold text-slate-900"
        >
          Session expiring
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Your session will end in{" "}
          <span className="font-semibold tabular-nums text-rose-700">
            {mm}:{ss}
          </span>
          . Continue to stay signed in, or you will be logged out automatically.
        </p>
        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            disabled={refreshing}
            onClick={handleContinue}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {refreshing ? "Continuing…" : "Continue session"}
          </button>
        </div>
      </div>
    </div>
  );
}
