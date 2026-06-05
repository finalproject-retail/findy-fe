import type { Product } from "@/components/product";
import { resolveStockCountFromApiFields } from "@/lib/products/resolveProductStock";
import { getProductDetailApi } from "@/lib/shopping/api";

export async function enrichProductsWithShoppingStock(
  products: Product[],
): Promise<Product[]> {
  if (products.length === 0) {
    return [];
  }

  const enriched = await Promise.all(
    products.map(async (product) => {
      try {
        const detail = await getProductDetailApi(product.id);
        const stockCount = resolveStockCountFromApiFields({
          saleStatus: detail.saleStatus,
          stockStatus: detail.stockStatus,
          stockQuantity: detail.stockQuantity,
        });

        return {
          ...product,
          stockCount,
        };
      } catch {
        // 재고 확인 실패 시 홈 추천 노출 제외
        return {
          ...product,
          stockCount: 0,
        };
      }
    }),
  );

  return enriched;
}
