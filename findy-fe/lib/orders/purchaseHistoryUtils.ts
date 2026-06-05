import { formatOrderDisplayDate } from "@/lib/orders/formatOrderDate";
import type { OrderSummaryApiDto } from "@/lib/orders/api/types";

export type PurchaseHistoryDateGroup = {
  date: string;
  orders: OrderSummaryApiDto[];
};

function parseDisplayDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(year, month - 1, day);
}

export function filterPurchaseHistoryOrders(
  orders: OrderSummaryApiDto[],
  query: string,
): OrderSummaryApiDto[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return orders;
  }

  return orders.filter((order) =>
    order.firstProductName.toLowerCase().includes(normalizedQuery),
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
  const original = productPrice * quantity;
  if (original <= 0 || itemDiscountAmount <= 0) {
    return null;
  }
  return Math.round((itemDiscountAmount / original) * 100);
}

export function getOrderItemUnitPrice(itemFinalAmount: number, quantity: number) {
  if (quantity <= 0) {
    return itemFinalAmount;
  }
  return Math.round(itemFinalAmount / quantity);
}
