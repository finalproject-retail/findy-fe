import { Header } from "@/components/common";
import { MapNotificationListItem } from "@/components/map/notifications";
import { SafeView } from "@/components/layout";
import { COLORS, SPACING } from "@/constants/theme";
import { useMapShoppingNotifications } from "@/contexts/MapShoppingNotificationContext";
import { pretendard } from "@/utils/pretendard";
import { type Href, useRouter } from "expo-router";
import { Platform, ScrollView, Text, View } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications } = useMapShoppingNotifications();

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
        {notifications.length === 0 ? (
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
                router.push(`/product/${item.relatedProduct.id}` as Href)
              }
            />
          ))
        )}
      </ScrollView>
    </SafeView>
  );
}
