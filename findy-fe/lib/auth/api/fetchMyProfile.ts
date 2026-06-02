import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { mapUserProfileFromApi } from "@/lib/auth/mapUserProfile";
import type { ApiEnvelope, UserMeApiDto, UserProfile } from "@/lib/auth/types";

export async function fetchMyProfile(): Promise<UserProfile> {
  try {
    const response = await authenticatedUserApiClient.get<ApiEnvelope<UserMeApiDto>>(
      "/api/v1/users/me",
    );

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "회원 정보를 불러오지 못했습니다.");
    }

    return mapUserProfileFromApi(body.data);
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "회원 정보를 불러오지 못했습니다."));
  }
}
