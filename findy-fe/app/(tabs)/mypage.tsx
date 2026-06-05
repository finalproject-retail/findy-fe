import { Header } from "@/components/common";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import { type Href, useRouter } from "expo-router";
import {
  MypageGreeting,
  MypageMembershipCard,
  MypageMenuList,
  MypageRecentlyViewedSection,
  useMypageProfile,
} from "@/components/mypage";
import { useRecentViews } from "@/components/recently-viewed";
import { LAYOUT, SPACING, COLORS } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { downloadMembershipCouponsForGrade } from "@/lib/coupon/downloadMembershipCoupons";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTENT_GAP = 28;

export default function MypageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [downloadingMembershipCoupons, setDownloadingMembershipCoupons] =
    useState(false);
  const { profile, loading, error, reload } = useMypageProfile();
  const {
    products: recentViews,
    reload: reloadRecentViews,
  } = useRecentViews();
  const scrollBottomPadding = LAYOUT.tabBarTotalHeight + insets.bottom;

  useFocusEffect(
    useCallback(() => {
      void reload();
      void reloadRecentViews();
    }, [reload, reloadRecentViews]),
  );

  const handleDownloadMembershipCoupons = async () => {
    if (!profile || downloadingMembershipCoupons) {
      return;
    }

    setDownloadingMembershipCoupons(true);

    try {
      const result = await downloadMembershipCouponsForGrade(profile.grade);

      if (result.downloadedCount === 0) {
        showToast("받을 수 있는 멤버십 쿠폰이 없습니다.");
        return;
      }

      showToast(TOAST_MESSAGES.couponDownloaded);
    } catch (err) {
      Alert.alert(
        "쿠폰 다운로드 실패",
        err instanceof Error ? err.message : "쿠폰 다운로드에 실패했습니다.",
      );
    } finally {
      setDownloadingMembershipCoupons(false);
    }
  };

  const showFullScreenLoading = loading && !profile;
  const showFullScreenError = Boolean(error) && !profile;

  return (
    <SafeView edges={TAB_SCREEN_EDGES}>
      <Header
        title="마이핀디"
        rightIcons={["search", "bell", "cart"]}
        onSearchPress={() => router.push("/search" as Href)}
      />

      {showFullScreenLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : showFullScreenError ? (
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ gap: SPACING.md }}
        >
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => void reload()}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text className="text-md text-text-blue" style={pretendard(600)}>
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : profile ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: scrollBottomPadding,
            paddingTop: SPACING.xl,
            gap: CONTENT_GAP,
          }}
        >
          <View className="px-screen" style={{ gap: CONTENT_GAP }}>
            <MypageGreeting name={profile.name} email={profile.email} />
            <MypageMembershipCard
              user={{
                grade: profile.grade,
                points: profile.reward,
              }}
              onGetCouponPress={() => void handleDownloadMembershipCoupons()}
              downloadingMembershipCoupons={downloadingMembershipCoupons}
              onPointsPress={() => router.push("/points")}
            />
            <MypageRecentlyViewedSection
              products={recentViews}
              onSeeAllPress={() => router.push("/recently-viewed")}
            />
            <MypageMenuList
              onPurchaseHistoryPress={() =>
                router.push("/purchase-history" as Href)
              }
              onFaqPress={() => router.push("/faq")}
              onSettingsPress={() => router.push("/settings")}
            />
          </View>
        </ScrollView>
      ) : null}
    </SafeView>
  );
}
