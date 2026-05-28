import { formatPrice } from "@/components/product";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MapShoppingNotification } from "./types";

export const MAP_SHOPPING_TOAST_DURATION_MS = 5000;
const TOAST_PURPLE = "#7C3AED";
const TOAST_BG = "#2B2D31";
const THUMB_SIZE = 44;
const TOP_GAP = 6;

type MapShoppingToastProps = {
  notification: MapShoppingNotification;
  onDismiss: () => void;
};

export function MapShoppingToast({
  notification,
  onDismiss,
}: MapShoppingToastProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(-140)).current;
  const [timerProgress, setTimerProgress] = useState(1);
  const dismissedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const { relatedProduct, headline } = notification;

  const dismissWithAnimation = useCallback(() => {
    if (dismissedRef.current) {
      return;
    }
    dismissedRef.current = true;
    Animated.timing(slideAnim, {
      toValue: -140,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onDismissRef.current();
      }
    });
  }, [slideAnim]);

  useEffect(() => {
    dismissedRef.current = false;
    slideAnim.setValue(-140);
    setTimerProgress(1);

    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      useNativeDriver: true,
    }).start();

    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, 1 - elapsed / MAP_SHOPPING_TOAST_DURATION_MS);
      setTimerProgress(next);
      if (next <= 0) {
        clearInterval(tick);
        dismissWithAnimation();
      }
    }, 32);

    return () => clearInterval(tick);
  }, [dismissWithAnimation, notification.id, slideAnim]);

  const toastMaxWidth = Platform.OS === "web" ? Math.min(windowWidth, 480) : windowWidth;
  const horizontalPad = SPACING.screen;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissWithAnimation}
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.toastAnchor,
            {
              top: insets.top + TOP_GAP,
              paddingHorizontal: horizontalPad,
              maxWidth: toastMaxWidth,
              alignSelf: "center",
              width: "100%",
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.shadowShell}>
            <Pressable
              onPress={dismissWithAnimation}
              accessibilityRole="button"
              accessibilityLabel="연관 상품 알림 닫기"
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
                  style={[
                    styles.timerFill,
                    { width: `${timerProgress * 100}%` },
                  ]}
                />
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "transparent",
  },
  toastAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
  },
  shadowShell: {
    borderRadius: RADIUS.lg,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 30,
    backgroundColor: TOAST_BG,
  },
  toast: {
    borderRadius: RADIUS.lg,
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
    color: COLORS.white,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  subtitle: {
    ...pretendard(400),
    fontSize: 13,
    lineHeight: 18,
    color: "#B5BAC1",
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  price: {
    ...pretendard(500),
    fontSize: 13,
    lineHeight: 18,
    color: "#DCDDDE",
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
