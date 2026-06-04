import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { resolveNotificationUserId } from "@/lib/notifications/resolveNotificationUserId";
import type { ApiEnvelope, NotificationClickApiData } from "@/lib/notifications/types";
import { notificationApiClient } from "./notificationClient";

export async function clickNotification(
  notificationId: number,
): Promise<NotificationClickApiData> {
  const userId = resolveNotificationUserId();
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    const response = await notificationApiClient.patch<
      ApiEnvelope<NotificationClickApiData>
    >(`/api/v1/recommendations/notifications/${notificationId}/click`, null, {
      params: { userId },
    });

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "알림 클릭 처리에 실패했습니다.");
    }

    return body.data;
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "알림 클릭 처리에 실패했습니다."));
  }
}
