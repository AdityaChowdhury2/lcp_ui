// src/routing/RequireAuth.tsx
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../store/store";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user || !token) {
    return (
      <Navigate
        to="/applicant-login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}