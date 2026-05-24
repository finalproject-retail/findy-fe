import { Platform, StyleSheet, View } from "react-native";
import { BEACON_HEAT_OPACITY, BEACON_HEAT_SIZE_PX } from "../constants";
import type { BeaconCongestionPoint } from "../types";
import { gridCellCenterToPixel } from "../utils/gridToPixel";
import { beaconHeatDiameter } from "../utils/overlayScale";

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
  const opacity = BEACON_HEAT_OPACITY[beacon.level];

  if (Platform.OS === "web") {
    const webOpacity = beacon.level === "HIGH" ? "opacity-[0.13]" : "opacity-[0.07]";
    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: center.x - half,
          top: center.y - half,
          width: size,
          height: size,
          overflow: "hidden",
          borderRadius: half,
        }}
      >
        <View
          className={`h-full w-full rounded-full bg-red-500 blur-2xl ${webOpacity}`}
        />
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: center.x - half,
        top: center.y - half,
        width: size,
        height: size,
        borderRadius: half,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: half,
          backgroundColor: `rgba(239, 68, 68, ${opacity})`,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: (size * 0.75) / 2,
          left: size * 0.125,
          top: size * 0.125,
          backgroundColor: `rgba(239, 68, 68, ${opacity * 0.5})`,
        }}
      />
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
