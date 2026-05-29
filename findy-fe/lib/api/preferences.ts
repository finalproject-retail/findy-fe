import { apiClient } from "@/lib/api/client";

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export type SavePreferencesPayload = {
  categoryIds: number[];
  shoppingStyleIds: number[];
};

export async function saveUserPreferences(
  userId: number,
  payload: SavePreferencesPayload,
): Promise<void> {
  await apiClient.post<ApiEnvelope<void>>(
    "/api/v1/users/me/preferences",
    payload,
    { headers: { "X-USER-ID": String(userId) } },
  );
}
