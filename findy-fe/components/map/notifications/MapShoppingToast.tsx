import { MAP_OVERLAY_TOP_INSET } from "@/components/map/constants";
import { formatPrice } from "@/components/product";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MapShoppingNotification } from "./types";

export const MAP_SHOPPING_TOAST_DURATION_MS = 6500;
const TOAST_PURPLE = "#FF507C";
const TOAST_BG = "#FFFFFF";
const THUMB_SIZE = 44;
const SWIPE_UP_DISMISS_OFFSET = 50;
const SWIPE_UP_DISMISS_VELOCITY = 0.6;
const DISMISS_SLIDE_OUT = -140;

type MapShoppingToastProps = {
  notification: MapShoppingNotification;
  onDismiss: () => void;
  onPress?: () => void;
};

export function MapShoppingToast({
  notification,
  onDismiss,
  onPress,
}: MapShoppingToastProps) {
  const slideAnim = useRef(new Animated.Value(DISMISS_SLIDE_OUT)).current;
  const [timerProgress, setTimerProgress] = useState(1);
  const dismissedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const { relatedProduct, headline } = notification;

  const clearAutoDismissTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismissWithAnimation = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    dismissedRef.current = true;
    clearAutoDismissTimer();
    Animated.timing(slideAnim, {
      toValue: DISMISS_SLIDE_OUT,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onDismissRef.current();
      }
    });
  }, [clearAutoDismissTimer, slideAnim]);

  const startAutoDismissTimer = useCallback(() => {
    clearAutoDismissTimer();
    const startedAt = Date.now();
    setTimerProgress(1);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, 1 - elapsed / MAP_SHOPPING_TOAST_DURATION_MS);
      setTimerProgress(next);
      if (next <= 0) {
        clearAutoDismissTimer();
        dismissWithAnimation();
      }
    }, 32);
  }, [clearAutoDismissTimer, dismissWithAnimation]);

  const snapBackToVisible = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy < -8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: clearAutoDismissTimer,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy < 0) {
            slideAnim.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldDismiss =
            gesture.dy < -SWIPE_UP_DISMISS_OFFSET ||
            gesture.vy < -SWIPE_UP_DISMISS_VELOCITY;
          if (shouldDismiss) {
            dismissWithAnimation();
            return;
          }
          snapBackToVisible();
          startAutoDismissTimer();
        },
        onPanResponderTerminate: () => {
          snapBackToVisible();
          startAutoDismissTimer();
        },
      }),
    [
      clearAutoDismissTimer,
      dismissWithAnimation,
      slideAnim,
      snapBackToVisible,
      startAutoDismissTimer,
    ],
  );

  useEffect(() => {
    dismissedRef.current = false;
    slideAnim.setValue(DISMISS_SLIDE_OUT);
    setTimerProgress(1);

    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      useNativeDriver: true,
    }).start();

    startAutoDismissTimer();

    return clearAutoDismissTimer;
  }, [
    clearAutoDismissTimer,
    notification.id,
    slideAnim,
    startAutoDismissTimer,
  ]);

  return (
    <View style={styles.overlayHost} pointerEvents="box-none">
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.toastAnchor,
          {
            top: MAP_OVERLAY_TOP_INSET,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.shadowShell} pointerEvents="auto">
          <Pressable
            onPress={() => {
              if (onPress) {
                onPress();
                return;
              }
              dismissWithAnimation();
            }}
            accessibilityRole="button"
            accessibilityLabel="추천 상품 알림 보기"
            style={styles.toast}
          >
            <View style={styles.contentRow}>
              <Image
                source={relatedProduct.image}
                style={styles.thumb}
                contentFit="cover"
              />
              <View style={styles.textCol}>
                <Text style={styles.headline} numberOfLines={2}>
                  {headline}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {relatedProduct.name}
                </Text>
                <Text style={styles.price}>
                  {formatPrice(relatedProduct.price)}
                </Text>
              </View>
            </View>
            <View style={styles.timerTrack}>
              <View
                style={[styles.timerFill, { width: `${timerProgress * 100}%` }]}
              />
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 100,
  },
  toastAnchor: {
    position: "absolute",
    left: SPACING.screen,
    right: SPACING.screen,
    zIndex: 1,
  },
  shadowShell: {
    borderRadius: RADIUS.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 30,
    backgroundColor: TOAST_BG,
  },
  toast: {
    borderRadius: RADIUS.md,
    backgroundColor: TOAST_BG,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  headline: {
    ...pretendard(600),
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  subtitle: {
    ...pretendard(400),
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.subText,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  price: {
    ...pretendard(500),
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.subText,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  timerTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  timerFill: {
    height: "100%",
    backgroundColor: TOAST_PURPLE,
  },
});
