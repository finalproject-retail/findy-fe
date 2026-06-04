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
  /** Jackson may emit `firstLogin` for record field `isFirstLogin`. */
  isFirstLogin?: boolean;
  firstLogin?: boolean;
};

export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  grade: MembershipGrade;
  reward: number;
  isFirstLogin: boolean;
};

/** GET /api/v1/users/me/recent-views */
export type RecentViewApiDto = {
  productId: number;
  productName: string;
  price: number;
  thumbnailUrl: string | null;
  viewedAt: string;
};

/** POST /api/v1/users/me/recent-views */
export type RecentViewAddApiDto = {
  productId: number;
  viewedAt: string;
};
