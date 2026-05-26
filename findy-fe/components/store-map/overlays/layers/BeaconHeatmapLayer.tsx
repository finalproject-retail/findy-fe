import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { BEACON_HEAT_OPACITY, BEACON_HEAT_SIZE_PX } from "../constants";
import type { BeaconCongestionPoint } from "../types";
import { gridCellCenterToPixel } from "../utils/gridToPixel";
import { beaconHeatDiameter } from "../utils/overlayScale";
import { BASE_CELL_PX } from "../../constants";

type BeaconHeatmapLayerProps = {
  beacons: BeaconCongestionPoint[];
  cellPx: number;
  mapWidth?: number;
  mapHeight?: number;
};

function heatSizePx(level: BeaconCongestionPoint["level"], cellPx: number): number {
  return beaconHeatDiameter(BEACON_HEAT_SIZE_PX[level], cellPx);
}

function BeaconHeatBlob({
  beacon,
  cellPx,
}: {
  beacon: BeaconCongestionPoint;
  cellPx: number;
}) {
  const center = gridCellCenterToPixel(beacon.gridX, beacon.gridY, cellPx);
  const size = heatSizePx(beacon.level, cellPx);
  const half = size / 2;
  const baseOpacity = BEACON_HEAT_OPACITY[beacon.level];
  const normalized = BASE_CELL_PX > 0 ? cellPx / BASE_CELL_PX : 1;
  // 확대(매대) 지도에서만 살짝 더 진하게
  const zoomBoost =
    normalized <= 1 ? 1 : Math.min(1.35, 1 + (normalized - 1) * 0.35);
  const opacity = Math.min(0.26, baseOpacity * zoomBoost);

  // SVG radial-gradient gives a smoother falloff than stacking 2 circles,
  // and overlaps blend naturally via alpha compositing (web/native).
  const gradientId = `heat-${beacon.gridX}-${beacon.gridY}-${beacon.level}`;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: center.x - half,
        top: center.y - half,
        width: size,
        height: size,
      }}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#EF4444" stopOpacity={opacity} />
            <Stop offset="45%" stopColor="#EF4444" stopOpacity={opacity * 0.55} />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={half} cy={half} r={half} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

export function BeaconHeatmapLayer({ beacons, cellPx }: BeaconHeatmapLayerProps) {
  return (
    <>
      {beacons.map((beacon) => (
        <BeaconHeatBlob
          key={`${beacon.gridX}-${beacon.gridY}-${beacon.level}`}
          beacon={beacon}
          cellPx={cellPx}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  svg: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
