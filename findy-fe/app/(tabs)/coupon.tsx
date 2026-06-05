import { Header } from "@/components/common";
import {
  CouponTopTabs,
  GetCouponsTab,
  MyCouponsTab,
  filterCoupons,
  type CouponFilter,
  type CouponTab,
} from "@/components/coupon";
import { excludeAlreadyDownloadedCoupons } from "@/lib/coupon/filterCoupons";
import { useMypageProfile } from "@/components/mypage";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import { LAYOUT } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useAvailableCoupons } from "@/hooks/useAvailableCoupons";
import { useMyCoupons } from "@/hooks/useMyCoupons";
import { downloadCoupon } from "@/lib/coupon/api/coupons";
import { canDownloadMembershipCoupon } from "@/lib/coupon/membershipGrade";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CouponScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { profile, reload: reloadProfile } = useMypageProfile();
  const [activeTab, setActiveTab] = useState<CouponTab>("my");
  const [filter, setFilter] = useState<CouponFilter>("all");
  const [downloadingCouponId, setDownloadingCouponId] = useState<string | null>(
    null,
  );
  const {
    coupons: myCouponsFromApi,
    loading: myCouponsLoading,
    error: myCouponsError,
    reload: reloadMyCoupons,
  } = useMyCoupons();
  const {
    coupons: availableCouponsFromApi,
    loading: availableCouponsLoading,
    error: availableCouponsError,
    reload: reloadAvailableCoupons,
  } = useAvailableCoupons();

  const contentPaddingBottom = LAYOUT.tabBarTotalHeight + insets.bottom + 20;
  const userGrade = profile?.grade ?? null;

  useFocusEffect(
    useCallback(() => {
      void reloadProfile();
      void reloadMyCoupons();

      if (activeTab === "get") {
        void reloadAvailableCoupons();
      }
    }, [activeTab, reloadAvailableCoupons, reloadMyCoupons, reloadProfile]),
  );

  const myCoupons = useMemo(
    () => filterCoupons(myCouponsFromApi, filter, userGrade),
    [myCouponsFromApi, filter, userGrade],
  );

  const availableCoupons = useMemo(
    () =>
      filterCoupons(
        excludeAlreadyDownloadedCoupons(
          availableCouponsFromApi,
          myCouponsFromApi,
        ),
        filter,
        userGrade,
      ),
    [availableCouponsFromApi, myCouponsFromApi, filter, userGrade],
  );

  const handleDownload = async (couponId: string) => {
    const coupon = availableCouponsFromApi.find((item) => item.id === couponId);
    if (!coupon?.couponId || coupon.isDownloaded) {
      return;
    }

    if (!canDownloadMembershipCoupon(coupon, userGrade)) {
      Alert.alert("다운로드 불가", "내 등급에서 받을 수 없는 멤버십 쿠폰입니다.");
      return;
    }

    setDownloadingCouponId(couponId);

    try {
      await downloadCoupon(coupon.couponId);
      showToast(TOAST_MESSAGES.couponDownloaded);
      await Promise.all([reloadAvailableCoupons(), reloadMyCoupons()]);
    } catch (error) {
      Alert.alert(
        "쿠폰 다운로드 실패",
        error instanceof Error ? error.message : "쿠폰 다운로드에 실패했습니다.",
      );
    } finally {
      setDownloadingCouponId(null);
    }
  };

  return (
    <SafeView edges={TAB_SCREEN_EDGES}>
      <Header title="쿠폰" rightIcons={["cart"]} />
      <CouponTopTabs value={activeTab} onChange={setActiveTab} />

      <View className="flex-1">
        {activeTab === "my" ? (
          <MyCouponsTab
            coupons={myCoupons}
            filter={filter}
            onFilterChange={setFilter}
            onBrowseCoupons={() => setActiveTab("get")}
            contentPaddingBottom={contentPaddingBottom}
            loading={myCouponsLoading}
            error={myCouponsError}
            onRetry={() => void reloadMyCoupons()}
          />
        ) : (
          <GetCouponsTab
            coupons={availableCoupons}
            filter={filter}
            onFilterChange={setFilter}
            onDownload={(couponId) => void handleDownload(couponId)}
            contentPaddingBottom={contentPaddingBottom}
            loading={availableCouponsLoading}
            error={availableCouponsError}
            onRetry={() => void reloadAvailableCoupons()}
            downloadingCouponId={downloadingCouponId}
          />
        )}
      </View>
    </SafeView>
  );
}
