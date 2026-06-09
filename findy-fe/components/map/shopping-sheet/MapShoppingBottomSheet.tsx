import { BarcodePointRewardModal } from "@/components/map/BarcodePointRewardModal";
import { ScanBarcodeCancelModal } from "@/components/map/ScanBarcodeCancelModal";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { usePoints } from "@/contexts/PointsContext";
import { COLORS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { cancelActiveShoppingListIfExists } from "@/lib/shopping/cancelActiveShoppingListIfExists";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useToast } from "@/contexts/ToastContext";
import { useMapShoppingNotifications } from "@/contexts/MapShoppingNotificationContext";
import { type Href, useRouter } from "expo-router";
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
import { orderShoppingItemsByDestinationGridIds } from "@/lib/map/pathUtils";
import { orderShoppingMinimumRoute } from "@/components/store-map/overlays/utils/orderShoppingRoute";
import { ScanBarcodeRequiredModal } from "@/components/map/ScanBarcodeRequiredModal";
import { MapShoppingSheetEmpty } from "./MapShoppingSheetEmpty";
import { MapShoppingSheetFooter } from "./MapShoppingSheetFooter";
import { MapShoppingSheetItem } from "./MapShoppingSheetItem";
import { MapShoppingSheetZoneItem } from "./MapShoppingSheetZoneItem";
import { buildTripSheetRows } from "./buildTripSheetRows";
import { isProductLineItem } from "@/lib/shopping/shoppingListItemUtils";
import { MapShopLaterConfirmModal } from "./MapShopLaterConfirmModal";
import { MapFinishShoppingConfirmModal } from "./MapFinishShoppingConfirmModal";
import { getApiErrorMessage } from "@/lib/api";
import {
  decreaseShoppingListItemByScan,
  returnShoppingListItemToCart,
  scanShoppingListItem,
} from "@/lib/shopping/api";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import {
  mapShoppingListApiToCategoryLineItems,
  mapShoppingListApiToLineItems,
} from "@/lib/shopping/mappers";
import type { ShoppingListApi } from "@/lib/shopping/types";
import { barcodesMatch } from "@/lib/shopping/normalizeBarcode";
import { findShoppingListItemByProductId } from "@/lib/shopping/resolveShoppingListItem";
import { rollBarcodePointReward } from "@/utils/barcodePointReward";

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
  const { refreshCart } = useCart();
  const { setCheckoutFromTrip } = useCheckout();
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
  const scanInFlightRef = useRef(false);
  const cancelScanModalRef = useRef(cancelScanModal);
  cancelScanModalRef.current = cancelScanModal;
  const { showToast } = useToast();
  const { notifyBarcodeScanPromoIfNeeded } = useMapShoppingNotifications();
  const scrollY = useSharedValue(0);
  const { addPendingBarcodeReward, clearPendingBarcodeRewards } = usePoints();
  const {
    navigationData,
    pathNavigation,
    tripLineItems,
    tripZoneItems,
    pickedQuantityByProductId,
    hasActiveTrip,
    endShoppingTrip,
    removeTripItem,
    removeTripZoneItem,
    setTripItemQuantity,
    syncShoppingTrip,
  } = useMapNavigation();

  const syncFromShoppingList = useCallback(
    (shoppingList: ShoppingListApi) => {
      syncShoppingTrip(
        mapShoppingListApiToLineItems(shoppingList).filter(isProductLineItem),
        shoppingList.shoppingListId,
        shoppingList.destinationGridIds,
        mapShoppingListApiToCategoryLineItems(shoppingList),
      );
    },
    [syncShoppingTrip],
  );

  const routeProductIds = useMemo(() => {
    const config = getEmartStoreMapConfig();
    if (pathNavigation?.destinationGridIds.length) {
      return orderShoppingItemsByDestinationGridIds(
        navigationData.shoppingItems,
        pathNavigation.destinationGridIds,
        config.cols,
      ).map((item) => item.id);
    }
    return orderShoppingMinimumRoute(
      config,
      navigationData.currentLocation,
      navigationData.shoppingItems,
    ).map((item) => item.id);
  }, [
    navigationData.currentLocation,
    navigationData.shoppingItems,
    pathNavigation,
  ]);

  const tripSheetRows = useMemo(
    () =>
      buildTripSheetRows(
        tripLineItems.filter(isProductLineItem),
        tripZoneItems,
        pickedQuantityByProductId,
        routeProductIds,
      ),
    [tripLineItems, tripZoneItems, pickedQuantityByProductId, routeProductIds],
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
      await cancelActiveShoppingListIfExists();
      await refreshCart();

      clearPendingBarcodeRewards();
      endShoppingTrip();
      setShopLaterModalVisible(false);
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "쇼핑을 종료하지 못했습니다. 다시 시도해 주세요.";
      showToast(message);
      if (__DEV__) {
        console.warn("[MapShoppingBottomSheet] shopLater", error);
      }
    }
  };

  const handleFinishShopping = () => {
    onDismissProductCallout?.();
    if (!hasActiveTrip) {
      setScanBarcodeModalVisible(true);
      return;
    }

    const productItems = tripLineItems.filter(isProductLineItem);
    const hasProductItems = productItems.length > 0;

    if (!hasProductItems) {
      setScanBarcodeModalVisible(true);
      return;
    }

    const totalPicked = productItems.reduce(
      (sum, line) => sum + (pickedQuantityByProductId[line.productId] ?? 0),
      0,
    );
    if (totalPicked === 0) {
      setScanBarcodeModalVisible(true);
      return;
    }

    const hasUnpicked = productItems.some((line) => {
      const picked = pickedQuantityByProductId[line.productId] ?? 0;
      return picked < line.quantity;
    });
    if (hasUnpicked) {
      setFinishShoppingModalVisible(true);
      return;
    }
    setCheckoutFromTrip(tripLineItems, pickedQuantityByProductId);
    router.push("/payment" as Href);
  };

  const handleCancelFinishShopping = () => {
    setFinishShoppingModalVisible(false);
  };

  const handleConfirmFinishShopping = () => {
    setCheckoutFromTrip(tripLineItems, pickedQuantityByProductId);
    setFinishShoppingModalVisible(false);
    router.push("/payment" as Href);
  };

  const presentCancelToast = useCallback(
    (productName: string) => {
      showToast(formatProductCanceledMessage(productName), CANCEL_TOAST_DURATION_MS);
    },
    [showToast],
  );

  const handleScannerScan = useCallback(
    async (barcode: string) => {
      const cancelModal = cancelScanModalRef.current;

      if (cancelModal) {
        if (cancelScanHandledRef.current) return;

        const line = tripLineItems.find(
          (item) => item.productId === cancelModal.productId,
        );
        const expectedBarcode = line?.product.barcode;
        if (expectedBarcode && !barcodesMatch(expectedBarcode, barcode)) {
          console.warn("취소 대상 상품과 바코드가 일치하지 않습니다.");
          return;
        }

        cancelScanHandledRef.current = true;

        try {
          const canceledProductName = cancelModal.productName;
          const shoppingList = await decreaseShoppingListItemByScan(barcode, 1);
          syncFromShoppingList(shoppingList);
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
          console.error("바코드 취소 스캔 반영 실패:", error);
        }
        return;
      }

      if (!hasActiveTrip) return;
      if (scanInFlightRef.current) return;

      const lineBefore = tripLineItems.find((item) =>
        barcodesMatch(item.product.barcode, barcode),
      );

      const applyPointRewardRoll = () => {
        const rewardPoints = rollBarcodePointReward();
        if (rewardPoints !== null) {
          addPendingBarcodeReward(rewardPoints);
          setPointRewardModal({ visible: true, points: rewardPoints });
        }
      };

      scanInFlightRef.current = true;
      try {
        const shoppingList = await scanShoppingListItem(barcode, 1);
        syncFromShoppingList(shoppingList);
        const nextLineItems = mapShoppingListApiToLineItems(shoppingList).filter(
          isProductLineItem,
        );

        const lineAfter =
          nextLineItems.find((item) =>
            barcodesMatch(item.product.barcode, barcode),
          ) ??
          (lineBefore
            ? nextLineItems.find(
                (item) => item.productId === lineBefore.productId,
              )
            : undefined) ??
          nextLineItems.find((item) => {
            const before = tripLineItems.find(
              (entry) => entry.productId === item.productId,
            );
            const beforePicked = before
              ? (pickedQuantityByProductId[before.productId] ??
                before.scannedQuantity ??
                0)
              : 0;
            return (item.scannedQuantity ?? 0) > beforePicked;
          });

        const scannedLine = lineAfter ?? lineBefore;
        if (!scannedLine) {
          return;
        }

        applyPointRewardRoll();

        if (lineAfter) {
          const newPicked = lineAfter.scannedQuantity ?? 0;
          const beforePicked = lineBefore
            ? (pickedQuantityByProductId[lineBefore.productId] ??
              lineBefore.scannedQuantity ??
              0)
            : 0;

          if (newPicked > beforePicked) {
            const totalScanCount = nextLineItems.reduce(
              (sum, item) => sum + (item.scannedQuantity ?? 0),
              0,
            );
            notifyBarcodeScanPromoIfNeeded(totalScanCount, lineAfter.product);
          }
        }
      } catch (error) {
        console.error("바코드 스캔 반영 실패:", error);
        if (lineBefore) {
          applyPointRewardRoll();
        }
      } finally {
        scanInFlightRef.current = false;
      }
    },
    [
      addPendingBarcodeReward,
      hasActiveTrip,
      pickedQuantityByProductId,
      presentCancelToast,
      notifyBarcodeScanPromoIfNeeded,
      syncFromShoppingList,
      tripLineItems,
    ],
  );

  useBarcodeScanner({
    enabled: hasActiveTrip || cancelScanModal != null,
    onScan: handleScannerScan,
  });

  const handleRemoveItem = useCallback(
    async (item: CartLineItem) => {
      if (!item.shoppingListItemId) {
        removeTripItem(item.productId);
        return;
      }

      try {
        const shoppingList = await returnShoppingListItemToCart(
          item.shoppingListItemId,
        );
        syncFromShoppingList(shoppingList);
        await refreshCart();
      } catch (error) {
        showToast(
          getApiErrorMessage(error) ||
            "장바구니로 옮기지 못했어요. 다시 시도해 주세요.",
        );
      }
    },
    [refreshCart, removeTripItem, showToast, syncFromShoppingList],
  );

  const handleRemoveZone = useCallback(
    async (categoryId: number) => {
      try {
        await removeTripZoneItem(categoryId);
      } catch (error) {
        showToast(
          getApiErrorMessage(error) ||
            "구역을 삭제하지 못했어요. 다시 시도해 주세요.",
        );
      }
    },
    [removeTripZoneItem, showToast],
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

  const handleDismissCancelModal = useCallback(() => {
    setCancelScanModal(null);
  }, []);

  const handleTripItemQuantityChange = useCallback(
    async (item: CartLineItem, nextQuantity: number) => {
      const latestItem =
        tripLineItems.find((line) => line.productId === item.productId) ?? item;
      const delta = nextQuantity - latestItem.quantity;

      if (delta === 0) {
        return;
      }

      try {
        if (delta < 0) {
          const { item: serverItem } = await findShoppingListItemByProductId(
            latestItem.productId,
          );
          const serverScanned = serverItem.scannedQuantity ?? 0;
          const nextQty = serverItem.quantity + delta;

          // 스캔 수 아래로 줄이려 할 때만 바코드 취소 모달
          if (serverScanned > 0 && nextQty < serverScanned) {
            setCancelScanModal({
              productId: latestItem.productId,
              productName: latestItem.product.name,
              quantity: serverItem.quantity,
            });
            return;
          }
        }

        await setTripItemQuantity(latestItem, delta);
      } catch (error) {
        showToast(
          getApiErrorMessage(error) ||
            "수량을 변경하지 못했어요. 다시 시도해 주세요.",
        );
      }
    },
    [tripLineItems, setTripItemQuantity, showToast],
  );

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
                  {tripSheetRows.map((row) =>
                    row.kind === "zone" ? (
                      <MapShoppingSheetZoneItem
                        key={`zone-${row.item.categoryId}`}
                        zone={row.item}
                        onRemove={() => void handleRemoveZone(row.item.categoryId)}
                      />
                    ) : (
                      <MapShoppingSheetItem
                        key={row.item.productId}
                        item={row.item}
                        pickedQuantity={
                          pickedQuantityByProductId[row.item.productId] ?? 0
                        }
                        onRemove={() => void handleRemoveItem(row.item)}
                        onQuantityChange={(qty) =>
                          void handleTripItemQuantityChange(row.item, qty)
                        }
                      />
                    ),
                  )}
                </AnimatedScrollView>
              ) : (
                <MapShoppingSheetEmpty />
              )}

              <View style={styles.bottomStack}>
                <MapShoppingSheetFooter
                  tripLineItems={tripLineItems}
                  tripZoneItems={tripZoneItems}
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
