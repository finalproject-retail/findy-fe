import { Header } from "@/components/common";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import { useRouter } from "expo-router";
import {
  MOCK_MYPAGE_USER,
  MypageGreeting,
  MypageMembershipCard,
  MypageMenuList,
  MypageRecentlyViewedSection,
  getRecentlyViewedProducts,
} from "@/components/mypage";
import { LAYOUT, SPACING } from "@/constants/theme";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTENT_GAP = 28;

export default function MypageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = LAYOUT.tabBarTotalHeight + insets.bottom;
  const recentlyViewed = getRecentlyViewedProducts(
    MOCK_MYPAGE_USER.recentlyViewedProductIds,
  );

  return (
    <SafeView edges={TAB_SCREEN_EDGES}>
      <Header title="마이핀디" rightIcons={["search", "bell", "cart"]} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: scrollBottomPadding,
          paddingTop: SPACING.xl,
          gap: CONTENT_GAP,
        }}
      >
        <View className="px-screen" style={{ gap: CONTENT_GAP }}>
          <MypageGreeting
            name={MOCK_MYPAGE_USER.name}
            email={MOCK_MYPAGE_USER.email}
          />
          <MypageMembershipCard
            user={MOCK_MYPAGE_USER}
            onPointsPress={() => router.push("/points")}
          />
          <MypageRecentlyViewedSection
            products={recentlyViewed}
            onSeeAllPress={() => router.push("/recently-viewed")}
          />
          <MypageMenuList
            onPurchaseHistoryPress={() => router.push("/purchase-history")}
          />
        </View>
      </ScrollView>
    </SafeView>
  );
}
