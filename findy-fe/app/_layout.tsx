import { AuthGuard } from "@/components/auth/AuthGuard";
import { FloatingChatbotButton } from "@/components/chatbot";
import { AuthProvider } from "@/contexts/AuthContext";
import { BeaconLocationProvider } from "@/contexts/BeaconLocationContext";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { MapNavigationProvider } from "@/contexts/MapNavigationContext";
import { MapShoppingNotificationProvider } from "@/contexts/MapShoppingNotificationContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { RecentSearchProvider } from "@/contexts/RecentSearchContext";
import { StoreMapConfigProvider } from "@/contexts/StoreMapConfigContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="points" />
        <Stack.Screen name="recently-viewed" />
        <Stack.Screen name="purchase-history/index" />
        <Stack.Screen name="purchase-history/[orderId]" />
        <Stack.Screen name="faq" />
        <Stack.Screen name="search" />
        <Stack.Screen name="category" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="shopping-course" />
        <Stack.Screen name="route-generating" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="payment-coupons" />
        <Stack.Screen name="payment-qr" />
        <Stack.Screen name="payment-complete" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="chatbot" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="oauth" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack>
      <FloatingChatbotButton />
    </View>
  );
}

function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <CartProvider>
          <RecentSearchProvider>
            <CheckoutProvider>
              <PointsProvider>
                <StoreMapConfigProvider>
                  <MapNavigationProvider>
                    <BeaconLocationProvider>
                      <MapShoppingNotificationProvider>
                        <ToastProvider>
                          <AuthGuard>{children}</AuthGuard>
                        </ToastProvider>
                      </MapShoppingNotificationProvider>
                    </BeaconLocationProvider>
                  </MapNavigationProvider>
                </StoreMapConfigProvider>
              </PointsProvider>
            </CheckoutProvider>
          </RecentSearchProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function BootSplashOverlay() {
  return (
    <View style={styles.bootSplash} pointerEvents="auto">
      <Image
        source={require("../assets/images/splash-logo.png")}
        style={{ width: 87 }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [loaded, error] = useFonts({
    "Pretendard-Variable": require("../assets/fonts/PretendardVariable.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          new Promise((resolve) => {
            if (loaded || error) resolve(true);
          }),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        if (error) {
          console.error("[fonts] Failed to load:", error);
        }
        setAppIsReady(true);
      }
    }

    prepare();
  }, [loaded, error]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  return (
    <AppProviders>
      <RootLayoutNav />
      {!appIsReady ? <BootSplashOverlay /> : null}
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootSplash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 9999,
    elevation: 9999,
  },
});
