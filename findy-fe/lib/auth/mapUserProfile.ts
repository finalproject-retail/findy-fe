import { normalizeMembershipGrade } from "@/lib/coupon/membershipGrade";
import type { UserMeApiDto, UserProfile } from "@/lib/auth/types";

export function mapMembershipGrade(raw: string | null | undefined) {
  return normalizeMembershipGrade(raw) ?? "bronze";
}

export function mapUserProfileFromApi(dto: UserMeApiDto): UserProfile {
  return {
    userId: String(dto.userId),
    email: dto.email,
    name: dto.name,
    phoneNumber: dto.phoneNumber,
    grade: mapMembershipGrade(dto.grade),
    reward: dto.reward ?? 0,
    purchaseAmount: dto.purchaseAmount ?? 0,
    birthDate: dto.birth_date,
    gender: dto.gender,
  };
}
