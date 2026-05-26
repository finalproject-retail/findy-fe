import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  BASE_CELL_PX,
  MAP_FLOOR_COLOR,
  MAP_PAN_BOTTOM_EXTRA_PX,
  MAP_PAN_INSET_BOTTOM_RATIO,
  MAP_PAN_INSET_TOP_RATIO,
  MAP_PAN_TOP_EXTRA_PX,
  USER_LOCATION_FOCUS_ZOOM_FACTOR,
  ZOOM_MAX,
  ZOOM_STEP,
} from "./constants";
import { gridCellCenterToPixel } from "./overlays/utils/gridToPixel";
import { getEmartStoreMapConfig } from "./data/emart-floor-plan";
import { StoreMapOverlays } from "./overlays/StoreMapOverlays";
import type { StoreMapNavigationMock } from "./overlays/types";
import { StoreMapShelfLayer } from "./StoreMapShelfLayer";
import { StoreMapZoneLayer } from "./StoreMapZoneLayer";
import { getDetailBlend } from "./utils/zoomLevel";
import {
  clampPan as clampPanPosition,
  getCenteredPan,
} from "./utils/panBounds";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const FIT_PADDING = 1;
const MAX_SHELF_GAP_PX = 4;
const FIT_SCALE_EPSILON = 0.008;

type StoreMapViewProps = {
  fitWidth?: number;
  fitHeight?: number;
  /** 탭바 등 하단에 가려지는 영역 — pan·fit 높이에서 제외 */
  contentBottomInset?: number;
  navigationData?: StoreMapNavigationMock;
  /** 새로고침·장바구니 변경 시 경로 재탐색 트리거 */
  navigationRefreshKey?: number;
};

function shelfGapFromScale(scale: number, fitScale: number): number {
  return getDetailBlend(scale, fitScale) * MAX_SHELF_GAP_PX;
}

