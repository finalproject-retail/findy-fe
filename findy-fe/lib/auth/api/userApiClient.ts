import { getUserApiBaseUrl } from "@/constants/userApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { create } from "axios";

/**
 * 로그인·회원가입 등 공개 auth API 전용.
 * Authorization 인터셉터를 붙이지 않음 — 만료된 토큰이 실리면 403이 날 수 있음.
 */
export const userApiClient = create({
  baseURL: getUserApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
