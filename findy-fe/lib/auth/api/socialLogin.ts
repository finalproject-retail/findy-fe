import { userApiClient } from "./userApiClient";
import type { LoginResponse } from "./login";

export type SocialLoginProvider = "kakao" | "google";

export type SocialLoginRequest = {
  code: string;
  redirectUri?: string;
};

/** POST /api/v1/auth/social/{provider} */
export async function postSocialLogin(
  provider: SocialLoginProvider,
  request: SocialLoginRequest,
): Promise<LoginResponse> {
  const response = await userApiClient.post<LoginResponse>(
    `/api/v1/auth/social/${provider}`,
    {
      code: request.code,
      ...(request.redirectUri ? { redirectUri: request.redirectUri } : {}),
    },
  );
  return response.data;
}
