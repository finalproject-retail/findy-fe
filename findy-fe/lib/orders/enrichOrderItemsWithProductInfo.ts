import type { OrderItemApiDto } from "@/lib/orders/api/types";
import { getProductDetailApi } from "@/lib/shopping/api";

type ProductInfo = {
  name: string;
  imageUrl: string | null;
};

async function fetchProductInfo(productId: number): Promise<ProductInfo | null> {
  try {
    const product = await getProductDetailApi(productId);
    return {
      name: product.productName?.trim() || "",
      imageUrl: product.imageUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function enrichOrderItemsWithProductInfo(
  items: OrderItemApiDto[],
): Promise<OrderItemApiDto[]> {
  if (items.length === 0) {
    return [];
  }

  const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
  const productInfoEntries = await Promise.all(
    uniqueProductIds.map(async (productId) => {
      const info = await fetchProductInfo(productId);
      return [productId, info] as const;
    }),
  );

  const productInfoMap = new Map<number, ProductInfo | null>(
    productInfoEntries,
  );

  return items.map((item) => {
    const info = productInfoMap.get(item.productId);
    const productName =
      item.productName ||
      info?.name ||
      (item.productId ? `상품 #${item.productId}` : "상품");

    return {
      ...item,
      productName,
      imageUrl: item.imageUrl ?? info?.imageUrl ?? null,
    };
  });
}
