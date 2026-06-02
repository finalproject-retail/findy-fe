import { SESSION_MAX_AGE_MS } from "@/constants/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeJwtPayload } from "@/lib/auth/getUserIdFromToken";

export const ACCESS_TOKEN_KEY = "findy_access_token";
const SESSION_EXPIRES_AT_KEY = "findy_session_expires_at";

function getJwtExpiresAtMs(token: string): number | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length < 2) {
      return null;
    }
    const payload = decodeJwtPayload(parts[1]!);
    const exp = payload.exp;
    if (typeof exp === "number" && Number.isFinite(exp)) {
      return exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

/** 클라이언트 세션 만료 시각 (JWT exp가 더 짧으면 그쪽을 따름) */
export function resolveSessionExpiresAtMs(token: string): number {
  const clientExpiry = Date.now() + SESSION_MAX_AGE_MS;
  const jwtExpiry = getJwtExpiresAtMs(token);
  if (jwtExpiry != null) {
    return Math.min(clientExpiry, jwtExpiry);
  }
  return clientExpiry;
}

function isSessionExpired(expiresAtMs: number | null): boolean {
  return expiresAtMs == null || !Number.isFinite(expiresAtMs) || Date.now() >= expiresAtMs;
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, SESSION_EXPIRES_AT_KEY]);
}

export async function loadStoredSession(): Promise<string | null> {
  const [token, expiresAtRaw] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(SESSION_EXPIRES_AT_KEY),
  ]);

  if (!token?.trim()) {
    return null;
  }

  const expiresAtMs = expiresAtRaw != null ? Number(expiresAtRaw) : null;

  if (isSessionExpired(expiresAtMs)) {
    await clearStoredSession();
    return null;
  }

  const jwtExpiry = getJwtExpiresAtMs(token);
  if (jwtExpiry != null && Date.now() >= jwtExpiry) {
    await clearStoredSession();
    return null;
  }

  return token;
}

export async function saveStoredSession(token: string): Promise<void> {
  const expiresAtMs = resolveSessionExpiresAtMs(token);
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, token],
    [SESSION_EXPIRES_AT_KEY, String(expiresAtMs)],
  ]);
}
