import type { GridCongestionLevelApi } from "@/lib/map/types";

export function formatStoreCongestionLabel(
  level: GridCongestionLevelApi,
): string {
  switch (level) {
    case "HIGH":
      return "혼잡";
    case "MEDIUM":
      return "보통";
    case "LOW":
      return "여유";
  }
}

export function storeCongestionAccentColor(
  level: GridCongestionLevelApi,
): string {
  switch (level) {
    case "HIGH":
      return "#EA4335";
    case "MEDIUM":
      return "#F59E0B";
    case "LOW":
      return "#22C55E";
  }
}
