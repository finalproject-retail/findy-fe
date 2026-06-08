import { getAccessToken } from "@/lib/api/client";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";

type BuildUserApiHeadersOptions = {
  includeJsonContentType?: boolean;
};

/** JWT + 사용자 ID 헤더 (게이트웨이 X-User-Id / 레거시 X-USER-ID) */
export function buildUserApiHeaders(
  options: BuildUserApiHeadersOptions = {},
): Record<string, string> {
  const { includeJsonContentType = false } = options;
  const token = getAccessToken();
  const userId = getUserIdFromAccessToken(token);
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    headers["X-User-Id"] = userId;
    headers["X-USER-ID"] = userId;
  }
  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function requireAccessToken(): string {
  const token = getAccessToken();
  if (!token) {
    throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
  }
  return token;
}

export function buildAuthenticatedApiHeaders(
  options: BuildUserApiHeadersOptions = {},
): Record<string, string> {
  requireAccessToken();
  return buildUserApiHeaders(options);
}
