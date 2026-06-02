import { BarcodePointRewardModal } from "@/components/map/BarcodePointRewardModal";
import { ScanBarcodeCancelModal } from "@/components/map/ScanBarcodeCancelModal";
import { useMapBarcodePick, useMapNavigation } from "@/contexts/MapNavigationContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { usePoints } from "@/contexts/PointsContext";
import { COLORS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import {
  sumTripScannedUnits,
  useMapShoppingNotifications,
} from "@/contexts/MapShoppingNotificationContext";
import { useRouter } from "expo-router";
import { formatProductCanceledMessage } from "@/utils/koreanParticle";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  clamp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SHEET_BORDER_RADIUS,
  SHEET_HANDLE_HEIGHT,
  SHEET_HANDLE_ROW_HEIGHT,
  SHEET_HANDLE_WIDTH,
  SHEET_EXPANDED_MAX_PX,
  SHEET_MAX_HEIGHT_RATIO,
  SHEET_PEEK_HANDLE_BLOCK_HEIGHT,
} from "./constants";
import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import { orderShoppingMinimumRoute } from "@/components/store-map/overlays/utils/orderShoppingRoute";
import { ScanBarcodeRequiredModal } from "@/components/map/ScanBarcodeRequiredModal";
import { MapShoppingSheetEmpty } from "./MapShoppingSheetEmpty";
import { MapShoppingSheetFooter } from "./MapShoppingSheetFooter";
import { MapShoppingSheetItem } from "./MapShoppingSheetItem";
import { sortTripLineItemsForChecklist } from "./sortTripLineItems";
import { MapShopLaterConfirmModal } from "./MapShopLaterConfirmModal";
import { MapFinishShoppingConfirmModal } from "./MapFinishShoppingConfirmModal";
import { scanShoppingListItem } from "@/lib/shopping/api";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { mapShoppingListApiToLineItems } from "@/lib/shopping/mappers";

const SNAP_MS = 260;
const CANCEL_TOAST_DURATION_MS = 2000;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type MapShoppingBottomSheetProps = {
  peekHeight: number;
  collapsedBottomLift: number;
  onVisibleHeightChange?: (height: number) => void;
  onDismissProductCallout?: () => void;
};

