import { AUTH_STORAGE_KEY } from "@/constants/constants";
import { User } from "@/types/auth";


type AuthStorage = {
  token?: string;
  user?: User;
};

function readAuthStorage(): AuthStorage | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as AuthStorage;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** JWT `exp` as unix seconds, or null if missing/invalid. */
export function getTokenExpiresAt(token?: string | null): number | null {
  const t = token ?? getAuthToken();
  if (!t) return null;
  const payload = decodeJwtPayload(t);
  const exp = payload?.exp;
  return typeof exp === "number" ? exp : null;
}

export function getTokenSecondsRemaining(token?: string | null): number | null {
  const exp = getTokenExpiresAt(token);
  if (exp == null) return null;
  return exp - Math.floor(Date.now() / 1000);
}

export function isValidAuthToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  // Expect JWT and validate expiry if present.
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const exp = payload.exp;
  if (typeof exp !== "number") return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp > nowInSeconds;
}

export function hasValidAuthSession(): boolean {
  const parsed = readAuthStorage();
  if (!parsed?.user) return false;
  return isValidAuthToken(parsed.token);
}

export function getAuthToken(): string | null {
  const parsed = readAuthStorage();
  return parsed?.token ?? null;
}

export function getUserDetails(): User | null {
  const parsed = readAuthStorage();
  return parsed?.user ?? null;
}

export function getUserRole(): string | number | null {
  const parsed = readAuthStorage();
  return parsed?.user?.role ?? null;
}

export function getUserId(): string | null {
  const parsed = readAuthStorage();
  return parsed?.user?.uid ?? null;
}

export function getUserName(): string | null {
  const parsed = readAuthStorage();
  return parsed?.user?.name ?? null;
}