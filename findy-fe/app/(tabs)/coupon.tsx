import { Header } from "@/components/common";
import {
  CouponTopTabs,
  GetCouponsTab,
  MOCK_COUPONS,
  MyCouponsTab,
  filterCoupons,
  type CouponFilter,
  type CouponTab,
} from "@/components/coupon";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import { LAYOUT } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CouponScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<CouponTab>("my");
  const [filter, setFilter] = useState<CouponFilter>("all");
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const contentPaddingBottom = LAYOUT.tabBarTotalHeight + insets.bottom + 20;

  const myCoupons = useMemo(() => {
    const downloaded = MOCK_COUPONS.filter((coupon) =>
      downloadedIds.has(coupon.id),
    );
    return filterCoupons(downloaded, filter);
  }, [downloadedIds, filter]);

  const availableCoupons = useMemo(
    () => filterCoupons(MOCK_COUPONS, filter),
    [filter],
  );

  const handleDownload = (couponId: string) => {
    if (downloadedIds.has(couponId)) return;
    setDownloadedIds((prev) => new Set(prev).add(couponId));
    showToast(TOAST_MESSAGES.couponDownloaded);
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
          />
        ) : (
          <GetCouponsTab
            coupons={availableCoupons}
            filter={filter}
            onFilterChange={setFilter}
            downloadedIds={downloadedIds}
            onDownload={handleDownload}
            contentPaddingBottom={contentPaddingBottom}
          />
        )}
      </View>
    </SafeView>
  );
}
