export type ProductSortType =
  | "popularity"
  | "discount"
  | "price_asc"
  | "price_desc";

const SORT_LABELS: Record<ProductSortType, string> = {
  popularity: "인기순",
  discount: "할인율순",
  price_asc: "낮은가격순",
  price_desc: "높은가격순",
};

export const PRODUCT_SORT_OPTIONS: {
  key: ProductSortType;
  label: string;
}[] = (Object.keys(SORT_LABELS) as ProductSortType[]).map((key) => ({
  key,
  label: SORT_LABELS[key],
}));
