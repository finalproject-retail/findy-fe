import { userApiClient } from "./userApiClient";

export type LoginResponseData = {
  accessToken?: string;
  token?: string;
  userId?: number;
  email?: string;
  name?: string;
  isFirstLogin?: boolean;
  firstLogin?: boolean;
};

export type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: LoginResponseData;
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

export function extractLoginData(
  body: LoginResponse,
): LoginResponseData | undefined {
  return body.data;
}

export function extractAccessToken(body: LoginResponse): string | undefined {
  return (
    body.data?.accessToken ??
    body.data?.token ??
    body.accessToken ??
    body.token
  );
}

export function resolveIsFirstLoginFromLogin(
  data?: LoginResponseData,
): boolean {
  if (!data) {
    return false;
  }

  if (typeof data.isFirstLogin === "boolean") {
    return data.isFirstLogin;
  }

  if (typeof data.firstLogin === "boolean") {
    return data.firstLogin;
  }

  return false;
}
