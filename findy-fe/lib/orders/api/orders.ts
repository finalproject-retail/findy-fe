import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import type {
  OrderDetailApiDto,
  OrderListApiData,
  OrderSummaryApiDto,
} from "@/lib/orders/api/types";

const ORDERS_BASE = "/api/v1/orders";

type OrdersApiEnvelope<T> = {
  success?: boolean;
  status?: string;
  message?: string;
  data?: T;
};

function assertOrdersSuccess(
  body: OrdersApiEnvelope<unknown> | undefined,
  fallbackMessage: string,
) {
  const ok = body?.success === true || body?.status === "SUCCESS";
  if (!ok) {
    throw new Error(body?.message ?? fallbackMessage);
  }
}

function extractOrderList(data: OrderListApiData | OrderSummaryApiDto[] | undefined) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.orders ?? [];
}

export type FetchOrdersParams = {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
};

export async function fetchOrders(
  params: FetchOrdersParams = {},
): Promise<OrderSummaryApiDto[]> {
  try {
    const response = await authenticatedUserApiClient.get<
      OrdersApiEnvelope<OrderListApiData | OrderSummaryApiDto[]>
    >(ORDERS_BASE, { params });

    assertOrdersSuccess(response.data, "구매 내역을 불러오지 못했습니다.");

    return extractOrderList(response.data.data);
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "구매 내역을 불러오지 못했습니다."),
    );
  }
}

export async function fetchOrderDetail(orderId: number): Promise<OrderDetailApiDto> {
  try {
    const response = await authenticatedUserApiClient.get<
      OrdersApiEnvelope<OrderDetailApiDto>
    >(`${ORDERS_BASE}/${orderId}`);

    assertOrdersSuccess(response.data, "구매 내역 상세를 불러오지 못했습니다.");

    if (!response.data.data) {
      throw new Error("구매 내역 상세를 불러오지 못했습니다.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "구매 내역 상세를 불러오지 못했습니다."),
    );
  }
}
