import { GRID_COLS } from "@/components/store-map/grid/layout";
import { Platform } from "react-native";

/** map-service 직접 호출 (beacon-signals) */
const ANDROID_EMULATOR_HOST = "10.0.2.2";

function resolveMapApiUrl(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_MAP_API_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (Platform.OS === "android") {
    return `http://${ANDROID_EMULATOR_HOST}:8888`;
  }
  return "http://localhost:8888";
}

export const MAP_API_URL = resolveMapApiUrl();

/** 실물 Minew minor → DB grids.grid_id */
export const MINOR_TO_GRID_ID: Record<string, number> = {
  "56337": 466,
  "56338": 321,
  "56321": 333,
  "56325": 43,
};

/**
 * Flyway V3 시드 순서: y=0..17, x=0..28 → grid_id = y * cols + x + 1
 */
export function gridIdToGridPoint(gridId: number): {
  gridX: number;
  gridY: number;
} {
  const index = gridId - 1;
  return {
    gridX: index % GRID_COLS,
    gridY: Math.floor(index / GRID_COLS),
  };
}

export const BEACON_REQUIRED_STREAK_DEFAULT = 2;
export const BEACON_EMA_ALPHA = 0.25;
