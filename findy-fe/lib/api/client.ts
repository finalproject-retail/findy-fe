import { API_BASE_URL, API_TIMEOUT_MS } from "@/constants/api";
import { attachAuthInterceptor } from "@/lib/api/attachAuthInterceptor";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { create, type AxiosError, isAxiosError } from "axios";

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let accessToken: string | null = null;

/** 로그인 연동 후 AuthContext 등에서 호출 */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

attachAuthInterceptor(apiClient);

export type ApiErrorBody = {
  message?: string;
  code?: string;
};

export function getApiErrorMessage(error: unknown): string {
  return parseApiErrorMessage(error, "요청에 실패했습니다.");
}

export function isApiError(error: unknown): error is AxiosError {
  return isAxiosError(error);
}
