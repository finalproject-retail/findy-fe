import { getAccessToken } from "@/lib/api/client";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";

export const DEFAULT_USER_ID = Number(
  process.env.EXPO_PUBLIC_DEV_USER_ID?.trim() || 1,
);

/** shopping-service — X-User-Id (JWT sub 우선) */
export function resolveShoppingUserId(explicitUserId?: number): number {
  if (explicitUserId != null && Number.isFinite(explicitUserId) && explicitUserId > 0) {
    return explicitUserId;
  }

  const fromToken = getUserIdFromAccessToken(getAccessToken());
  if (fromToken) {
    const parsed = Number(fromToken);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_USER_ID;
}
