import { Text, View } from "react-native";
import {
  BASE_CELL_PX,
  getCategoryColor,
  STORE_MAP_COLORS,
  ZONE_BLOCK_RADIUS,
} from "./constants";
import { LEFT_WALL_X, RIGHT_WALL_X } from "./grid/layout";
import type { CategoryZone } from "./types";

type Props = {
  zones: CategoryZone[];
  cellPx?: number;
};

function VerticalZoneLabel({
  category,
  zoneW,
  zoneH,
  cellPx,
}: {
  category: string;
  zoneW: number;
  zoneH: number;
  cellPx: number;
}) {
  const chars = Array.from(category.replace(/\n/g, ""));
  const fontSize = Math.max(
    4,
    Math.min(zoneW * 0.88, (zoneH / Math.max(chars.length, 1)) * 0.9, cellPx * 0.48)
  );
  const lineHeight = fontSize * 1.05;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      {chars.map((char, index) => (
        <Text
          key={`${char}-${index}`}
          style={{
            fontSize,
            lineHeight,
            fontWeight: "600",
            color: STORE_MAP_COLORS.zoneText,
            textAlign: "center",
            width: zoneW,
          }}
          numberOfLines={1}
        >
          {char}
        </Text>
      ))}
    </View>
  );
}

function zoneFontSize(zoneW: number, zoneH: number, lineCount: number, cellPx: number): number {
  const lines = Math.max(1, lineCount);
  const byWidth = zoneW * 0.14;
  const byHeight = (zoneH / lines) * 0.38;
  return Math.max(cellPx * 0.32, Math.min(cellPx * 0.55, byWidth, byHeight));
}

export function StoreMapZoneLayer({ zones, cellPx = BASE_CELL_PX }: Props) {
  const sorted = [...zones].sort(
    (a, b) => a.width * a.height - b.width * b.height
  );
  const radius = Math.max(1, ZONE_BLOCK_RADIUS * (cellPx / BASE_CELL_PX));

  return (
    <>
      {sorted.map((zone) => {
        const zoneW = zone.width * cellPx;
        const zoneH = zone.height * cellPx;
        const lineCount = zone.category.split("\n").length;
        const fontSize = zoneFontSize(zoneW, zoneH, lineCount, cellPx);
        const isVerticalEdgeZone =
          zone.width === 1 &&
          zone.height > 1 &&
          (zone.x === LEFT_WALL_X || zone.x === RIGHT_WALL_X);

        return (
          <View
            key={zone.id}
            style={{
              position: "absolute",
              left: zone.x * cellPx,
              top: zone.y * cellPx,
              width: zoneW,
              height: zoneH,
              backgroundColor: getCategoryColor(),
              borderWidth: 1,
              borderColor: STORE_MAP_COLORS.zoneBorder,
              borderRadius: radius,
              justifyContent: "center",
              alignItems: "center",
              padding: 2,
              overflow: "hidden",
            }}
          >
            {isVerticalEdgeZone ? (
              <VerticalZoneLabel
                category={zone.category}
                zoneW={zoneW}
                zoneH={zoneH}
                cellPx={cellPx}
              />
            ) : (
              <Text
                style={{
                  fontSize,
                  fontWeight: "600",
                  color: STORE_MAP_COLORS.zoneText,
                  textAlign: "center",
                  width: zoneW - 4,
                  lineHeight: fontSize * 1.15,
                }}
                numberOfLines={lineCount + 1}
              >
                {zone.category}
              </Text>
            )}
          </View>
        );
      })}
    </>
  );
}
