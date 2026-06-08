import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
import { handleUnauthorizedHttpResponse } from "@/lib/api/unauthorizedSession";
import { buildPayload } from "@/lib/beacon/utils/beaconLogic";
import type { BeaconScan } from "@/lib/beacon/types";

type BeaconSignalResponse = {
  gridX: number;
  gridY: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function sendBeaconGridChange(
  storeId: number,
  scan: BeaconScan,
  nearestGridId: number,
): Promise<BeaconSignalResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const payload = buildPayload(storeId, scan, nearestGridId);
  const url = `${MAP_API_URL}/api/v1/beacon-signals`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  await handleUnauthorizedHttpResponse(response, url);

  const json = (await response.json().catch(() => null)) as ApiEnvelope<BeaconSignalResponse> | null;

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `HTTP ${response.status}`);
  }

  return json.data;
}
