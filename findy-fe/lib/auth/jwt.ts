/** JWT payload에서 userId(sub) 추출 */
export function getUserIdFromAccessToken(token: string): number | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = globalThis.atob(base64);
    const payload = JSON.parse(json) as { sub?: string };
    const id = Number(payload.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}
