import { Buffer } from "buffer";

function decodeJwtPayload(part: string): Record<string, unknown> {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const json =
    typeof globalThis.atob === "function"
      ? globalThis.atob(padded)
      : Buffer.from(padded, "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}

/** JWT payload에서 userId(sub) 추출 — 서명 검증 없음, 표시·API 파라미터용 */
export function getUserIdFromAccessToken(token: string | null | undefined): string | null {
  if (!token?.trim()) {
    return null;
  }

  try {
    const parts = token.trim().split(".");
    if (parts.length < 2) {
      return null;
    }

    const payload = decodeJwtPayload(parts[1]!);

    const raw =
      payload.userId ?? payload.user_id ?? payload.sub ?? payload.id ?? null;

    if (raw == null) {
      return null;
    }
    return String(raw);
  } catch {
    return null;
  }
}
