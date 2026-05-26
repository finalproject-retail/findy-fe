import { isOutOfStock } from "@/components/product/isOutOfStock";
import type { Product } from "@/components/product";

export function filterRecentlyViewedProducts(
  products: Product[],
  query: string,
  excludeOutOfStock: boolean,
): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    if (excludeOutOfStock && isOutOfStock(product)) return false;
    if (!normalizedQuery) return true;
    return product.name.toLowerCase().includes(normalizedQuery);
  });
}
