import type { BeaconCongestionPoint } from "../types";

/** 새로고침 시마다 순환 — API 연동 전 “그 시점 혼잡도” 시뮬레이션 */
const CONGESTION_SNAPSHOTS: BeaconCongestionPoint[][] = [
  [
    { gridX: 19, gridY: 6, level: "HIGH" },
    { gridX: 10, gridY: 11, level: "MEDIUM" },
  ],
  [
    { gridX: 7, gridY: 6, level: "HIGH" },
    { gridX: 16, gridY: 11, level: "MEDIUM" },
  ],
  [
    { gridX: 22, gridY: 6, level: "MEDIUM" },
    { gridX: 13, gridY: 6, level: "HIGH" },
  ],
];

let snapshotCursor = 0;

export function fetchCongestionSnapshotOnRefresh(): BeaconCongestionPoint[] {
  const snapshot = CONGESTION_SNAPSHOTS[snapshotCursor];
  snapshotCursor = (snapshotCursor + 1) % CONGESTION_SNAPSHOTS.length;
  return snapshot.map((point) => ({ ...point }));
}

export function resetCongestionSnapshotCursor(): void {
  snapshotCursor = 0;
}
