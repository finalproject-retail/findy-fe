import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { DEFAULT_PRODUCT_PLACEHOLDER } from "@/lib/products/resolveProductImage";
import { enrichNotificationsWithProductImages } from "@/lib/notifications/enrichNotificationProducts";
import { mapNotificationProductToProduct } from "@/lib/notifications/mapNotificationProduct";
import { resolveNotificationUserId } from "@/lib/notifications/resolveNotificationUserId";
import type {
  ApiEnvelope,
  NotificationListItemApiDto,
  NotificationTypeFilter,
} from "@/lib/notifications/types";
import type { MapShoppingNotification } from "@/components/map/notifications/types";
import { notificationApiClient } from "./notificationClient";

function mapListItemToNotification(
  dto: NotificationListItemApiDto,
): MapShoppingNotification {
  const product =
    mapNotificationProductToProduct(
      dto.productId != null
        ? {
            productId: dto.productId,
            productName: dto.content?.trim() || undefined,
          }
        : undefined,
      dto.productId ?? undefined,
    ) ?? {
      id:
        dto.productId != null
          ? String(dto.productId)
          : `notification-${dto.notificationId}`,
      name: dto.title,
      image: DEFAULT_PRODUCT_PLACEHOLDER,
      discountPercent: 0,
      price: 0,
    };

  const sentAtMs = Date.parse(dto.sentAt);
  return {
    id: String(dto.notificationId),
    notificationId: dto.notificationId,
    createdAt: Number.isFinite(sentAtMs) ? sentAtMs : Date.now(),
    notificationType: dto.notificationType ?? undefined,
    isRead: dto.isRead,
    pickedProductId:
      dto.sourceProductId != null ? String(dto.sourceProductId) : "",
    pickedProductName: "",
    headline: dto.title,
    description: dto.content,
    relatedProduct: product,
  };
}

export async function fetchNotifications(options?: {
  size?: number;
  notificationType?: NotificationTypeFilter;
}): Promise<MapShoppingNotification[]> {
  const userId = resolveNotificationUserId();
  if (!userId) {
    return [];
  }

  const size = options?.size ?? 20;

  try {
    const response = await notificationApiClient.get<
      ApiEnvelope<NotificationListItemApiDto[]>
    >("/api/v1/notifications", {
      params: {
        userId,
        size,
        notificationType: options?.notificationType,
      },
    });

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "알림 목록을 불러오지 못했습니다.");
    }

    const mapped = (body.data ?? []).map(mapListItemToNotification);
    return enrichNotificationsWithProductImages(mapped);
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "알림 목록을 불러오지 못했습니다."));
  }
}
