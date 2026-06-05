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
  role?: string | null;
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
  role: string;
  isAdmin: boolean;
  isFirstLogin: boolean;
};

/** GET /api/v1/users/me/recent-views */
export type RecentViewApiDto = {
  productId: number;
  productName: string;
  price: number;
  thumbnailUrl: string | null;
  viewedAt: string;
  stockCount?: number;
  saleStatus?: string | null;
  stockStatus?: string | null;
};

/** POST /api/v1/users/me/recent-views */
export type RecentViewAddApiDto = {
  productId: number;
  viewedAt: string;
};
