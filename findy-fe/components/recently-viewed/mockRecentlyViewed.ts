import { getProductById } from "@/components/home/mockProducts";
import {
  MOCK_MYPAGE_USER,
  getRecentlyViewedProducts,
} from "@/components/mypage/mockUser";
import type { Product } from "@/components/product";

/** 마이페이지 미리보기에 없는 목록 전용 상품 (저재고·품절 포함) */
const PAGE_EXTRA_PRODUCT_IDS = ["beef", "ramen-cup", "oat-milk"] as const;

export function getRecentlyViewedPageProducts(): Product[] {
  const ids = [
    ...MOCK_MYPAGE_USER.recentlyViewedProductIds,
    ...PAGE_EXTRA_PRODUCT_IDS,
  ];

  return ids
    .map((id) => {
      return (
        getProductById(id) ?? getRecentlyViewedProducts([id])[0] ?? null
      );
    })
    .filter((product): product is Product => product != null);
}
