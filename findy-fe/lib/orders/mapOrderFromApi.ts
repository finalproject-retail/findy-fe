import type {
  OrderDetailApiDto,
  OrderItemApiDto,
  OrderSummaryApiDto,
} from "@/lib/orders/api/types";

type OrderItemRawApiDto = {
  orderItemId: number;
  productId: number;
  productName?: string | null;
  quantity?: number | null;
  productPrice?: number | null;
  itemDiscountAmount?: number | null;
  discountAmount?: number | null;
  itemFinalAmount?: number | null;
  finalAmount?: number | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
};

type OrderDetailRawApiDto = {
  orderId: number;
  shoppingListId?: number | null;
  orderStatus?: string | null;
  totalAmount?: number | null;
  discountAmount?: number | null;
  finalAmount?: number | null;
  earnedReward?: number | null;
  orderedAt?: string | null;
  couponId?: number | null;
  couponName?: string | null;
  items?: OrderItemRawApiDto[] | null;
};

type OrderSummaryRawApiDto = {
  orderId: number;
  orderStatus?: string | null;
  totalAmount?: number | null;
  discountAmount?: number | null;
  finalAmount?: number | null;
  earnedReward?: number | null;
  orderedAt?: string | null;
  itemCount?: number | null;
  firstProductName?: string | null;
};

function readNumber(value: number | null | undefined, fallback = 0) {
  if (value == null || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

export function mapOrderItemFromApi(raw: OrderItemRawApiDto): OrderItemApiDto {
  return {
    orderItemId: raw.orderItemId,
    productId: raw.productId,
    productName: raw.productName?.trim() ?? "",
    quantity: readNumber(raw.quantity, 1),
    productPrice: readNumber(raw.productPrice),
    itemDiscountAmount: readNumber(
      raw.itemDiscountAmount ?? raw.discountAmount,
    ),
    itemFinalAmount: readNumber(raw.itemFinalAmount ?? raw.finalAmount),
    imageUrl: raw.imageUrl ?? raw.thumbnailUrl ?? null,
  };
}

export function mapOrderDetailFromApi(raw: OrderDetailRawApiDto): OrderDetailApiDto {
  const items = Array.isArray(raw.items)
    ? raw.items.map(mapOrderItemFromApi)
    : [];

  return {
    orderId: raw.orderId,
    shoppingListId: raw.shoppingListId ?? null,
    orderStatus: raw.orderStatus ?? "",
    totalAmount: readNumber(raw.totalAmount),
    discountAmount: readNumber(raw.discountAmount),
    finalAmount: readNumber(raw.finalAmount),
    earnedReward: readNumber(raw.earnedReward),
    orderedAt: raw.orderedAt ?? "",
    couponId: raw.couponId ?? null,
    couponName: raw.couponName ?? null,
    items,
  };
}

export function mapOrderSummaryFromApi(raw: OrderSummaryRawApiDto): OrderSummaryApiDto {
  return {
    orderId: raw.orderId,
    orderStatus: raw.orderStatus ?? "",
    totalAmount: readNumber(raw.totalAmount),
    discountAmount: readNumber(raw.discountAmount),
    finalAmount: readNumber(raw.finalAmount),
    earnedReward: readNumber(raw.earnedReward),
    orderedAt: raw.orderedAt ?? "",
    itemCount: readNumber(raw.itemCount),
    firstProductName: raw.firstProductName?.trim() ?? "",
  };
}

export function enrichOrderSummaryFromDetail(
  summary: OrderSummaryApiDto,
  detail: OrderDetailApiDto,
): OrderSummaryApiDto {
  const firstItem = detail.items[0];

  return {
    ...summary,
    totalAmount: summary.totalAmount || detail.totalAmount,
    discountAmount: summary.discountAmount || detail.discountAmount,
    finalAmount: summary.finalAmount || detail.finalAmount,
    earnedReward: summary.earnedReward || detail.earnedReward,
    orderedAt: summary.orderedAt || detail.orderedAt,
    itemCount: detail.items.length,
    firstProductName: firstItem?.productName || summary.firstProductName,
  };
}
