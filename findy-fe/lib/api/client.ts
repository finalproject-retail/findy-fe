import { API_BASE_URL, API_TIMEOUT_MS } from "@/constants/api";
import axios, { type AxiosError, isAxiosError } from "axios";

export const apiClient = axios.create({
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

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export type ApiErrorBody = {
  message?: string;
  code?: string;
};

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "요청에 실패했습니다.";
}

export function isApiError(error: unknown): error is AxiosError {
  return isAxiosError(error);
}