export function StoreMapView({
  fitWidth = SCREEN_WIDTH * 0.88,
  fitHeight = SCREEN_HEIGHT * 0.55,
  contentBottomInset = 0,
  navigationData,
  navigationRefreshKey = 0,
}: StoreMapViewProps) {
  const config = useMemo(() => getEmartStoreMapConfig(), []);
  const mapWidth = config.cols * BASE_CELL_PX;
  const mapHeight = config.rows * BASE_CELL_PX;

  const [viewportSize, setViewportSize] = useState({
    width: fitWidth,
    height: fitHeight,
  });

  useEffect(() => {
    setViewportSize({ width: fitWidth, height: fitHeight });
  }, [fitWidth, fitHeight]);

  const fitScale = useMemo(() => {
    const scaleX = (viewportSize.width / mapWidth) * FIT_PADDING;
    const scaleY = (viewportSize.height / mapHeight) * FIT_PADDING;
    return Math.min(scaleX, scaleY);
  }, [viewportSize, mapWidth, mapHeight]);

  const minZoom = fitScale;
  const maxZoom = fitScale * ZOOM_MAX;

  const scale = useSharedValue(fitScale);
  const savedScale = useSharedValue(fitScale);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const savedPanX = useSharedValue(0);
  const savedPanY = useSharedValue(0);
  const zoneOpacity = useSharedValue(1);
  const shelfOpacity = useSharedValue(0);

  const viewportW = useSharedValue(viewportSize.width);
  const viewportH = useSharedValue(viewportSize.height);
  const contentBottomInsetSv = useSharedValue(contentBottomInset);
  const mapW = useSharedValue(mapWidth);
  const mapH = useSharedValue(mapHeight);
  const fitScaleSv = useSharedValue(fitScale);
  const minZoomSv = useSharedValue(minZoom);
  const maxZoomSv = useSharedValue(maxZoom);

  const scaleRef = useRef(fitScale);
  const [renderScale, setRenderScale] = useState(fitScale);
  const [shelfGapPx, setShelfGapPx] = useState(() =>
    shelfGapFromScale(fitScale, fitScale)
  );

  const cellPx = BASE_CELL_PX * renderScale;

  const syncRenderFromScale = useCallback(
    (s: number) => {
      scaleRef.current = s;
      setRenderScale((prev) => (prev === s ? prev : s));
      setShelfGapPx(shelfGapFromScale(s, fitScale));
    },
    [fitScale]
  );

  useAnimatedReaction(
    () => scale.value,
    (s) => {
      runOnJS(syncRenderFromScale)(s);
    },
    [syncRenderFromScale]
  );

  useEffect(() => {
    viewportW.value = viewportSize.width;
    viewportH.value = viewportSize.height;
    contentBottomInsetSv.value = contentBottomInset;
    mapW.value = mapWidth;
    mapH.value = mapHeight;
    fitScaleSv.value = fitScale;
    minZoomSv.value = minZoom;
    maxZoomSv.value = maxZoom;
  }, [
    viewportSize,
    contentBottomInset,
    mapWidth,
    mapHeight,
    fitScale,
    minZoom,
    maxZoom,
    viewportW,
    viewportH,
    contentBottomInsetSv,
    mapW,
    mapH,
    fitScaleSv,
    minZoomSv,
    maxZoomSv,
  ]);

  const clampPanWorklet = (x: number, y: number, s: number) => {
    "worklet";
    const vw = viewportW.value;
    const vh = viewportH.value - contentBottomInsetSv.value;
    const scaledW = mapW.value * s;
    const scaledH = mapH.value * s;
    const overflowX = scaledW - vw;
    const overflowY = scaledH - vh;

    let minX: number;
    let maxX: number;
    let minY: number;
    let maxY: number;

    if (overflowX <= 0 && overflowY <= 0) {
      minX = (vw - scaledW) / 2;
      maxX = minX;
      minY = (vh - scaledH) / 2;
      maxY = minY;
    } else {
      const inset = contentBottomInsetSv.value;
      const bottomPad =
        MAP_PAN_BOTTOM_EXTRA_PX + inset * MAP_PAN_INSET_BOTTOM_RATIO;
      const topPad = MAP_PAN_TOP_EXTRA_PX + inset * MAP_PAN_INSET_TOP_RATIO;
      minX = overflowX > 0 ? -overflowX : (vw - scaledW) / 2;
      maxX = overflowX > 0 ? 0 : (vw - scaledW) / 2;
      minY = overflowY > 0 ? -overflowY - bottomPad : (vh - scaledH) / 2;
      maxY = overflowY > 0 ? topPad : (vh - scaledH) / 2;
    }

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const applyPanClamp = useCallback(
    (s: number) => {
      const scaledW = mapWidth * s;
      const scaledH = mapHeight * s;
      const effectiveVh = viewportSize.height - contentBottomInset;
      const next = clampPanPosition(
        panX.value,
        panY.value,
        viewportSize.width,
        effectiveVh,
        scaledW,
        scaledH,
        { contentBottomInset },
      );
      panX.value = next.x;
      panY.value = next.y;
      savedPanX.value = next.x;
      savedPanY.value = next.y;
    },
    [
      contentBottomInset,
      mapWidth,
      mapHeight,
      panX,
      panY,
      savedPanX,
      savedPanY,
      viewportSize.height,
      viewportSize.width,
    ]
  );

  const centerMap = useCallback(
    (s: number) => {
      const scaledW = mapWidth * s;
      const scaledH = mapHeight * s;
      const effectiveVh = viewportSize.height - contentBottomInset;
      const c = getCenteredPan(
        viewportSize.width,
        effectiveVh,
        scaledW,
        scaledH
      );
      panX.value = c.x;
      panY.value = c.y;
      savedPanX.value = c.x;
      savedPanY.value = c.y;
    },
    [
      contentBottomInset,
      mapHeight,
      mapWidth,
      panX,
      panY,
      savedPanX,
      savedPanY,
      viewportSize.height,
      viewportSize.width,
    ]
  );

  const applyScaleState = useCallback(
    (next: number) => {
      const clamped = clamp(next, minZoom, maxZoom);
      scale.value = clamped;
      savedScale.value = clamped;
      scaleRef.current = clamped;
      const blend = getDetailBlend(clamped, fitScale);
      zoneOpacity.value = 1 - blend;
      shelfOpacity.value = blend;
      setShelfGapPx(shelfGapFromScale(clamped, fitScale));

      if (clamped <= minZoom * (1 + FIT_SCALE_EPSILON)) {
        centerMap(clamped);
      } else {
        applyPanClamp(clamped);
      }
    },
    [
      applyPanClamp,
      centerMap,
      fitScale,
      maxZoom,
      minZoom,
      scale,
      savedScale,
      shelfOpacity,
      zoneOpacity,
    ]
  );

  const focusOnUserLocation = useCallback(() => {
    const location = navigationData?.currentLocation;
    if (!location || viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }

    const targetScale = clamp(
      fitScale * USER_LOCATION_FOCUS_ZOOM_FACTOR,
      minZoom,
      maxZoom,
    );
    applyScaleState(targetScale);

    const effectiveVh = viewportSize.height - contentBottomInset;
    const scaledW = mapWidth * targetScale;
    const scaledH = mapHeight * targetScale;
    const center = gridCellCenterToPixel(
      location.gridX,
      location.gridY,
      BASE_CELL_PX * targetScale,
    );

    const next = clampPanPosition(
      viewportSize.width / 2 - center.x,
      effectiveVh / 2 - center.y,
      viewportSize.width,
      effectiveVh,
      scaledW,
      scaledH,
      { contentBottomInset },
    );
    panX.value = next.x;
    panY.value = next.y;
    savedPanX.value = next.x;
    savedPanY.value = next.y;
  }, [
    applyScaleState,
    contentBottomInset,
    fitScale,
    mapHeight,
    mapWidth,
    maxZoom,
    minZoom,
    navigationData?.currentLocation,
    panX,
    panY,
    savedPanX,
    savedPanY,
    viewportSize.height,
    viewportSize.width,
  ]);

  useEffect(() => {
    focusOnUserLocation();
  }, [
    focusOnUserLocation,
    navigationRefreshKey,
    navigationData?.currentLocation.gridX,
    navigationData?.currentLocation.gridY,
  ]);

  useEffect(() => {
    if (viewportSize.width <= 0) return;
    applyPanClamp(scaleRef.current);
  }, [contentBottomInset, applyPanClamp, viewportSize.width]);

  const syncOpacityWorklet = (nextScale: number) => {
    "worklet";
    const fit = fitScaleSv.value;
    const ratio = fit > 0 ? nextScale / fit : 1;
    let blend = 0;
    if (ratio > 1) {
      blend = ratio >= 1.4 ? 1 : (ratio - 1) / 0.4;
    }
    zoneOpacity.value = 1 - blend;
    shelfOpacity.value = blend;
  };

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
    })
    .onUpdate((e) => {
      const next = clamp(savedScale.value * e.scale, minZoomSv.value, maxZoomSv.value);
      scale.value = next;
      syncOpacityWorklet(next);
      runOnJS(syncRenderFromScale)(next);
      if (next <= minZoomSv.value * (1 + FIT_SCALE_EPSILON)) {
        const vw = viewportW.value;
        const vh = viewportH.value - contentBottomInsetSv.value;
        const sw = mapW.value * next;
        const sh = mapH.value * next;
        panX.value = (vw - sw) / 2;
        panY.value = (vh - sh) / 2;
      } else {
        const p = clampPanWorklet(panX.value, panY.value, next);
        panX.value = p.x;
        panY.value = p.y;
      }
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
      if (scale.value > minZoomSv.value * (1 + FIT_SCALE_EPSILON)) {
        runOnJS(applyPanClamp)(scale.value);
      }
    });

  const pan = Gesture.Pan()
    .minDistance(4)
    .onStart(() => {
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
    })
    .onUpdate((e) => {
      if (scale.value <= minZoomSv.value * (1 + FIT_SCALE_EPSILON)) {
        return;
      }
      const p = clampPanWorklet(
        savedPanX.value + e.translationX,
        savedPanY.value + e.translationY,
        scale.value
      );
      panX.value = p.x;
      panY.value = p.y;
    })
    .onEnd(() => {
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedMapStyle = useAnimatedStyle(() => {
    const s = scale.value;
    return {
      position: "absolute",
      left: panX.value,
      top: panY.value,
      width: mapW.value * s,
      height: mapH.value * s,
    };
  });

  const animatedZoneStyle = useAnimatedStyle(() => ({
    opacity: zoneOpacity.value,
  }));

  const animatedShelfStyle = useAnimatedStyle(() => ({
    opacity: shelfOpacity.value,
  }));

  const webWheelProps =
    Platform.OS === "web"
      ? {
          onWheel: (e: { preventDefault?: () => void; deltaY: number }) => {
            e.preventDefault?.();
            const delta = e.deltaY > 0 ? -ZOOM_STEP * fitScale : ZOOM_STEP * fitScale;
            applyScaleState(scaleRef.current + delta);
          },
        }
      : {};

  return (
    <GestureHandlerRootView style={styles.root}>
      <View
        style={[styles.viewport, { paddingBottom: contentBottomInset }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setViewportSize({ width, height });
          }
        }}
        {...webWheelProps}
      >
        <GestureDetector gesture={composed}>
          <View style={styles.gestureSurface}>
            <Animated.View style={animatedMapStyle}>
              <View style={{ width: config.cols * cellPx, height: config.rows * cellPx }}>
                <Animated.View
                  style={[StyleSheet.absoluteFill, animatedShelfStyle]}
                  pointerEvents="none"
                >
                  <StoreMapShelfLayer
                    config={config}
                    cellPx={cellPx}
                    gapPx={shelfGapPx * (renderScale / Math.max(fitScale, 0.001))}
                  />
                </Animated.View>
                <Animated.View
                  style={[StyleSheet.absoluteFill, animatedZoneStyle]}
                  pointerEvents="none"
                >
                  <StoreMapZoneLayer zones={config.zones} cellPx={cellPx} />
                </Animated.View>
                <StoreMapOverlays
                  config={config}
                  cellPx={cellPx}
                  mapWidth={config.cols * cellPx}
                  mapHeight={config.rows * cellPx}
                  data={navigationData}
                  navigationRefreshKey={navigationRefreshKey}
                />
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MAP_FLOOR_COLOR,
  },
  viewport: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: MAP_FLOOR_COLOR,
  },
  gestureSurface: {
    flex: 1,
  },
});
