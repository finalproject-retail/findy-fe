import type { ProductSortType } from "@/components/search/searchTypes";

/** GET /api/v1/products/search sortBy·direction (shopping-service 스펙) */
export function mapSearchSortParams(sort: ProductSortType): {
  sortBy?: string;
  direction?: "asc" | "desc";
} {
  switch (sort) {
    case "discount":
      return { sortBy: "discountRate", direction: "desc" };
    case "price_asc":
      return { sortBy: "originalPrice", direction: "asc" };
    case "price_desc":
      return { sortBy: "originalPrice", direction: "desc" };
    case "popularity":
    default:
      return {};
  }
}
