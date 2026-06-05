import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { Coupon } from "@/components/coupon/types";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import type { ApiEnvelope } from "@/lib/auth/types";
import {
  extractCouponItem,
  extractCouponList,
} from "@/lib/coupon/api/extractCouponList";
import { mapAvailableCouponsFromApi } from "@/lib/coupon/mapAvailableCouponFromApi";
import { mapUserCouponsFromApi } from "@/lib/coupon/mapUserCouponFromApi";
import type {
  AvailableCouponApiDto,
  CouponListApiData,
  UserCouponApiDto,
} from "@/lib/coupon/api/types";

const COUPONS_BASE = "/api/v1/coupons";

function assertSuccess(body: ApiEnvelope<unknown> | undefined, fallbackMessage: string) {
  if (!body?.success) {
    throw new Error(body?.message ?? fallbackMessage);
  }
}

export async function fetchMyCoupons(): Promise<Coupon[]> {
  try {
    const response = await authenticatedUserApiClient.get<
      ApiEnvelope<CouponListApiData | UserCouponApiDto[]>
    >(`${COUPONS_BASE}/me`);

    assertSuccess(response.data, "보유 쿠폰을 불러오지 못했습니다.");

    return mapUserCouponsFromApi(
      extractCouponList<UserCouponApiDto>(response.data.data),
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "보유 쿠폰을 불러오지 못했습니다."),
    );
  }
}

export async function fetchAvailableCoupons(): Promise<Coupon[]> {
  try {
    const response = await authenticatedUserApiClient.get<
      ApiEnvelope<CouponListApiData | AvailableCouponApiDto[]>
    >(`${COUPONS_BASE}/available`);

    assertSuccess(response.data, "쿠폰 목록을 불러오지 못했습니다.");

    return mapAvailableCouponsFromApi(
      extractCouponList<AvailableCouponApiDto>(response.data.data),
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "쿠폰 목록을 불러오지 못했습니다."),
    );
  }
}

export async function fetchAvailableCouponsForOrder(): Promise<Coupon[]> {
  try {
    const response = await authenticatedUserApiClient.get<
      ApiEnvelope<CouponListApiData | UserCouponApiDto[]>
    >(`${COUPONS_BASE}/available-for-order`);

    assertSuccess(response.data, "사용 가능한 쿠폰을 불러오지 못했습니다.");

    return mapUserCouponsFromApi(
      extractCouponList<UserCouponApiDto>(response.data.data),
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "사용 가능한 쿠폰을 불러오지 못했습니다."),
    );
  }
}

export async function fetchCouponById(couponId: number): Promise<Coupon> {
  try {
    const response = await authenticatedUserApiClient.get<
      ApiEnvelope<AvailableCouponApiDto | { coupon?: AvailableCouponApiDto }>
    >(`${COUPONS_BASE}/${couponId}`);

    assertSuccess(response.data, "쿠폰 정보를 불러오지 못했습니다.");

    const item = extractCouponItem<AvailableCouponApiDto>(response.data.data);
    if (!item) {
      throw new Error("쿠폰 정보를 불러오지 못했습니다.");
    }

    return mapAvailableCouponsFromApi([item])[0]!;
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "쿠폰 정보를 불러오지 못했습니다."),
    );
  }
}

export async function downloadCoupon(couponId: number): Promise<void> {
  try {
    const response = await authenticatedUserApiClient.post<
      ApiEnvelope<unknown>
    >(`${COUPONS_BASE}/${couponId}/download`);

    if (!response.data?.success) {
      throw new Error(response.data?.message ?? "쿠폰 다운로드에 실패했습니다.");
    }
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "쿠폰 다운로드에 실패했습니다."),
    );
  }
}
