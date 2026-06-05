import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope, PathNavigationApi } from "@/lib/map/types";

function resolveAuthToken(): string | null {
  const fromMemory = getAccessToken();
  if (fromMemory) {
    return fromMemory;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim();
  return fromEnv || null;
}

function navigationPathUrl(storeId: number): string {
  return `${MAP_API_URL}/api/v1/stores/${storeId}/navigation/path`;
}

function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parsePathResponse(
  response: Response,
): Promise<PathNavigationApi> {
  const json = (await response.json().catch(() => null)) as ApiEnvelope<PathNavigationApi> | null;

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `navigation/path HTTP ${response.status}`);
  }

  return json.data;
}

/** 경로 생성·재탐색 — POST /api/v1/stores/{storeId}/navigation/path */
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

  const response = await fetch(navigationPathUrl(storeId), {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ destinationGridIds }),
  });

  return parsePathResponse(response);
}

/** 저장된 경로 조회 — GET /api/v1/stores/{storeId}/navigation/path */
export async function getShoppingPath(storeId: number): Promise<PathNavigationApi> {
  const token = resolveAuthToken();
  if (!token) {
    throw new Error("로그인 토큰이 없습니다. 로그인 후 경로를 이용해 주세요.");
  }

  const response = await fetch(navigationPathUrl(storeId), {
    method: "GET",
    headers: authHeaders(token),
  });

  return parsePathResponse(response);
}

/** @deprecated createShoppingPath 사용 */
export const fetchShoppingPath = createShoppingPath;
