/**
 * 로그인 세션 유지 시간(ms).
 * 만료 후 앱을 다시 열면 저장된 토큰을 지우고 로그인 화면으로 이동합니다.
 *
 * `.env` / `.env.local` 예:
 *   EXPO_PUBLIC_SESSION_MAX_AGE_HOURS=24
 */
const hoursFromEnv = Number(process.env.EXPO_PUBLIC_SESSION_MAX_AGE_HOURS);

export const SESSION_MAX_AGE_MS =
  Number.isFinite(hoursFromEnv) && hoursFromEnv > 0
    ? hoursFromEnv * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000; // 기본 7일
