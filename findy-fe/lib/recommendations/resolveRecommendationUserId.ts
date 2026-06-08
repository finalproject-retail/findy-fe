import { getAccessToken } from "@/lib/api/client";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";

/** recommendation-service 쿼리 userId (JWT sub 우선) */
export function resolveRecommendationUserId(): string {
  const fromToken = getUserIdFromAccessToken(getAccessToken());
  if (fromToken) {
    return fromToken;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_USER_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return "1";
}
