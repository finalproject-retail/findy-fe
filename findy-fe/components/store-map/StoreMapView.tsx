import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
  MAP_PAN_HORIZONTAL_EXTRA_PX,
  MAP_PAN_INSET_BOTTOM_RATIO,
  MAP_PAN_INSET_TOP_RATIO,
  MAP_PAN_TOP_EXTRA_PX,
  USER_LOCATION_FOCUS_ZOOM_FACTOR,
  ZOOM_MAX,
  ZOOM_STEP,
} from "./constants";
import { gridCellCenterToPixel } from "./overlays/utils/gridToPixel";
import { getEmartStoreMapConfig } from "./data/emart-floor-plan";
import { StoreMapFloorBackground } from "./StoreMapFloorBackground";
import { StoreMapOverlays } from "./overlays/StoreMapOverlays";
import type { StoreMapConfig } from "./types";
import type {
  NavigationRouteSnapshot,
  StoreMapNavigationMock,
} from "./overlays/types";
import type { CartLineItem } from "@/contexts/CartContext";
import type { Product } from "@/components/product";
import type { TripZoneLineItem } from "@/lib/shopping/types";
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
  /** API map-config 또는 로컬 fallback */
  storeMapConfig?: StoreMapConfig;
  fitWidth?: number;
  fitHeight?: number;
  /** 탭바 등 하단에 가려지는 영역 — pan·fit 높이에서 제외 */
  contentBottomInset?: number;
  navigationData?: StoreMapNavigationMock;
  /** 새로고침 시에만 설정 — 경로 계산용 스냅샷 */
  routeSnapshot?: NavigationRouteSnapshot | null;
  navigationRefreshKey?: number;
  /** 바코드 수령 완료된 쇼핑 마커 id */
  pickedMarkerIds?: ReadonlySet<string>;
  pickedQuantityByProductId?: Record<string, number>;
  selectedMarkerProductId?: string | null;
  tripLineItems?: CartLineItem[];
  tripZoneItems?: TripZoneLineItem[];
  recommendedProductsById?: Record<string, Product>;
  onShoppingMarkerPress?: (productId: string) => void;
  onRecommendedMarkerPress?: (productId: string) => void;
  /** 지도 빈 곳 탭 */
  onMapTapDismiss?: () => void;
  /** 지도 드래그 등 — 항상 닫기 */
  onDismissMarkerCallout?: () => void;
  showCongestion?: boolean;
  showRoute?: boolean;
};

function shelfGapFromScale(scale: number, fitScale: number): number {
  return getDetailBlend(scale, fitScale) * MAX_SHELF_GAP_PX;
}

