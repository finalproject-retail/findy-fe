import { ADMIN_COLORS } from "@/constants/adminTheme";
import {
  ADMIN_ZONE_CARD_BODY_HEIGHT,
} from "@/lib/admin/adminDashboardLayout";
import type { AdminPromoProduct, AdminPromoType } from "@/lib/admin/mockDashboardData";
import { ADMIN_PROMO_LABELS } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

type AdminPromoProductListProps = {
  products: AdminPromoProduct[];
  stretch?: boolean;
};

const HEADERS = ["순위", "상품명", "행사 종류", "선택률", "구매율"] as const;
const ROW_MIN_HEIGHT = 64;
const MOBILE_LIST_MAX_HEIGHT = 320;
const THUMB_SIZE = 36;

function PromoProductThumbnail({ image }: { image: AdminPromoProduct["image"] }) {
  return (
    <View
      style={{
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 6,
        backgroundColor: ADMIN_COLORS.statCardBg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image source={image} style={{ width: THUMB_SIZE, height: THUMB_SIZE }} contentFit="contain" />
    </View>
  );
}

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

function columnStyle(header: (typeof HEADERS)[number], stretch: boolean) {
  if (stretch) {
    switch (header) {
      case "순위":
        return { flex: 0.7 };
      case "상품명":
        return { flex: 2.2 };
      case "행사 종류":
        return { flex: 1.1 };
      case "선택률":
      case "구매율":
        return { flex: 0.8 };
    }
  }

  return {
    width: header === "상품명" ? 220 : 90,
  };
}

function PromoTableHeader({ stretch }: { stretch: boolean }) {
  return (
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
      {HEADERS.map((header) => (
        <Text
          key={header}
          style={{
            ...columnStyle(header, stretch),
            ...pretendard(600),
            fontSize: 12,
            color: ADMIN_COLORS.navyMuted,
            textAlign: header === "상품명" ? "left" : "center",
          }}
        >
          {header}
        </Text>
      ))}
    </View>
  );
}

function PromoTableRow({
  product,
  stretch,
}: {
  product: AdminPromoProduct;
  stretch: boolean;
}) {
  const badge = promoBadgeStyle(product.promoType);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: ADMIN_COLORS.border,
        minHeight: ROW_MIN_HEIGHT,
      }}
    >
      <Text
        style={{
          ...columnStyle("순위", stretch),
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
          ...columnStyle("상품명", stretch),
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <PromoProductThumbnail image={product.image} />
        <View style={{ flex: 1, minWidth: 0 }}>
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
            numberOfLines={1}
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

      <View style={{ ...columnStyle("행사 종류", stretch), alignItems: "center" }}>
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
          ...columnStyle("선택률", stretch),
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
          ...columnStyle("구매율", stretch),
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
}

export function AdminPromoProductList({
  products,
  stretch = false,
}: AdminPromoProductListProps) {
  const cardBodyHeight = stretch ? ADMIN_ZONE_CARD_BODY_HEIGHT : MOBILE_LIST_MAX_HEIGHT;

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}>
        행사 상품 성과 목록
      </Text>

      <View
        style={{
          height: cardBodyHeight,
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          overflow: "hidden",
        }}
      >
        {stretch ? (
          <>
            <PromoTableHeader stretch />
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {products.map((product) => (
                <PromoTableRow key={product.rank} product={product} stretch />
              ))}
            </ScrollView>
          </>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
            <View style={{ minWidth: 640, height: cardBodyHeight }}>
              <PromoTableHeader stretch={false} />
              <ScrollView
                style={{ height: cardBodyHeight - 45 }}
                showsVerticalScrollIndicator
                nestedScrollEnabled
              >
                {products.map((product) => (
                  <PromoTableRow key={product.rank} product={product} stretch={false} />
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
