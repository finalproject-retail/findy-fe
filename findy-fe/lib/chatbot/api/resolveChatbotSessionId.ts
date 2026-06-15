type SessionIdSource = {
  sessionId?: number | string | null;
  chatSessionId?: number | string | null;
  id?: number | string | null;
};

function parseSessionId(value: number | string | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

/** 세션 DTO — sessionId → chatSessionId → id 순 fallback */
export function resolveChatbotSessionId(
  source: SessionIdSource | null | undefined,
): number | null {
  if (!source) {
    return null;
  }
  return (
    parseSessionId(source.sessionId) ??
    parseSessionId(source.chatSessionId) ??
    parseSessionId(source.id)
  );
}
