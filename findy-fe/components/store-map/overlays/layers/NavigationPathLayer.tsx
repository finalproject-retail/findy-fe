import { StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import {
  MAP_PATH_DASH_ARRAY,
  MAP_PATH_DASH_COLOR,
  MAP_PATH_SOLID_COLOR,
  MAP_PATH_STROKE_WIDTH,
} from "../constants";
import type { NavigationPathSegment } from "../types";
import { scaledPathStroke } from "../utils/overlayScale";

type NavigationPathLayerProps = {
  segments: NavigationPathSegment[];
  mapWidth: number;
  mapHeight: number;
  cellPx: number;
};

export function NavigationPathLayer({
  segments,
  mapWidth,
  mapHeight,
  cellPx,
}: NavigationPathLayerProps) {
  const strokeWidth = scaledPathStroke(MAP_PATH_STROKE_WIDTH, cellPx);

  if (segments.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={mapWidth} height={mapHeight} style={styles.svg}>
        {segments.map((seg, index) => (
          <Line
            key={`path-${index}`}
            x1={seg.from.x}
            y1={seg.from.y}
            x2={seg.to.x}
            y2={seg.to.y}
            stroke={seg.variant === "dashed" ? MAP_PATH_DASH_COLOR : MAP_PATH_SOLID_COLOR}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={seg.variant === "dashed" ? MAP_PATH_DASH_ARRAY : undefined}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
