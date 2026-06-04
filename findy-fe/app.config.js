/** @type {import('expo/config').ExpoConfig} */
export default ({ config }) => ({
  ...config,
  name: "findy-fe",
  slug: "findy-fe",
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-logo.png",
        resizeMode: "contain",
        backgroundColor: "#FFFFFF",
        imageWidth: 87,
      },
    ],
    [
      "react-native-ble-plx",
      {
        isBackgroundEnabled: false,
        neverForLocation: false,
        modes: ["peripheral", "central"],
        bluetoothAlwaysPermission:
          "Allow Findy to use Bluetooth for in-store navigation beacons.",
      },
    ],
    "./plugins/withBleScanNoNeverForLocation.js",
  ],
  android: {
    ...config.android,
    usesCleartextTraffic: true,
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
      foregroundImage: "./assets/images/splash-logo.png",
    },
    permissions: [
      ...(config.android?.permissions ?? []),
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
    ],
  },
  extra: {
    ...config.extra,
    ...((process.env.EXPO_PROJECT_ID || config.extra?.eas?.projectId) && {
      eas: {
        ...config.extra?.eas,
        projectId: process.env.EXPO_PROJECT_ID ?? config.extra?.eas?.projectId,
      },
    }),
    mapApiUrl:
      process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8888",
  },
});
