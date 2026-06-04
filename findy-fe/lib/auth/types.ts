import type { MembershipGrade } from "@/components/mypage/mockUser";

export type ApiEnvelope<T> = {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
};

/** GET /api/v1/users/me */
export type UserMeApiDto = {
  userId: number;
  name: string;
  email: string;
  grade: string;
  reward: number;
  isFirstLogin: boolean;
};

export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  grade: MembershipGrade;
  reward: number;
  isFirstLogin: boolean;
};
