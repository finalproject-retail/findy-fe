import type { Product } from "@/components/product";

export type MapShoppingNotification = {
  id: string;
  notificationId: number;
  createdAt: number;
  notificationType?: string;
  isRead?: boolean;
  pickedProductId: string;
  pickedProductName: string;
  headline: string;
  description: string;
  relatedProduct: Product;
};
