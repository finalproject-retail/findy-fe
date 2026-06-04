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
  email: string;
  name: string;
  phoneNumber: string;
  grade: string;
  reward: number;
  purchaseAmount: number;
  birth_date: string;
  gender: string;
};

export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  grade: MembershipGrade;
  reward: number;
  purchaseAmount: number;
  birthDate: string;
  gender: string;
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
