import { API_TIMEOUT_MS } from "@/constants/api";
import { getAnalyticsApiBaseUrl } from "@/constants/serviceApi";
import { attachAuthInterceptor } from "@/lib/api/attachAuthInterceptor";
import { create } from "axios";

/** 관리자 분석 API (JWT) */
export const analyticsApiClient = create({
  baseURL: getAnalyticsApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(analyticsApiClient);
