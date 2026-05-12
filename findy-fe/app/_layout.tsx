import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [loaded, error] = useFonts({
    "Pretendard-Variable": require("../assets/fonts/PretendardVariable.ttf"),
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
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../assets/images/splash-logo.png")}
          style={{ width: 180, height: 180, resizeMode: "contain" }}
        />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
