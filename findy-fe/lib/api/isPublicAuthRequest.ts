/** 로그인·회원가입 등 인증 없이 호출하는 경로 */
const PUBLIC_AUTH_PATHS = ["/api/v1/auth/login", "/api/v1/users/signup"] as const;

export function isPublicAuthRequest(url?: string) {
  if (!url) {
    return false;
  }
  const path = url.split("?")[0] ?? url;
  return PUBLIC_AUTH_PATHS.some(
    (publicPath) => path === publicPath || path.endsWith(publicPath),
  );
}
