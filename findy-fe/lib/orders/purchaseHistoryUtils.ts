import { formatOrderDisplayDate } from "@/lib/orders/formatOrderDate";
import type {
  OrderDetailApiDto,
  OrderSummaryApiDto,
} from "@/lib/orders/api/types";

export const PURCHASE_HISTORY_PREVIEW_ITEM_LIMIT = 3;

export type PurchaseHistoryDateGroup = {
  date: string;
  orders: OrderSummaryApiDto[];
};

function parseDisplayDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function orderMatchesQuery(
  order: OrderSummaryApiDto,
  query: string,
  orderDetails: Map<number, OrderDetailApiDto>,
) {
  const detail = orderDetails.get(order.orderId);
  if (detail) {
    return detail.items.some((item) =>
      item.productName.toLowerCase().includes(query),
    );
  }

  return order.firstProductName.toLowerCase().includes(query);
}

export function filterPurchaseHistoryOrders(
  orders: OrderSummaryApiDto[],
  query: string,
  orderDetails: Map<number, OrderDetailApiDto> = new Map(),
): OrderSummaryApiDto[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return orders;
  }

  return orders.filter((order) =>
    orderMatchesQuery(order, normalizedQuery, orderDetails),
  );
}

export function groupPurchaseHistoryOrdersByDate(
  orders: OrderSummaryApiDto[],
): PurchaseHistoryDateGroup[] {
  const map = new Map<string, OrderSummaryApiDto[]>();

  for (const order of orders) {
    const date = formatOrderDisplayDate(order.orderedAt);
    const group = map.get(date) ?? [];
    group.push(order);
    map.set(date, group);
  }

  return [...map.entries()]
    .sort(
      ([dateA], [dateB]) =>
        parseDisplayDate(dateB).getTime() - parseDisplayDate(dateA).getTime(),
    )
    .map(([date, groupedOrders]) => ({
      date,
      orders: groupedOrders.sort(
        (a, b) =>
          new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
      ),
    }));
}

export function getOrderItemDiscountPercent(
  productPrice: number,
  quantity: number,
  itemDiscountAmount: number,
) {
  if (!Number.isFinite(productPrice) || !Number.isFinite(itemDiscountAmount)) {
    return null;
  }

  const original = productPrice * quantity;
  if (original <= 0 || itemDiscountAmount <= 0) {
    return null;
  }

  const percent = Math.round((itemDiscountAmount / original) * 100);
  return Number.isFinite(percent) && percent > 0 ? percent : null;
}

export function getOrderItemUnitPrice(itemFinalAmount: number, quantity: number) {
  if (!Number.isFinite(itemFinalAmount) || itemFinalAmount <= 0) {
    return 0;
  }

  if (quantity <= 0) {
    return itemFinalAmount;
  }

  return Math.round(itemFinalAmount / quantity);
}
