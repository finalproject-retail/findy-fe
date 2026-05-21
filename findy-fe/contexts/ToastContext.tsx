import { Toast } from "@/components/common/Toast";
import { LAYOUT, SPACING } from "@/constants/theme";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TOAST_DURATION_MS = 2000;
const FADE_MS = 200;

type ToastContextValue = {
  showToast: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const TOAST_MESSAGES = {
  addedToCart: "장바구니에 담겼습니다.",
} as const;

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearHideTimer();
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMessage(null);
      }
    });
  }, [clearHideTimer, opacity]);

  const showToast = useCallback(
    (nextMessage: string, durationMs = TOAST_DURATION_MS) => {
      clearHideTimer();
      setMessage(nextMessage);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start();

      hideTimerRef.current = setTimeout(hideToast, durationMs);
    },
    [clearHideTimer, hideToast, opacity],
  );

  useEffect(() => clearHideTimer, [clearHideTimer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          className="items-center"
        >
          <Animated.View
            style={{
              position: "absolute",
              left: SPACING.screen,
              right: SPACING.screen,
              bottom:
                insets.bottom + LAYOUT.tabBarTotalHeight + SPACING.lg,
              opacity,
              alignItems: "center",
            }}
          >
            <Toast message={message} />
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
