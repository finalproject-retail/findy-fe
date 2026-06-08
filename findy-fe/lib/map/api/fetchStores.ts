import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope, StoreApi } from "@/lib/map/types";

function resolveAuthToken(): string | null {
  const fromMemory = getAccessToken();
  if (fromMemory) {
    return fromMemory;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim();
  return fromEnv || null;
}

/** ACTIVE 매장 목록 — GET /api/v1/stores */
export async function fetchStores(): Promise<StoreApi[]> {
  const token = resolveAuthToken();
  if (!token) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetch(`${MAP_API_URL}/api/v1/stores`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = (await response.json().catch(() => null)) as ApiEnvelope<
    StoreApi[]
  > | null;

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `stores HTTP ${response.status}`);
  }

  return json.data;
}
