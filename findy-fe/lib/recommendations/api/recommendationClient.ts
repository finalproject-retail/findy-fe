import { getRecommendationApiBaseUrl } from "@/constants/serviceApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { attachAuthInterceptor } from "@/lib/api/attachAuthInterceptor";
import { create } from "axios";

export const recommendationApiClient = create({
  baseURL: getRecommendationApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(recommendationApiClient);