export function MapShoppingBottomSheet({
  peekHeight,
  collapsedBottomLift,
  onVisibleHeightChange,
  onDismissProductCallout,
}: MapShoppingBottomSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { addToCart } = useCart();
  const [showBody, setShowBodyVisible] = useState(true);
  const [scanBarcodeModalVisible, setScanBarcodeModalVisible] = useState(false);
  const [shopLaterModalVisible, setShopLaterModalVisible] = useState(false);
  const [finishShoppingModalVisible, setFinishShoppingModalVisible] =
    useState(false);
  const [pointRewardModal, setPointRewardModal] = useState<{
    visible: boolean;
    points: number;
  }>({ visible: false, points: 0 });
  const [cancelScanModal, setCancelScanModal] = useState<{
    productId: string;
    productName: string;
    quantity: number;
  } | null>(null);
  const cancelToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelScanHandledRef = useRef(false);
  const cancelScanModalRef = useRef(cancelScanModal);
  cancelScanModalRef.current = cancelScanModal;
  const { showToast } = useToast();
  const { maybeShowPromoNotification } = useMapShoppingNotifications();
  const scrollY = useSharedValue(0);
  const { pickProductFromBarcode } = useMapBarcodePick();
  const { commitPendingBarcodeRewards, clearPendingBarcodeRewards } = usePoints();
  const {
    navigationData,
    tripLineItems,
    pickedQuantityByProductId,
    hasActiveTrip,
    endShoppingTrip,
    removeTripItem,
    setTripItemQuantity,
    syncShoppingTrip,
  } = useMapNavigation();

  const routeProductIds = useMemo(() => {
    const config = getEmartStoreMapConfig();
    return orderShoppingMinimumRoute(
      config,
      navigationData.currentLocation,
      navigationData.shoppingItems,
    ).map((item) => item.id);
  }, [navigationData.currentLocation, navigationData.shoppingItems]);

  const sortedTripLineItems = useMemo(
    () =>
      sortTripLineItemsForChecklist(
        tripLineItems,
        pickedQuantityByProductId,
        routeProductIds,
      ),
    [tripLineItems, pickedQuantityByProductId, routeProductIds],
  );

  const expandedContentHeight = useMemo(
    () =>
      Math.min(
        screenHeight * SHEET_MAX_HEIGHT_RATIO,
        SHEET_EXPANDED_MAX_PX,
      ),
    [screenHeight],
  );

  const collapsedHeight = peekHeight;
  const expandedHeight = collapsedHeight + expandedContentHeight;
  const sheetHeight = useSharedValue(expandedHeight);
  const dragStartHeight = useSharedValue(expandedHeight);

  const updateShowBody = useCallback((visible: boolean) => {
    setShowBodyVisible(visible);
  }, []);

  const getTotalVisibleHeight = useCallback(
    (contentHeight: number) => {
      const expandRange = Math.max(expandedHeight - collapsedHeight, 1);
      const expandProgress = clamp(
        (contentHeight - collapsedHeight) / expandRange,
        0,
        1,
      );
      const bottomFill = interpolate(
        expandProgress,
        [0, 1],
        [collapsedBottomLift, 0],
      );
      return contentHeight + bottomFill;
    },
    [collapsedBottomLift, collapsedHeight, expandedHeight],
  );

  const reportVisibleHeight = useCallback(
    (contentHeight: number) => {
      onVisibleHeightChange?.(getTotalVisibleHeight(contentHeight));
    },
    [getTotalVisibleHeight, onVisibleHeightChange],
  );

  useEffect(() => {
    reportVisibleHeight(expandedHeight);
  }, [expandedHeight, reportVisibleHeight]);

  useAnimatedReaction(
    () => sheetHeight.value,
    (current, previous) => {
      if (previous === null || Math.abs(current - previous) > 6) {
        runOnJS(reportVisibleHeight)(current);
      }
    },
  );

  useEffect(() => {
    if (sheetHeight.value > collapsedHeight + 16) {
      sheetHeight.value = withTiming(expandedHeight, {
        duration: SNAP_MS,
        easing: Easing.out(Easing.cubic),
      });
      setShowBodyVisible(true);
    }
  }, [collapsedHeight, expandedHeight, sheetHeight]);

  const panGesture = useMemo(() => {
    const minH = collapsedHeight;
    const maxH = expandedHeight;

    return Gesture.Pan()
      .manualActivation(true)
      .onTouchesMove((_, state) => {
        if (sheetHeight.value <= minH + 1) {
          state.activate();
          return;
        }
        if (scrollY.value <= 2) {
          state.activate();
        } else {
          state.fail();
        }
      })
      .onStart(() => {
        if (onDismissProductCallout) {
          runOnJS(onDismissProductCallout)();
        }
        dragStartHeight.value = sheetHeight.value;
        if (sheetHeight.value <= minH + 1) {
          runOnJS(updateShowBody)(true);
        }
      })
      .onUpdate((event) => {
        sheetHeight.value = clamp(
          dragStartHeight.value - event.translationY,
          minH,
          maxH,
        );
      })
      .onEnd((event) => {
        "worklet";
        const mid = (minH + maxH) / 2;
        const shouldExpand =
          event.velocityY < -200 || sheetHeight.value > mid;
        const target = shouldExpand ? maxH : minH;

        if (shouldExpand) {
          runOnJS(updateShowBody)(true);
        } else {
          runOnJS(updateShowBody)(false);
        }

        sheetHeight.value = withTiming(target, {
          duration: SNAP_MS,
          easing: Easing.out(Easing.cubic),
        });
      });
  }, [
    collapsedHeight,
    dragStartHeight,
    expandedHeight,
    scrollY,
    sheetHeight,
    onDismissProductCallout,
    updateShowBody,
  ]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const expandRange = Math.max(expandedHeight - collapsedHeight, 1);
    const expandProgress = clamp(
      (sheetHeight.value - collapsedHeight) / expandRange,
      0,
      1,
    );

    const bottomFill = interpolate(
      expandProgress,
      [0, 1],
      [collapsedBottomLift, 0],
    );

    return {
      height: sheetHeight.value + bottomFill,
      bottom: 0,
    };
  });

  const bodySlotStyle = useAnimatedStyle(() => ({
    height: Math.max(0, sheetHeight.value - collapsedHeight),
    overflow: "hidden" as const,
  }));

  const peekBottomFillStyle = useAnimatedStyle(() => {
    const expandRange = Math.max(expandedHeight - collapsedHeight, 1);
    const expandProgress = clamp(
      (sheetHeight.value - collapsedHeight) / expandRange,
      0,
      1,
    );

    return {
      height: interpolate(expandProgress, [0, 1], [collapsedBottomLift, 0]),
    };
  });

  const handleShopLater = () => {
    onDismissProductCallout?.();
    if (hasActiveTrip) {
      setShopLaterModalVisible(true);
      return;
    }
    router.replace("/(tabs)");
  };

  const handleCancelShopLater = () => {
    setShopLaterModalVisible(false);
  };

  const handleConfirmShopLater = async () => {
    try {
      for (const line of tripLineItems) {
        await addToCart(line.product, line.quantity);
      }

      clearPendingBarcodeRewards();
      endShoppingTrip();
      setShopLaterModalVisible(false);
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinishShopping = () => {
    onDismissProductCallout?.();
    if (!hasActiveTrip) {
      setScanBarcodeModalVisible(true);
      return;
    }
    const hasUnpicked = tripLineItems.some((line) => {
      const picked = pickedQuantityByProductId[line.productId] ?? 0;
      return picked < line.quantity;
    });
    if (hasUnpicked) {
      setFinishShoppingModalVisible(true);
      return;
    }
    void commitPendingBarcodeRewards();
    endShoppingTrip();
    router.replace("/(tabs)");
  };

  const handleCancelFinishShopping = () => {
    setFinishShoppingModalVisible(false);
  };

  const handleConfirmFinishShopping = () => {
    void commitPendingBarcodeRewards();
    endShoppingTrip();
    setFinishShoppingModalVisible(false);
    router.replace("/(tabs)");
  };

  const handleBarcodePick = useCallback(
    async (productId: string) => {
      const line = tripLineItems.find((item) => item.productId === productId);
      if (!line) return;

      const barcode = line.product.barcode;
      if (!barcode) {
        console.warn("barcode가 없는 상품은 스캔 처리할 수 없습니다.");
        return;
      }

      try {
        const prevScanned =
          pickedQuantityByProductId[productId] ?? line.scannedQuantity ?? 0;

        const shoppingList = await scanShoppingListItem(barcode, 1);
        const nextLineItems = mapShoppingListApiToLineItems(shoppingList);
        syncShoppingTrip(nextLineItems);

        const matchedAfter = nextLineItems.find(
          (item) => item.productId === productId,
        );
        const nextScanned = matchedAfter?.scannedQuantity ?? prevScanned;

        if (matchedAfter && nextScanned > prevScanned) {
          const totalScanned = sumTripScannedUnits(nextLineItems);
          maybeShowPromoNotification(matchedAfter.product, totalScanned);
          const rewardPoints = pickProductFromBarcode(productId);
          if (rewardPoints !== null) {
            setPointRewardModal({ visible: true, points: rewardPoints });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [
      maybeShowPromoNotification,
      pickProductFromBarcode,
      pickedQuantityByProductId,
      syncShoppingTrip,
      tripLineItems,
    ],
  );

  const handleScannerScan = useCallback(
    async (barcode: string) => {
      try {
        const matchedBefore = tripLineItems.find(
          (line) => line.product.barcode === barcode,
        );
        const prevScanned = matchedBefore
          ? (pickedQuantityByProductId[matchedBefore.productId] ??
            matchedBefore.scannedQuantity ??
            0)
          : 0;

        const shoppingList = await scanShoppingListItem(barcode, 1);
        const nextLineItems = mapShoppingListApiToLineItems(shoppingList);

        syncShoppingTrip(nextLineItems);

        const matchedAfter = nextLineItems.find(
          (line) => line.product.barcode === barcode,
        );
        const nextScanned = matchedAfter?.scannedQuantity ?? prevScanned;

        if (matchedAfter && nextScanned > prevScanned) {
          const totalScanned = sumTripScannedUnits(nextLineItems);
          maybeShowPromoNotification(matchedAfter.product, totalScanned);
          const rewardPoints = pickProductFromBarcode(matchedAfter.productId);
          if (rewardPoints !== null) {
            setPointRewardModal({ visible: true, points: rewardPoints });
          }
        }
      } catch (error) {
        console.error("바코드 스캔 반영 실패:", error);
      }
    },
    [
      pickProductFromBarcode,
      pickedQuantityByProductId,
      maybeShowPromoNotification,
      syncShoppingTrip,
      tripLineItems,
    ],
  );

  useBarcodeScanner({
    enabled: hasActiveTrip,
    onScan: handleScannerScan,
  });

  const handleRemoveItem = useCallback(
    async (item: CartLineItem) => {
      const picked = pickedQuantityByProductId[item.productId] ?? 0;
      const isFullyPicked = picked >= item.quantity;

      if (isFullyPicked) {
        setCancelScanModal({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
        });
        return;
      }

      try {
        await addToCart(item.product, item.quantity);
        removeTripItem(item.productId);
      } catch (error) {
        console.error(error);
      }
    },
    [addToCart, pickedQuantityByProductId, removeTripItem],
  );

  const presentCancelToast = useCallback(
    (productName: string) => {
      showToast(formatProductCanceledMessage(productName), CANCEL_TOAST_DURATION_MS);
    },
    [showToast],
  );

  useEffect(() => {
    if (cancelScanModal) {
      cancelScanHandledRef.current = false;
    }
  }, [cancelScanModal]);

  useEffect(() => {
    return () => {
      if (cancelToastTimerRef.current) {
        clearTimeout(cancelToastTimerRef.current);
      }
    };
  }, []);

  const handleCancelBarcodeScanned = useCallback(async () => {
    if (cancelScanHandledRef.current) return;
    const modal = cancelScanModalRef.current;
    if (!modal) return;
    cancelScanHandledRef.current = true;

    const canceledProductName = modal.productName;
    const line = tripLineItems.find((item) => item.productId === modal.productId);

    try {
      if (line) {
        await addToCart(line.product, line.quantity);
      }
      removeTripItem(modal.productId);
      setCancelScanModal(null);
      if (cancelToastTimerRef.current) {
        clearTimeout(cancelToastTimerRef.current);
      }
      cancelToastTimerRef.current = setTimeout(() => {
        presentCancelToast(canceledProductName);
        cancelToastTimerRef.current = null;
      }, 250);
    } catch (error) {
      cancelScanHandledRef.current = false;
      console.error(error);
    }
  }, [addToCart, presentCancelToast, removeTripItem, tripLineItems]);

  const handleDismissCancelModal = useCallback(() => {
    setCancelScanModal(null);
  }, []);

  return (
    <>
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheetShell, sheetAnimatedStyle]}>
        <View style={styles.sheetSurface}>
          <View
            style={showBody ? styles.handleRow : styles.handleRowCollapsed}
            hitSlop={{ top: 20, bottom: 16, left: 48, right: 48 }}
          >
            <View style={styles.handle} />
          </View>

          <Animated.View style={[styles.peekBottomFill, peekBottomFillStyle]} />

        {showBody ? (
          <Animated.View style={[styles.bodySlot, bodySlotStyle]}>
            <View style={styles.body}>
              {hasActiveTrip ? (
                <AnimatedScrollView
                  onScroll={scrollHandler}
                  onScrollBeginDrag={onDismissProductCallout}
                  scrollEventThrottle={16}
                  bounces
                  showsVerticalScrollIndicator={false}
                  style={styles.scroll}
                  contentContainerStyle={styles.scrollContent}
                  nestedScrollEnabled
                >
                  {sortedTripLineItems.map((item) => (
                    <MapShoppingSheetItem
                      key={item.productId}
                      item={item}
                      pickedQuantity={
                        pickedQuantityByProductId[item.productId] ?? 0
                      }
                      onRemove={() => handleRemoveItem(item)}
                      onQuantityChange={(qty) =>
                        setTripItemQuantity(item.productId, qty)
                      }
                      onSimulatePick={() => handleBarcodePick(item.productId)}
                    />
                  ))}
                </AnimatedScrollView>
              ) : (
                <MapShoppingSheetEmpty />
              )}

              <View style={styles.bottomStack}>
                <MapShoppingSheetFooter
                  tripLineItems={tripLineItems}
                  pickedQuantityByProductId={pickedQuantityByProductId}
                  onShopLater={handleShopLater}
                  onFinishShopping={handleFinishShopping}
                  bottomInset={insets.bottom}
                />
              </View>
            </View>
          </Animated.View>
        ) : null}
        </View>
      </Animated.View>
    </GestureDetector>

    <ScanBarcodeRequiredModal
      visible={scanBarcodeModalVisible}
      onConfirm={() => setScanBarcodeModalVisible(false)}
    />

    <BarcodePointRewardModal
      visible={pointRewardModal.visible}
      points={pointRewardModal.points}
      onConfirm={() =>
        setPointRewardModal((prev) => ({ ...prev, visible: false }))
      }
    />

    <MapShopLaterConfirmModal
      visible={shopLaterModalVisible}
      onCancel={handleCancelShopLater}
      onConfirm={handleConfirmShopLater}
    />

    <MapFinishShoppingConfirmModal
      visible={finishShoppingModalVisible}
      onCancel={handleCancelFinishShopping}
      onConfirm={handleConfirmFinishShopping}
    />

    <ScanBarcodeCancelModal
      visible={cancelScanModal != null}
      productName={cancelScanModal?.productName ?? ""}
      quantity={cancelScanModal?.quantity ?? 1}
      onBarcodeScanned={handleCancelBarcodeScanned}
      onDismiss={handleDismissCancelModal}
    />

    </>
  );
}

const styles = StyleSheet.create({
  sheetShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#1C1C1C",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 28,
  },
  sheetSurface: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SHEET_BORDER_RADIUS,
    borderTopRightRadius: SHEET_BORDER_RADIUS,
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  handleRow: {
    height: SHEET_HANDLE_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  handleRowCollapsed: {
    height: SHEET_PEEK_HANDLE_BLOCK_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  peekBottomFill: {
    backgroundColor: COLORS.white,
  },
  handle: {
    width: SHEET_HANDLE_WIDTH,
    height: SHEET_HANDLE_HEIGHT,
    borderRadius: SHEET_HANDLE_HEIGHT / 2,
    backgroundColor: COLORS.gray,
  },
  bodySlot: {
    overflow: "hidden",
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xs,
  },
  bottomStack: {
    flexShrink: 0,
  },
});
