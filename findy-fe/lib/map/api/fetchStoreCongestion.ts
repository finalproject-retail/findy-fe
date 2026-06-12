import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import { handleUnauthorizedHttpResponse } from "@/lib/api/unauthorizedSession";
import type { ApiEnvelope, StoreCongestionApi } from "@/lib/map/types";

function resolveAuthToken(): string | null {
  const fromMemory = getAccessToken();
  if (fromMemory) {
    return fromMemory;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim();
  return fromEnv || null;
}

export type FetchStoreCongestionOptions = {
  windowSeconds?: number;
  threshold?: number;
};

export async function fetchStoreCongestion(
  storeId: number,
  options: FetchStoreCongestionOptions = {},
): Promise<StoreCongestionApi> {
  const token = resolveAuthToken();
  if (!token) {
    throw new Error("Missing access token for store congestion request.");
  }

  const params = new URLSearchParams();
  if (options.windowSeconds != null) {
    params.set("windowSeconds", String(options.windowSeconds));
  }
  if (options.threshold != null) {
    params.set("threshold", String(options.threshold));
  }

  const query = params.toString();
  const url = `${MAP_API_URL}/api/v1/stores/${storeId}/congestion${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await handleUnauthorizedHttpResponse(response, url);

  const json = (await response.json().catch(() => null)) as ApiEnvelope<StoreCongestionApi> | null;

  if (!response.ok || !json?.success || !json.data) {
    const detail = json?.message ?? json?.code ?? `HTTP ${response.status}`;
    throw new Error(`${detail} (${response.status})`);
  }

  return json.data;
}
