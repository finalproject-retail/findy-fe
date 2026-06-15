import type { Product } from "@/components/product";
import type {
  ApplicablePromotionApi,
  PromotionProductApi,
} from "@/lib/promotions/types";

type PromotionPricingSource =
  | Pick<
      PromotionProductApi,
      "promotionPrice" | "discountRate" | "gridId"
    >
  | Pick<
      ApplicablePromotionApi,
      "promotionPrice" | "discountRate"
    >;

function resolveDiscountPercent(
  promotionPrice: number | null | undefined,
  originalPrice: number,
  discountRate: number | string | null | undefined,
): number {
  if (discountRate != null && discountRate !== "") {
    const parsed = Number(discountRate);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }

  if (
    promotionPrice != null &&
    promotionPrice > 0 &&
    originalPrice > promotionPrice
  ) {
    return Math.round((1 - promotionPrice / originalPrice) * 100);
  }

  return 0;
}

export function applyPromotionPricingToProduct(
  product: Product,
  promotion: PromotionPricingSource,
): Product {
  const promotionPrice = promotion.promotionPrice;
  if (promotionPrice == null || promotionPrice <= 0) {
    return product;
  }

  const originalPrice = product.originalPrice ?? product.price;
  const discountPercent = resolveDiscountPercent(
    promotionPrice,
    originalPrice,
    promotion.discountRate,
  );

  const next: Product = {
    ...product,
    price: promotionPrice,
    couponPrice: promotionPrice,
    originalPrice: originalPrice > promotionPrice ? originalPrice : product.originalPrice,
    discountPercent,
  };

  if ("gridId" in promotion && promotion.gridId != null) {
    next.gridId = promotion.gridId;
  }

  return next;
}

export function applyBestApplicablePromotion(
  product: Product,
  promotions: ApplicablePromotionApi[],
): Product {
  const active = promotions.filter(
    (promotion) =>
      promotion.status === "ACTIVE" &&
      promotion.promotionPrice != null &&
      promotion.promotionPrice > 0,
  );

  if (active.length === 0) {
    return product;
  }

  const best = active.reduce((current, candidate) => {
    const currentPrice = current.promotionPrice ?? Number.MAX_SAFE_INTEGER;
    const candidatePrice = candidate.promotionPrice ?? Number.MAX_SAFE_INTEGER;
    return candidatePrice < currentPrice ? candidate : current;
  });

  return applyPromotionPricingToProduct(product, best);
}
