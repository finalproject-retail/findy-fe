import type { Product } from "@/components/product";

export type MapShoppingNotification = {
  id: string;
  createdAt: number;
  pickedProductId: string;
  pickedProductName: string;
  headline: string;
  description: string;
  relatedProduct: Product;
};
