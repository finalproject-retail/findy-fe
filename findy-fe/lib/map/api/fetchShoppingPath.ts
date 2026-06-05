import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope, PathNavigationApi } from "@/lib/map/types";

const PATH_API_URL = `${MAP_API_URL}/api/v1/path`;

function resolveAuthToken(): string | null {
  const fromMemory = getAccessToken();
  if (fromMemory) {
    return fromMemory;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim();
  return fromEnv || null;
}

/** 경로 생성·재탐색 — POST /api/v1/path */
export async function createShoppingPath(
  storeId: number,
  destinationGridIds: number[],
): Promise<PathNavigationApi> {
  const token = resolveAuthToken();
  if (!token) {
    throw new Error("로그인 토큰이 없습니다. 로그인 후 경로를 이용해 주세요.");
  }

  if (destinationGridIds.length === 0) {
    throw new Error("경로 목적지가 없습니다.");
  }

  const response = await fetch(PATH_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ storeId, destinationGridIds }),
  });

  const json = (await response.json().catch(() => null)) as ApiEnvelope<PathNavigationApi> | null;

  if (!response.ok || !json?.success || !json.data) {
    const detail = json?.message ?? json?.code ?? `HTTP ${response.status}`;
    throw new Error(`${detail} (${response.status})`);
  }

  return json.data;
}

/** @deprecated createShoppingPath 사용 */
export const fetchShoppingPath = createShoppingPath;
