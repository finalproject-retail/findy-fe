import { COLORS } from "@/constants/theme";

export const MAP_OVERLAY_MARKER_WIDTH = 15;
export const MAP_OVERLAY_MARKER_HEIGHT = 21;

export const MAP_OVERLAY_RECO_WIDTH = 22;
export const MAP_OVERLAY_RECO_HEIGHT = 23;

export const MAP_USER_LOCATION_COLOR = COLORS.blueText;
export const MAP_USER_PING_COLOR = "rgba(26, 72, 241, 0.45)";

export const MAP_USER_DOT_SIZE_BASE = 11;
export const MAP_USER_PING_SIZE_BASE = 20;

export const MAP_PATH_SOLID_COLOR = "#2F7FE8";
export const MAP_PATH_DASH_COLOR = "#6DB4FA";
export const MAP_PATH_STROKE_WIDTH = 3.5;
export const MAP_PATH_DASH_ARRAY = "6 5";

export const BEACON_HEAT_SIZE_PX = {
  HIGH: 96,
  MEDIUM: 76,
} as const;

export const BEACON_HEAT_OPACITY = {
  HIGH: 0.18,
  MEDIUM: 0.1,
} as const;
