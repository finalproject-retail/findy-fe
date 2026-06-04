import { getAccessToken } from "@/lib/api/client";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";

/** 알림 API — JWT 없이 userId 쿼리만 사용 */
export function resolveNotificationUserId(): string | null {
  const fromToken = getUserIdFromAccessToken(getAccessToken());
  if (fromToken) {
    return fromToken;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_USER_ID?.trim();
  return fromEnv ?? null;
}
