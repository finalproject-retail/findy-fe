import { Header } from "@/components/common";
import { MapNotificationListItem } from "@/components/map/notifications";
import { SafeView } from "@/components/layout";
import { COLORS, SPACING } from "@/constants/theme";
import { useMapShoppingNotifications } from "@/contexts/MapShoppingNotificationContext";
import { pretendard } from "@/utils/pretendard";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    listLoading,
    listError,
    reloadNotifications,
    handleNotificationPress,
  } = useMapShoppingNotifications();

  useFocusEffect(
    useCallback(() => {
      void reloadNotifications();
    }, [reloadNotifications]),
  );

  const handleItemPress = useCallback(
    async (notificationId: number, fallbackProductId: string) => {
      const item = notifications.find(
        (entry) => entry.notificationId === notificationId,
      );
      if (!item) {
        return;
      }

      const productId =
        (await handleNotificationPress(item)) ?? fallbackProductId;
      if (productId) {
        router.push(`/product/${productId}` as Href);
      }
    },
    [handleNotificationPress, notifications, router],
  );

  return (
    <SafeView>
      <Header title="알림" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          paddingBottom: SPACING.xl,
        }}
      >
        {listLoading ? (
          <View style={{ paddingTop: SPACING.xl * 2, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.main} />
          </View>
        ) : listError ? (
          <View style={{ paddingTop: SPACING.xl * 2, alignItems: "center" }}>
            <Text
              style={{
                ...pretendard(400),
                fontSize: 15,
                color: COLORS.subText,
                textAlign: "center",
                ...(Platform.OS === "android" && { includeFontPadding: false }),
              }}
            >
              {listError}
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ paddingTop: SPACING.xl * 2, alignItems: "center" }}>
            <Text
              style={{
                ...pretendard(400),
                fontSize: 15,
                color: COLORS.subText,
                ...(Platform.OS === "android" && { includeFontPadding: false }),
              }}
            >
              받은 알림이 없어요.
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <MapNotificationListItem
              key={item.id}
              item={item}
              onPress={() =>
                void handleItemPress(
                  item.notificationId,
                  item.relatedProduct.id,
                )
              }
            />
          ))
        )}
      </ScrollView>
    </SafeView>
  );
}
