import type { Product } from "@/components/product";
import { getProductDetailApi } from "@/lib/shopping/api";
import { mapProductDetailFromApi } from "@/lib/products/mapProductFromApi";
import type { ProductApiDto } from "@/lib/products/types";

export async function fetchProductDetail(
  productId: string | number,
): Promise<Product> {
  const dto = await getProductDetailApi(productId);
  const product = mapProductDetailFromApi(dto as ProductApiDto);

  if (!product) {
    throw new Error("상품 정보를 불러오지 못했습니다.");
  }

  return product;
}
