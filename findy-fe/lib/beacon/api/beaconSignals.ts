import { MAP_API_URL } from "@/constants/beacon";
import { getAccessToken } from "@/lib/api/client";
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
  const response = await fetch(`${MAP_API_URL}/api/v1/beacon-signals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await response.json().catch(() => null)) as ApiEnvelope<BeaconSignalResponse> | null;

  if (!response.ok || !json?.success || !json.data) {
    throw new Error(json?.message ?? `HTTP ${response.status}`);
  }

  return json.data;
}
