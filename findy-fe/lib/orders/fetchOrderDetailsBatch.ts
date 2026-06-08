import { fetchOrderDetail } from "@/lib/orders/api/orders";
import type { OrderDetailApiDto } from "@/lib/orders/api/types";

export async function fetchOrderDetailsBatch(
  orderIds: number[],
): Promise<Map<number, OrderDetailApiDto>> {
  const uniqueIds = [...new Set(orderIds)];
  const results = await Promise.allSettled(
    uniqueIds.map(async (orderId) => {
      const detail = await fetchOrderDetail(orderId);
      return { orderId, detail };
    }),
  );

  const map = new Map<number, OrderDetailApiDto>();

  for (const result of results) {
    if (result.status === "fulfilled") {
      map.set(result.value.orderId, result.value.detail);
    }
  }

  return map;
}
