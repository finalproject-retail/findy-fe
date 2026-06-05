import type { ApiEnvelope } from "@/lib/map/types";

export type { ApiEnvelope };

export type NotificationProductApiDto = {
  productId?: number;
  productName?: string;
  brandName?: string | null;
  imageUrl?: string | null;
  originalPrice?: number | null;
  salePrice?: number | null;
  discountRate?: number | string | null;
};

export type ShoppingRecommendationNotificationApiData = {
  shouldShow: boolean;
  notificationId?: number | null;
  recommendationLogId?: number | null;
  notificationType?: string | null;
  title?: string | null;
  content?: string | null;
  product?: NotificationProductApiDto | null;
};

export type NotificationListItemApiDto = {
  notificationId: number;
  notificationType?: string | null;
  title: string;
  content: string;
  isRead: boolean;
  productId?: number | null;
  sourceProductId?: number | null;
  promotionId?: number | null;
  recommendationLogId?: number | null;
  sentAt: string;
};

export type NotificationClickApiData = {
  notificationId: number;
  productId?: number | null;
  isRead: boolean;
};

export type NotificationTypeFilter =
  | "RELATED_PRODUCT_RECOMMENDATION"
  | "PERSONALIZED_PROMOTION_RECOMMENDATION";
