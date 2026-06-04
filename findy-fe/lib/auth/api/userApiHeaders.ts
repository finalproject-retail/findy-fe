import { getAccessToken } from "@/lib/api/client";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";

/** user-service 일부 /me API에서 JWT와 함께 요구하는 헤더 */
export function buildUserApiHeaders(): Record<string, string> {
  const userId = getUserIdFromAccessToken(getAccessToken());
  if (!userId) {
    return {};
  }
  return { "X-USER-ID": userId };
}
