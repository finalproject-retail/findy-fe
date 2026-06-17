import { ADMIN_COLORS } from "@/constants/adminTheme";
import { ADMIN_ZONE_CARD_BODY_HEIGHT } from "@/lib/admin/adminDashboardLayout";
import type {
  AdminPromoProduct,
  AdminPromoType,
} from "@/lib/admin/mockDashboardData";
import { ADMIN_PROMO_LABELS } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

type AdminPromoProductListProps = {
  products: AdminPromoProduct[];
  stretch?: boolean;
};

type DisplayPromoProduct = AdminPromoProduct & {
  promoLabel?: string | null;
  promotionLabel?: string | null;
  promotionName?: string | null;
  promotionType?: string | null;
  selectionRate?: number | string;
  purchaseRate?: number | string;
};

const HEADERS = ["순위", "상품명", "행사 종류", "선택률", "구매율"] as const;
const ROW_MIN_HEIGHT = 64;
const MOBILE_LIST_MAX_HEIGHT = 320;
const THUMB_SIZE = 36;

const PROMO_TYPE_FALLBACKS: AdminPromoType[] = [
  "discount",
  "onePlusOne",
  "bundle",
];

function normalizeRate(value: number | string | undefined | null) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  const normalized = numberValue > 0 && numberValue <= 1 ? numberValue * 100 : numberValue;
  return Math.max(0, Math.min(100, Math.round(normalized * 10) / 10));
}

function formatRate(value: number | string | undefined | null) {
  const rate = normalizeRate(value);
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;
}

function normalizePromoType(
  product: DisplayPromoProduct,
  index: number,
): AdminPromoType {
  const raw = product.promotionType?.trim().toUpperCase();

  switch (raw) {
    case "ONE_PLUS_ONE":
    case "ONE_PLUS":
    case "ONE_PLUS_ONE_EVENT":
    case "1_PLUS_1":
    case "1+1":
      return "onePlusOne";

    case "BUNDLE":
    case "TWO_PLUS_ONE":
    case "TWO_PLUS":
    case "2_PLUS_1":
    case "2+1":
    case "GIFT":
      return "bundle";

    case "DISCOUNT":
    case "COUPON":
    case "CLEARANCE":
      return "discount";

    default:
      break;
  }

  if (product.promoType) {
    return product.promoType;
  }

  const seed = Math.abs(Number(product.productId ?? index + 1) + index);
  return PROMO_TYPE_FALLBACKS[seed % PROMO_TYPE_FALLBACKS.length];
}

function getPromoLabel(product: DisplayPromoProduct, promoType: AdminPromoType) {
  const explicitLabel =
    product.promoLabel ??
    product.promotionLabel ??
    product.promotionName ??
    null;

  if (explicitLabel && explicitLabel.trim().length > 0) {
    return explicitLabel.trim();
  }

  return ADMIN_PROMO_LABELS[promoType];
}

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
      <Image
        source={image}
        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
        contentFit="contain"
      />
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
    default:
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
  index,
  stretch,
}: {
  product: DisplayPromoProduct;
  index: number;
  stretch: boolean;
}) {
  const promoType = normalizePromoType(product, index);
  const badge = promoBadgeStyle(promoType);
  const promoLabel = getPromoLabel(product, promoType);

  const selectionRate = normalizeRate(product.selectionRate);
  const purchaseRate = Math.min(
    normalizeRate(product.purchaseRate),
    selectionRate,
  );

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
            {product.name?.trim() || "상품명 확인 필요"}
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
            numberOfLines={1}
            style={{
              ...pretendard(600),
              fontSize: 10,
              color: badge.text,
            }}
          >
            {promoLabel}
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
        {formatRate(selectionRate)}
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
        {formatRate(purchaseRate)}
      </Text>
    </View>
  );
}

function EmptyPromoProducts() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          ...pretendard(500),
          fontSize: 13,
          color: ADMIN_COLORS.navyMuted,
          textAlign: "center",
        }}
      >
        선택한 기간의 행사 상품 성과 데이터가 없습니다.
      </Text>
    </View>
  );
}

export function AdminPromoProductList({
  products,
  stretch = false,
}: AdminPromoProductListProps) {
  const cardBodyHeight = stretch
    ? ADMIN_ZONE_CARD_BODY_HEIGHT
    : MOBILE_LIST_MAX_HEIGHT;

  const displayProducts = products
    .filter((product) => {
      const name = product.name?.trim();
      return Boolean(name) && name !== "상품명 미등록";
    })
    .map((product) => product as DisplayPromoProduct);

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
            {displayProducts.length > 0 ? (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator
                nestedScrollEnabled
              >
                {displayProducts.map((product, index) => (
                  <PromoTableRow
                    key={`${product.productId}-${product.rank}`}
                    product={product}
                    index={index}
                    stretch
                  />
                ))}
              </ScrollView>
            ) : (
              <EmptyPromoProducts />
            )}
          </>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
            <View style={{ minWidth: 640, height: cardBodyHeight }}>
              <PromoTableHeader stretch={false} />
              {displayProducts.length > 0 ? (
                <ScrollView
                  style={{ height: cardBodyHeight - 45 }}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                >
                  {displayProducts.map((product, index) => (
                    <PromoTableRow
                      key={`${product.productId}-${product.rank}`}
                      product={product}
                      index={index}
                      stretch={false}
                    />
                  ))}
                </ScrollView>
              ) : (
                <EmptyPromoProducts />
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}