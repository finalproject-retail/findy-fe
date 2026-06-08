import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope, GridCongestionListApi } from "@/lib/map/types";

function resolveAuthToken(): string | null {
  const fromMemory = getAccessToken();
  if (fromMemory) {
    return fromMemory;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN?.trim();
  return fromEnv || null;
}

export type FetchGridCongestionOptions = {
  windowSeconds?: number;
  threshold?: number;
};

export async function fetchGridCongestion(
  storeId: number,
  options: FetchGridCongestionOptions = {},
): Promise<GridCongestionListApi> {
  const token = resolveAuthToken();
  if (!token) {
    throw new Error("Missing access token for grid congestion request.");
  }

  const params = new URLSearchParams();
  if (options.windowSeconds != null) {
    params.set("windowSeconds", String(options.windowSeconds));
  }
  if (options.threshold != null) {
    params.set("threshold", String(options.threshold));
  }

  const query = params.toString();
  const response = await fetch(
    `${MAP_API_URL}/api/v1/stores/${storeId}/grids/congestion${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const json = (await response.json().catch(() => null)) as ApiEnvelope<GridCongestionListApi> | null;

  if (!response.ok || !json?.success || !json.data) {
    const detail = json?.message ?? json?.code ?? `HTTP ${response.status}`;
    throw new Error(`${detail} (${response.status})`);
  }

  return json.data;
}
