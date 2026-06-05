import { normalizeMembershipGrade } from "@/lib/coupon/membershipGrade";
import { isAdminRole } from "@/lib/auth/roles";
import type { UserMeApiDto, UserProfile } from "@/lib/auth/types";

export function mapMembershipGrade(raw: string | null | undefined) {
  return normalizeMembershipGrade(raw) ?? "bronze";
}

function resolveIsFirstLogin(dto: UserMeApiDto): boolean {
  if (typeof dto.isFirstLogin === "boolean") {
    return dto.isFirstLogin;
  }
  if (typeof dto.firstLogin === "boolean") {
    return dto.firstLogin;
  }
  return true;
}

export function mapUserProfileFromApi(dto: UserMeApiDto): UserProfile {
  const role = dto.role?.trim() ?? "";

  return {
    userId: String(dto.userId),
    email: dto.email,
    name: dto.name,
    grade: mapMembershipGrade(dto.grade),
    reward: dto.reward ?? 0,
    role,
    isAdmin: isAdminRole(role),
    isFirstLogin: resolveIsFirstLogin(dto),
  };
}
