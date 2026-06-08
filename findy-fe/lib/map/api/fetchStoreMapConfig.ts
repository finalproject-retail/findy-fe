import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import { handleUnauthorizedHttpResponse } from "@/lib/api/unauthorizedSession";
import type { ApiEnvelope, StoreMapConfigApi } from "@/lib/map/types";

function resolveAuthToken(): string | null {
  const fromMemory = getAccessToken();
  if (fromMemory) {
    return fromMemory;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim();
  return fromEnv || null;
}

export async function fetchStoreMapConfig(
  storeId: number,
): Promise<StoreMapConfigApi> {
  const token = resolveAuthToken();
  if (!token) {
    throw new Error("로그인 토큰이 없습니다. 로그인 후 지도를 이용해 주세요.");
  }

  const url = `${MAP_API_URL}/api/v1/stores/${storeId}/map-config`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await handleUnauthorizedHttpResponse(response, url);

  const json = (await response.json().catch(() => null)) as ApiEnvelope<StoreMapConfigApi> | null;

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `map-config HTTP ${response.status}`);
  }

  return json.data;
}
