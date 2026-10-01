import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUserFromStorage } from "../store/authSlice";
import type { AppDispatch } from "../store/store";
import { AUTH_STORAGE_KEY } from "@/constants/constants";
import { hasValidAuthSession } from "@/utils/auth";
import { installApiAuthInterceptors } from "@/utils/apiAuth";
import { SessionTimeoutWatcher } from "./SessionTimeoutWatcher";

installApiAuthInterceptors();

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        if (!hasValidAuthSession()) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setBootstrapped(true);
          return;
        }
        const parsed = JSON.parse(saved) as { user: unknown; token: string };
        dispatch(setUserFromStorage(parsed));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setBootstrapped(true);
  }, [dispatch]);

  if (!bootstrapped) {
    // Optionally render a global loading indicator here
    return null;
  }

  return (
    <>
      {children}
      <SessionTimeoutWatcher />
    </>
  );
}