import type { MembershipGrade } from "@/components/mypage/mockUser";
import type { UserMeApiDto, UserProfile } from "@/lib/auth/types";

export function mapMembershipGrade(raw: string | null | undefined): MembershipGrade {
  const normalized = raw?.trim().toLowerCase() ?? "";

  if (normalized === "vip") {
    return "vip";
  }
  if (normalized === "gold") {
    return "gold";
  }
  if (normalized === "silver") {
    return "silver";
  }
  return "bronze";
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
  return {
    userId: String(dto.userId),
    email: dto.email,
    name: dto.name,
    grade: mapMembershipGrade(dto.grade),
    reward: dto.reward ?? 0,
    isFirstLogin: resolveIsFirstLogin(dto),
  };
}
