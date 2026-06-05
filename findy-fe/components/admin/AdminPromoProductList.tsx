import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import type { AdminPromoProduct, AdminPromoType } from "@/lib/admin/mockDashboardData";
import { ADMIN_PROMO_LABELS } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type AdminPromoProductListProps = {
  products: AdminPromoProduct[];
};

function promoBadgeStyle(type: AdminPromoType) {
  switch (type) {
    case "bundle":
      return {
        bg: ADMIN_COLORS.promoBundle,
        text: ADMIN_COLORS.promoBundleText,
      };
    case "onePlusOne":
      return {
        bg: ADMIN_COLORS.promoOnePlus,
        text: ADMIN_COLORS.promoOnePlusText,
      };
    case "discount":
      return {
        bg: ADMIN_COLORS.promoDiscount,
        text: ADMIN_COLORS.promoDiscountText,
      };
  }
}

export function AdminPromoProductList({ products }: AdminPromoProductListProps) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}>
        행사 상품 성과 목록
      </Text>

      <View
        style={{
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          overflow: "hidden",
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 640 }}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: ADMIN_COLORS.statCardBg,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderBottomColor: ADMIN_COLORS.border,
              }}
            >
              {["순위", "상품명", "행사 종류", "선택률", "구매율"].map((header) => (
                <Text
                  key={header}
                  style={{
                    ...pretendard(600),
                    fontSize: 12,
                    color: ADMIN_COLORS.navyMuted,
                    width: header === "상품명" ? 220 : 90,
                    textAlign: header === "상품명" ? "left" : "center",
                  }}
                >
                  {header}
                </Text>
              ))}
            </View>

            {products.map((product) => {
              const badge = promoBadgeStyle(product.promoType);
              return (
                <View
                  key={product.rank}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: ADMIN_COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      width: 90,
                      textAlign: "center",
                      ...pretendard(600),
                      fontSize: 14,
                      color: ADMIN_COLORS.navy,
                    }}
                  >
                    {product.rank}
                  </Text>

                  <View
                    style={{
                      width: 220,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Image
                      source={require("@/assets/images/splash-logo.png")}
                      style={{ width: 36, height: 36, borderRadius: 6 }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          ...pretendard(600),
                          fontSize: 12,
                          color: ADMIN_COLORS.navy,
                        }}
                      >
                        {product.name}
                      </Text>
                      <Text
                        style={{
                          ...pretendard(400),
                          fontSize: 10,
                          color: ADMIN_COLORS.navyMuted,
                        }}
                      >
                        (상품 ID: {product.productId})
                      </Text>
                    </View>
                  </View>

                  <View style={{ width: 90, alignItems: "center" }}>
                    <View
                      style={{
                        backgroundColor: badge.bg,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          ...pretendard(600),
                          fontSize: 10,
                          color: badge.text,
                        }}
                      >
                        {ADMIN_PROMO_LABELS[product.promoType]}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      width: 90,
                      textAlign: "center",
                      ...pretendard(700),
                      fontSize: 14,
                      color: ADMIN_COLORS.navy,
                    }}
                  >
                    {product.selectionRate}%
                  </Text>

                  <Text
                    style={{
                      width: 90,
                      textAlign: "center",
                      ...pretendard(700),
                      fontSize: 14,
                      color: ADMIN_COLORS.negativeText,
                    }}
                  >
                    {product.purchaseRate}%
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 16,
          }}
        >
          <Text style={{ ...pretendard(500), fontSize: 14, color: ADMIN_COLORS.navyMuted }}>
            더보기
          </Text>
          <DownArrowIcon width={14} height={14} />
        </Pressable>
      </View>
    </View>
  );
}
