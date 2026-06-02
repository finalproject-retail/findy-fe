import { getUserApiBaseUrl } from "@/constants/userApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { attachAuthInterceptor } from "@/lib/api/attachAuthInterceptor";
import { create } from "axios";

/** 로그인 후 회원 API (JWT) */
export const authenticatedUserApiClient = create({
  baseURL: getUserApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(authenticatedUserApiClient);
