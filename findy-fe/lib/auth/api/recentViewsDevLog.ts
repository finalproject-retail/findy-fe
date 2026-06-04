import { getUserApiBaseUrl } from "@/constants/userApi";
import { getAccessToken } from "@/lib/api/client";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import { isAxiosError } from "axios";

/** Metro/Expo 콘솔에서 최근 본 상품 API 요청 값 확인용 */
export function logRecentViewsRequest(
  method: "GET" | "POST",
  extra?: { body?: unknown },
) {
  if (!__DEV__) {
    return;
  }

  const headers = buildUserApiHeaders();
  const xUserId = headers["X-USER-ID"];
  const token = getAccessToken();
  const base = getUserApiBaseUrl();

  console.log("[recent-views]", {
    method,
    url: `${base}/api/v1/users/me/recent-views`,
    headers: {
      "X-USER-ID": xUserId ?? "(없음 — JWT에서 userId 추출 실패)",
      Authorization: token ? `Bearer ${token.slice(0, 12)}…` : "(없음)",
    },
    ...extra,
  });
}

export function logRecentViewsError(method: "GET" | "POST", error: unknown) {
  if (!__DEV__) {
    return;
  }

  if (isAxiosError(error)) {
    console.warn("[recent-views] error", {
      method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return;
  }

  console.warn("[recent-views] error", { method, error });
}
