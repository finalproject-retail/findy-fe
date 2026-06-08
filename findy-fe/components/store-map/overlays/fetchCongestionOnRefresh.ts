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
    windowSeconds,
    threshold,
  });

  return congestion.points
    .filter(isDisplayableCongestionPoint)
    .map((point) => ({
      gridX: point.gridX,
      gridY: point.gridY,
      level: point.level,
    }));
}

function isDisplayableCongestionPoint(
  point: GridCongestionPointApi,
): point is GridCongestionPointApi & BeaconCongestionPoint {
  return point.level === "HIGH" || point.level === "MEDIUM";
}
