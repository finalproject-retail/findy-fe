import { CONGESTION_WINDOW_SECONDS } from "@/constants/beacon";
import { fetchGridCongestion } from "@/lib/map/api/fetchGridCongestion";
import type { GridCongestionPointApi } from "@/lib/map/types";
import type { BeaconCongestionPoint } from "./types";

export type CongestionRefreshInput = {
  storeId: number;
  windowSeconds?: number;
  threshold?: number;
};

export async function fetchCongestionOnRefresh({
  storeId,
  windowSeconds,
  threshold,
}: CongestionRefreshInput): Promise<BeaconCongestionPoint[]> {
  const congestion = await fetchGridCongestion(storeId, {
    windowSeconds: windowSeconds ?? CONGESTION_WINDOW_SECONDS,
    threshold,
  });

  return toBeaconCongestionOverlayPoints(congestion.points);
}

/** BE CongestionService grid 기준과 동일 — 인원 수로만 지도 표시 판단 */
export const GRID_CONGESTION_OVERLAY_MEDIUM_MIN = 2;
export const GRID_CONGESTION_OVERLAY_HIGH_MIN = 3;

export function resolveCongestionOverlayLevel(
  activeUserCount: number,
): BeaconCongestionPoint["level"] | null {
  if (activeUserCount >= GRID_CONGESTION_OVERLAY_HIGH_MIN) {
    return "HIGH";
  }
  if (activeUserCount >= GRID_CONGESTION_OVERLAY_MEDIUM_MIN) {
    return "MEDIUM";
  }
  return null;
}

export function isDisplayableCongestionPoint(
  point: GridCongestionPointApi,
): point is GridCongestionPointApi & BeaconCongestionPoint {
  return resolveCongestionOverlayLevel(point.activeUserCount) != null;
}

export function toBeaconCongestionOverlayPoints(
  points: GridCongestionPointApi[],
): BeaconCongestionPoint[] {
  return points.flatMap((point) => {
    const level = resolveCongestionOverlayLevel(point.activeUserCount);
    if (!level) {
      return [];
    }
    return [
      {
        gridX: point.gridX,
        gridY: point.gridY,
        level,
      },
    ];
  });
}
