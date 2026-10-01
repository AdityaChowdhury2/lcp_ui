// src/routing/RequireRole.tsx
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../store/store";
import { hasValidAuthSession } from "@/utils/auth";

interface RequireRoleProps {
  allowedRoles: number[];
  children: ReactNode;
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const hasValidSession = hasValidAuthSession();

  // Not logged in at all (no user in Redux OR invalid/expired token in storage)
  if (!user || !hasValidSession) {
    const loginRedirect = location.pathname.startsWith("/bocwcess")
      ? "/bocwcess"
      : "/applicant-login";
    return (
      <Navigate
        to={loginRedirect}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const rawRole = (user as { role?: unknown } | null)?.role;
  const userRoleId =
    rawRole === null || rawRole === undefined || rawRole === ""
      ? null
      : Number(rawRole);

  if (
    userRoleId === null ||
    !Number.isFinite(userRoleId) ||
    !allowedRoles.includes(userRoleId as number)
  ) {
    const redirectPath = location.pathname.startsWith("/bocwcess")
      ? "/bocwcess"
      : "/forbidden";
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
