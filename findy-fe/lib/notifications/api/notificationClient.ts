import { getRecommendationApiBaseUrl } from "@/constants/serviceApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { attachAuthInterceptor } from "@/lib/api/attachAuthInterceptor";
import { create } from "axios";

/**
 * recommendation-service 알림 API
 * - userId 쿼리 필수
 * - 8080 게이트웨이 경유 시 JWT 필요 → Bearer 자동 첨부
 * - 8886 직접 호출 시에도 토큰 전송해도 recommendation-service는 무시(permitAll)
 */
export const notificationApiClient = create({
  baseURL: getRecommendationApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(notificationApiClient);
