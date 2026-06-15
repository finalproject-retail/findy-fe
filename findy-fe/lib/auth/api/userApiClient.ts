import { getUserApiBaseUrl } from "@/constants/userApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { AxiosHeaders, create, type InternalAxiosRequestConfig } from "axios";

/** 공개 API — 만료된 JWT가 실리면 백엔드가 401을 반환할 수 있어 항상 제거 */
function stripAuthHeaders(config: InternalAxiosRequestConfig) {
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.delete("Authorization");
  headers.delete("authorization");
  headers.delete("X-User-Id");
  headers.delete("X-USER-ID");
  config.headers = headers;
  return config;
}

/**
 * 로그인·회원가입·이메일 인증 등 공개 auth API 전용.
 * JWT를 절대 붙이지 않음.
 */
export const userApiClient = create({
  baseURL: getUserApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

userApiClient.interceptors.request.use(stripAuthHeaders);
