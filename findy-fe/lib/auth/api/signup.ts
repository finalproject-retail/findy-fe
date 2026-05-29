import axios from "axios";
import { userApiClient } from "./userApiClient";

export type SignupPayload = {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
};

type SignupResponse = {
  success?: boolean;
  message?: string;
};

export async function postSignup(payload: SignupPayload) {
  const response = await userApiClient.post<SignupResponse>(
    "/api/v1/users/signup",
    payload,
    { validateStatus: (status) => status < 500 },
  );

  const body = response.data;
  if (response.status >= 400 || body?.success === false) {
    const message = body?.message ?? `회원가입 실패 (HTTP ${response.status})`;
    throw new axios.AxiosError(
      message,
      axios.AxiosError.ERR_BAD_REQUEST,
      undefined,
      undefined,
      response,
    );
  }

  return body;
}
