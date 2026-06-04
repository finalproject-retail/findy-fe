import type { BeaconCongestionPoint } from "./types";
import { fetchCongestionSnapshotOnRefresh } from "./mock/congestionSnapshots";

export type CongestionRefreshInput = {
  storeId?: number;
  /** API 연동 시: 새로고침 시점까지 수신한 비콘·격자 데이터 */
  beaconGridIds?: number[];
};

/**
 * 새로고침 버튼 — 혼잡도만 갱신 (경로와 분리).
 * API 연동 후 `beaconGridIds` 등으로 서버 혼잡도를 조회하도록 교체.
 */
export function fetchCongestionOnRefresh(
  _input?: CongestionRefreshInput,
): BeaconCongestionPoint[] {
  return fetchCongestionSnapshotOnRefresh();
}
