import { formatPrice } from "@/components/product/formatPrice";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import type { OrderItemApiDto } from "@/lib/orders/api/types";
import { PURCHASE_HISTORY_PREVIEW_ITEM_LIMIT } from "@/lib/orders/purchaseHistoryUtils";
import { pretendard } from "@/utils/pretendard";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { PurchaseHistoryOrderProductItem } from "./PurchaseHistoryOrderProductItem";

type PurchaseHistoryOrderPreviewProps = {
  orderId: number;
  items: OrderItemApiDto[];
  finalAmount: number;
};

export function PurchaseHistoryOrderPreview({
  orderId,
  items,
  finalAmount,
}: PurchaseHistoryOrderPreviewProps) {
  const router = useRouter();
  const previewItems = items.slice(0, PURCHASE_HISTORY_PREVIEW_ITEM_LIMIT);
  const hasMore = items.length > PURCHASE_HISTORY_PREVIEW_ITEM_LIMIT;

  const openOrderDetail = () => {
    router.push(`/purchase-history/${orderId}` as Href);
  };

  return (
    <View>
      {previewItems.map((item, index) => (
        <View
          key={item.orderItemId}
          style={{
            paddingTop: SPACING.md,
            paddingBottom: index === previewItems.length - 1 && !hasMore ? 0 : SPACING.md,
            borderBottomWidth:
              index < previewItems.length - 1 || hasMore ? BORDER.thin : 0,
            borderBottomColor: COLORS.lightGray,
          }}
        >
          <PurchaseHistoryOrderProductItem item={item} />
        </View>
      ))}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: SPACING.md,
          paddingBottom: hasMore ? SPACING.xs : SPACING.sm,
        }}
      >
        <Text className="text-md text-text-sub2" style={pretendard(500)}>
          총 구매금액
        </Text>
        <Text className="text-md text-text-main" style={pretendard(700)}>
          {formatPrice(finalAmount)}
        </Text>
      </View>

      {hasMore ? (
        <Pressable
          onPress={openOrderDetail}
          accessibilityRole="button"
          accessibilityLabel="구매 상세 보기"
          style={{
            paddingVertical: SPACING.sm,
            alignItems: "center",
            borderBottomWidth: BORDER.thin,
            borderBottomColor: COLORS.lightGray,
          }}
        >
          <Text className="text-sm text-text-sub2" style={pretendard(600)}>
            상세보기
          </Text>
        </Pressable>
      ) : (
        <View
          style={{
            paddingBottom: SPACING.sm,
            borderBottomWidth: BORDER.thin,
            borderBottomColor: COLORS.lightGray,
          }}
        />
      )}
    </View>
  );
}
