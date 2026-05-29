import { userApiClient } from "./userApiClient";

type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    token?: string;
  };
  accessToken?: string;
  token?: string;
};

export async function postLogin(email: string, password: string) {
  const response = await userApiClient.post<LoginResponse>("/api/v1/auth/login", {
    email,
    password,
  });
  return response.data;
}

export function extractAccessToken(body: LoginResponse): string | undefined {
  return (
    body.data?.accessToken ??
    body.data?.token ??
    body.accessToken ??
    body.token
  );
}