export function StoreMapView({
  storeMapConfig: storeMapConfigProp,
  fitWidth = SCREEN_WIDTH * 0.88,
  fitHeight = SCREEN_HEIGHT * 0.55,
  contentBottomInset = 0,
  navigationData,
  routeSnapshot = null,
  navigationRefreshKey = 0,
  pickedMarkerIds,
  pickedQuantityByProductId = {},
  selectedMarkerProductId = null,
  tripLineItems = [],
  tripZoneItems = [],
  recommendedProductsById = {},
  onShoppingMarkerPress,
  onRecommendedMarkerPress,
  onMapTapDismiss,
  onDismissMarkerCallout,
  showCongestion = true,
  showRoute = true,
}: StoreMapViewProps) {
  const config = useMemo(
    () => storeMapConfigProp ?? getEmartStoreMapConfig(),
    [storeMapConfigProp],
  );
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
  const hasSelectedMarkerSv = useSharedValue(Boolean(selectedMarkerProductId));

  const scaleRef = useRef(fitScale);
  const navigationDataRef = useRef(navigationData);
  const followUserRef = useRef(true);
  const lastFollowedGridKeyRef = useRef<string | null>(null);
  const lastAutoFocusRefreshKeyRef = useRef<number | null>(null);
  const hasInitialAutoFocusRef = useRef(false);
  const [renderScale, setRenderScale] = useState(fitScale);
  const [shelfGapPx, setShelfGapPx] = useState(() =>
    shelfGapFromScale(fitScale, fitScale)
  );

  const cellPx = BASE_CELL_PX * renderScale;

  navigationDataRef.current = navigationData;

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

  useEffect(() => {
    hasSelectedMarkerSv.value = Boolean(selectedMarkerProductId);
  }, [hasSelectedMarkerSv, selectedMarkerProductId]);

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
      minX = overflowX > 0 ? -overflowX - MAP_PAN_HORIZONTAL_EXTRA_PX : (vw - scaledW) / 2;
      maxX = overflowX > 0 ? MAP_PAN_HORIZONTAL_EXTRA_PX : (vw - scaledW) / 2;
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

  const panToUserAtScale = useCallback(
    (targetScale: number) => {
      const location = navigationDataRef.current?.currentLocation;
      if (!location || viewportSize.width <= 0 || viewportSize.height <= 0) {
        return;
      }

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
    ],
  );

  const focusOnUserLocation = useCallback(() => {
    const targetScale = clamp(
      fitScale * USER_LOCATION_FOCUS_ZOOM_FACTOR,
      minZoom,
      maxZoom,
    );
    applyScaleState(targetScale);
    panToUserAtScale(targetScale);
    const location = navigationDataRef.current?.currentLocation;
    if (location) {
      lastFollowedGridKeyRef.current = `${location.gridX},${location.gridY}`;
    }
  }, [
    applyScaleState,
    fitScale,
    maxZoom,
    minZoom,
    panToUserAtScale,
  ]);

  const centerOnUserAtCurrentZoom = useCallback(() => {
    panToUserAtScale(scaleRef.current);
    const location = navigationDataRef.current?.currentLocation;
    if (location) {
      lastFollowedGridKeyRef.current = `${location.gridX},${location.gridY}`;
    }
  }, [panToUserAtScale]);

  const markMapManuallyAdjusted = useCallback(() => {
    followUserRef.current = false;
  }, []);

  const gestureJsRef = useRef({
    markMapManuallyAdjusted,
    syncRenderFromScale,
    applyPanClamp,
    onDismissMarkerCallout,
    onMapTapDismiss,
  });
  gestureJsRef.current = {
    markMapManuallyAdjusted,
    syncRenderFromScale,
    applyPanClamp,
    onDismissMarkerCallout,
    onMapTapDismiss,
  };

  const focusOnUserLocationRef = useRef(focusOnUserLocation);
  focusOnUserLocationRef.current = focusOnUserLocation;

  const centerOnUserAtCurrentZoomRef = useRef(centerOnUserAtCurrentZoom);
  centerOnUserAtCurrentZoomRef.current = centerOnUserAtCurrentZoom;

  /** 최초 진입·새로고침: 내 위치 추적 모드 + 초점 맞춤 */
  useEffect(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }

    const isRefresh = lastAutoFocusRefreshKeyRef.current !== navigationRefreshKey;
    const isInitial = !hasInitialAutoFocusRef.current;
    if (!isInitial && !isRefresh) {
      return;
    }

    followUserRef.current = true;
    lastFollowedGridKeyRef.current = null;
    focusOnUserLocationRef.current();
    hasInitialAutoFocusRef.current = true;
    lastAutoFocusRefreshKeyRef.current = navigationRefreshKey;
  }, [navigationRefreshKey, viewportSize.height, viewportSize.width]);

  /** 추적 모드일 때만 비콘 위치에 맞춰 지도 중심 이동 (확대 배율 유지) */
  useEffect(() => {
    if (!followUserRef.current) {
      return;
    }
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }

    const location = navigationData?.currentLocation;
    if (!location) {
      return;
    }

    const gridKey = `${location.gridX},${location.gridY}`;
    if (lastFollowedGridKeyRef.current === gridKey) {
      return;
    }

    if (!hasInitialAutoFocusRef.current) {
      return;
    }

    centerOnUserAtCurrentZoomRef.current();
  }, [
    navigationData?.currentLocation.gridX,
    navigationData?.currentLocation.gridY,
    viewportSize.height,
    viewportSize.width,
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

  const composed = useMemo(() => {
    const invokeMarkAdjusted = () => {
      gestureJsRef.current.markMapManuallyAdjusted();
    };
    const invokeSyncRender = (nextScale: number) => {
      gestureJsRef.current.syncRenderFromScale(nextScale);
    };
    const invokeApplyPanClamp = (nextScale: number) => {
      gestureJsRef.current.applyPanClamp(nextScale);
    };
    const invokeDismissCallout = () => {
      gestureJsRef.current.onDismissMarkerCallout?.();
    };
    const invokeMapTapDismiss = () => {
      gestureJsRef.current.onMapTapDismiss?.();
    };

    const pinch = Gesture.Pinch()
      .shouldCancelWhenOutside(false)
      .onStart(() => {
        runOnJS(invokeMarkAdjusted)();
        savedScale.value = scale.value;
        savedPanX.value = panX.value;
        savedPanY.value = panY.value;
      })
      .onUpdate((e) => {
        const prevScale = scale.value;
        const next = clamp(savedScale.value * e.scale, minZoomSv.value, maxZoomSv.value);
        const ratio = prevScale > 0 ? next / prevScale : 1;
        scale.value = next;
        syncOpacityWorklet(next);
        runOnJS(invokeSyncRender)(next);

        const vw = viewportW.value;
        const vh = viewportH.value - contentBottomInsetSv.value;
        const sw = mapW.value * next;
        const sh = mapH.value * next;

        if (next <= minZoomSv.value * (1 + FIT_SCALE_EPSILON)) {
          panX.value = (vw - sw) / 2;
          panY.value = (vh - sh) / 2;
        } else {
          const cx = vw / 2;
          const cy = vh / 2;
          const nextPanX = cx - (cx - panX.value) * ratio;
          const nextPanY = cy - (cy - panY.value) * ratio;
          const p = clampPanWorklet(nextPanX, nextPanY, next);
          panX.value = p.x;
          panY.value = p.y;
        }
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        savedPanX.value = panX.value;
        savedPanY.value = panY.value;
        if (scale.value > minZoomSv.value * (1 + FIT_SCALE_EPSILON)) {
          runOnJS(invokeApplyPanClamp)(scale.value);
        }
      });

    const pan = Gesture.Pan()
      .minDistance(4)
      .shouldCancelWhenOutside(false)
      .onStart(() => {
        runOnJS(invokeMarkAdjusted)();
        if (hasSelectedMarkerSv.value) {
          runOnJS(invokeDismissCallout)();
        }
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

    const tapDismiss = Gesture.Tap()
      .maxDistance(14)
      .onEnd(() => {
        if (hasSelectedMarkerSv.value) {
          runOnJS(invokeMapTapDismiss)();
        }
      });

    return Gesture.Simultaneous(pinch, pan, tapDismiss);
    // Shared values + gestureJsRef only — never rebuild when selection/callbacks change.
  }, [
    hasSelectedMarkerSv,
    maxZoomSv,
    minZoomSv,
    panX,
    panY,
    savedPanX,
    savedPanY,
    savedScale,
    scale,
    viewportH,
    viewportW,
    contentBottomInsetSv,
    mapH,
    mapW,
  ]);

  const animatedMapStyle = useAnimatedStyle(() => {
    const s = scale.value;
    return {
      position: "absolute",
      left: 0,
      top: 0,
      width: mapW.value * s,
      height: mapH.value * s,
      transform: [
        { translateX: panX.value },
        { translateY: panY.value },
      ],
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
          onWheel: (e: {
            preventDefault?: () => void;
            stopPropagation?: () => void;
            deltaY: number;
            target?: EventTarget | null;
            nativeEvent?: { target?: EventTarget | null };
          }) => {
            const target = e.target ?? e.nativeEvent?.target;
            if (
              target instanceof Element &&
              target.closest('[data-map-callout-scroll="true"]')
            ) {
              return;
            }
            e.preventDefault?.();
            markMapManuallyAdjusted();
            const delta = e.deltaY > 0 ? -ZOOM_STEP * fitScale : ZOOM_STEP * fitScale;
            applyScaleState(scaleRef.current + delta);
          },
        }
      : {};

  return (
    <View style={styles.root}>
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
          <Animated.View
            style={styles.gestureSurface}
            collapsable={false}
            {...(Platform.OS === "android" ? { needsOffscreenAlphaCompositing: true } : {})}
          >
            <Animated.View style={animatedMapStyle} pointerEvents="box-none">
              <View
                pointerEvents="box-none"
                style={{ width: config.cols * cellPx, height: config.rows * cellPx }}
              >
                <StoreMapFloorBackground
                  width={config.cols * cellPx}
                  height={config.rows * cellPx}
                  mapImageUrl={config.mapImageUrl}
                />
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
                  routeSnapshot={routeSnapshot}
                  navigationRefreshKey={navigationRefreshKey}
                  pickedMarkerIds={pickedMarkerIds}
                  pickedQuantityByProductId={pickedQuantityByProductId}
                  selectedMarkerProductId={selectedMarkerProductId}
                  tripLineItems={tripLineItems}
                  tripZoneItems={tripZoneItems}
                  recommendedProductsById={recommendedProductsById}
                  onShoppingMarkerPress={onShoppingMarkerPress}
                  onRecommendedMarkerPress={onRecommendedMarkerPress}
                  showCongestion={showCongestion}
                  showRoute={showRoute}
                />
              </View>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
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
