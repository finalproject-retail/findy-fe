import type { Product } from "@/components/product/types";
import { useMypageProfile } from "@/components/mypage";
import { useAuth } from "@/contexts/AuthContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useAvailableCoupons } from "@/hooks/useAvailableCoupons";
import { useMyCoupons } from "@/hooks/useMyCoupons";
import { downloadProductApplicableCoupons } from "@/lib/coupon/downloadProductApplicableCoupons";
import {
  getMaxProductCouponDiscountPercent,
  selectApplicableCouponsForProduct,
  selectDownloadableCouponsForProduct,
} from "@/lib/coupon/selectProductApplicableCoupons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export function useProductDetailCoupons(product: Product | null) {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { profile } = useMypageProfile();
  const { showToast } = useToast();
  const {
    coupons: availableCoupons,
    reload: reloadAvailableCoupons,
  } = useAvailableCoupons();
  const { coupons: ownedCoupons, reload: reloadMyCoupons } = useMyCoupons();
  const [downloading, setDownloading] = useState(false);

  const productPrice = product?.couponPrice ?? product?.price ?? 0;
  const userGrade = profile?.grade ?? null;

  useEffect(() => {
    if (authLoading || !isLoggedIn || !product?.id) {
      return;
    }

    void Promise.all([reloadAvailableCoupons(), reloadMyCoupons()]);
  }, [
    authLoading,
    isLoggedIn,
    product?.id,
    reloadAvailableCoupons,
    reloadMyCoupons,
  ]);

  const downloadableCoupons = useMemo(
    () =>
      product
        ? selectDownloadableCouponsForProduct(
            availableCoupons,
            ownedCoupons,
            productPrice,
            userGrade,
          )
        : [],
    [availableCoupons, ownedCoupons, product, productPrice, userGrade],
  );

  const ownedApplicableCoupons = useMemo(
    () =>
      product
        ? selectApplicableCouponsForProduct(
            ownedCoupons,
            productPrice,
            userGrade,
          )
        : [],
    [ownedCoupons, product, productPrice, userGrade],
  );

  const applicableCoupons = useMemo(
    () => [...downloadableCoupons, ...ownedApplicableCoupons],
    [downloadableCoupons, ownedApplicableCoupons],
  );

  const maxDiscountPercent = useMemo(
    () => getMaxProductCouponDiscountPercent(applicableCoupons, productPrice),
    [applicableCoupons, productPrice],
  );

  const downloadAll = useCallback(async () => {
    if (!product || downloading || downloadableCoupons.length === 0) {
      return;
    }

    setDownloading(true);
    try {
      const result = await downloadProductApplicableCoupons(
        productPrice,
        userGrade,
        { availableCoupons, ownedCoupons },
      );

      if (result.downloadedCount === 0) {
        return;
      }

      showToast(TOAST_MESSAGES.couponDownloaded);
      await Promise.all([reloadAvailableCoupons(), reloadMyCoupons()]);
    } catch (error) {
      Alert.alert(
        "쿠폰 다운로드 실패",
        error instanceof Error ? error.message : "쿠폰 다운로드에 실패했습니다.",
      );
    } finally {
      setDownloading(false);
    }
  }, [
    availableCoupons,
    downloadableCoupons.length,
    downloading,
    ownedCoupons,
    product,
    productPrice,
    reloadAvailableCoupons,
    reloadMyCoupons,
    showToast,
    userGrade,
  ]);

  return {
    visible:
      isLoggedIn &&
      !authLoading &&
      applicableCoupons.length > 0 &&
      maxDiscountPercent > 0,
    allDownloaded: downloadableCoupons.length === 0 && ownedApplicableCoupons.length > 0,
    maxDiscountPercent,
    downloading,
    downloadAll,
  };
}
