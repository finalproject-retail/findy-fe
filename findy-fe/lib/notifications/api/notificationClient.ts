import { getRecommendationApiBaseUrl } from "@/constants/serviceApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { create } from "axios";

/** recommendation-service 알림 API — 인증 없음, userId 쿼리만 */
export const notificationApiClient = create({
  baseURL: getRecommendationApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
