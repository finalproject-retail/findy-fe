import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { BeaconLocationProvider } from "@/contexts/BeaconLocationContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { MapNavigationProvider } from "@/contexts/MapNavigationContext";
import { MapShoppingNotificationProvider } from "@/contexts/MapShoppingNotificationContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { PurchaseHistoryProvider } from "@/contexts/PurchaseHistoryContext";
import { StoreMapConfigProvider } from "@/contexts/StoreMapConfigContext";
import { RecentSearchProvider } from "@/contexts/RecentSearchContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="points" />
      <Stack.Screen name="recently-viewed" />
      <Stack.Screen name="purchase-history" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="search" />
      <Stack.Screen name="category" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="route-generating" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="payment-coupons" />
      <Stack.Screen name="payment-qr" />
      <Stack.Screen name="payment-complete" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
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

  if (!appIsReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Image
          source={require("../assets/images/splash-logo.png")}
          style={{ width: 87 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <CartProvider>
      <RecentSearchProvider>
        <CheckoutProvider>
          <PurchaseHistoryProvider>
            <PointsProvider>
              <StoreMapConfigProvider>
                <MapNavigationProvider>
                  <MapShoppingNotificationProvider>
                    <BeaconLocationProvider>
                      <ToastProvider>
                        <AuthProvider>
                          <AuthGuard>
                            <RootLayoutNav />
                          </AuthGuard>
                        </AuthProvider>
                      </ToastProvider>
                    </BeaconLocationProvider>
                  </MapShoppingNotificationProvider>
                </MapNavigationProvider>
              </StoreMapConfigProvider>
            </PointsProvider>
          </PurchaseHistoryProvider>
        </CheckoutProvider>
      </RecentSearchProvider>
    </CartProvider>
  );
}
