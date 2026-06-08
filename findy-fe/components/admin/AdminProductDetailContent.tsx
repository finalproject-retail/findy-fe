import BackIcon from "@/assets/icons/back-icon.svg";
import { AdminContentFrame } from "@/components/admin/AdminContentFrame";
import { AdminMonthlyViewsChart } from "@/components/admin/AdminMonthlyViewsChart";
import { AdminRecommendationFunnel } from "@/components/admin/AdminRecommendationFunnel";
import { AdminScrollView } from "@/components/admin/AdminScrollView";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import {
  formatAdminViewCount,
  getAdminProductFinalConversionRate,
  type AdminProductPerformance,
} from "@/lib/admin/adminProductPerformanceTypes";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AdminProductDetailContentProps = {
  data: AdminProductPerformance;
};

const PRODUCT_THUMB_SIZE = 72;

function DetailSection({ children }: { children: ReactNode }) {
  return <View style={{ gap: 12 }}>{children}</View>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: "#EEF3FF",
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      <Text style={{ ...pretendard(500), fontSize: 13, color: ADMIN_COLORS.navyMuted }}>
        {label}
      </Text>
      <Text style={{ ...pretendard(700), fontSize: 24, color: ADMIN_COLORS.navActive }}>
        {value}
      </Text>
    </View>
  );
}

function ProductThumbnail({ image }: { image: AdminProductPerformance["image"] }) {
  return (
    <View
      style={{
        width: PRODUCT_THUMB_SIZE,
        height: PRODUCT_THUMB_SIZE,
        borderRadius: 10,
        backgroundColor: ADMIN_COLORS.statCardBg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image source={image} style={{ width: PRODUCT_THUMB_SIZE, height: PRODUCT_THUMB_SIZE }} contentFit="contain" />
    </View>
  );
}

export function AdminProductDetailContent({ data }: AdminProductDetailContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();

  return (
    <AdminScrollView
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + (isWide ? 24 : 72),
        flexGrow: 1,
      }}
    >
      <AdminContentFrame>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: isWide ? 24 : Math.max(insets.top, 12) + 8,
            paddingBottom: 24,
            gap: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 40,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
              hitSlop={10}
              style={{
                position: "absolute",
                left: 0,
                padding: 4,
              }}
            >
              <BackIcon width={20} height={20} />
            </Pressable>
            <Text style={{ ...pretendard(700), fontSize: 20, color: ADMIN_COLORS.navy }}>
              상품 상세
            </Text>
          </View>

          <View
            style={{
              backgroundColor: ADMIN_COLORS.cardBg,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: ADMIN_COLORS.border,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <ProductThumbnail image={data.image} />
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <Text
                numberOfLines={2}
                style={{ ...pretendard(600), fontSize: 16, lineHeight: 22, color: ADMIN_COLORS.navy }}
              >
                {data.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{ ...pretendard(400), fontSize: 12, color: ADMIN_COLORS.navyMuted }}
              >
                (상품 ID: {data.productId})
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: isWide ? "row" : "column", gap: 12 }}>
            <StatCard label="기간 조회수" value={formatAdminViewCount(data.views)} />
            <StatCard
              label="추천 노출수"
              value={formatAdminViewCount(data.impressionCount || data.todayViews)}
            />
          </View>

          {isWide ? (
            <View style={{ flexDirection: "row", gap: 20, alignItems: "stretch" }}>
              <View style={{ flex: 1.2, minWidth: 0 }}>
                <AdminMonthlyViewsChart points={data.monthlyViews} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AdminRecommendationFunnel
                  steps={data.funnelSteps}
                  finalConversionRate={getAdminProductFinalConversionRate(data)}
                />
              </View>
            </View>
          ) : (
            <>
              <DetailSection>
                <AdminMonthlyViewsChart points={data.monthlyViews} />
              </DetailSection>
              <DetailSection>
                <AdminRecommendationFunnel
                  steps={data.funnelSteps}
                  finalConversionRate={getAdminProductFinalConversionRate(data)}
                />
              </DetailSection>
            </>
          )}
        </View>
      </AdminContentFrame>
    </AdminScrollView>
  );
}
