import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import type { ApiEnvelope } from "@/lib/auth/types";

export type SavePreferencesPayload = {
  categoryIds: number[];
  shoppingStyleIds: number[];
};

export type UserPreferences = {
  userId: number;
  categoryIds: number[];
  shoppingStyleIds: number[];
};

export async function saveUserPreferences(
  payload: SavePreferencesPayload,
): Promise<void> {
  const response = await authenticatedUserApiClient.post<ApiEnvelope<void>>(
    "/api/v1/users/me/preferences",
    payload,
  );

  const body = response.data;
  if (body?.success === false) {
    throw new Error(body.message ?? "선호 정보 저장에 실패했습니다.");
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const response = await authenticatedUserApiClient.get<
    ApiEnvelope<UserPreferences>
  >("/api/v1/users/me/preferences");

  const body = response.data;
  if (!body?.success || !body.data) {
    throw new Error(body?.message ?? "선호 정보를 불러오지 못했습니다.");
  }

  return body.data;
}
