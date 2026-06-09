import { getAccessToken } from "@/lib/api/client";
import { isPublicAuthRequest } from "@/lib/api/isPublicAuthRequest";
import { isAxiosError } from "axios";

type UnauthorizedSessionHandler = () => void | Promise<void>;

let handler: UnauthorizedSessionHandler | null = null;
let isHandling = false;
let sessionRestoreInProgress = false;

export function setSessionRestoreInProgress(value: boolean) {
  sessionRestoreInProgress = value;
}

export function setUnauthorizedSessionHandler(
  next: UnauthorizedSessionHandler | null,
) {
  handler = next;
}

export function isUnauthorizedHttpStatus(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

export function shouldHandleUnauthorizedSession(options: {
  status?: number;
  url?: string;
}): boolean {
  if (sessionRestoreInProgress) {
    return false;
  }
  if (!getAccessToken()) {
    return false;
  }
  if (!isUnauthorizedHttpStatus(options.status)) {
    return false;
  }
  return !isPublicAuthRequest(options.url);
}

export async function notifyUnauthorizedSession(): Promise<void> {
  if (!handler || isHandling) {
    return;
  }

  isHandling = true;
  try {
    await handler();
  } finally {
    setTimeout(() => {
      isHandling = false;
    }, 1000);
  }
}

export async function handleUnauthorizedHttpResponse(
  response: Response,
  url?: string,
): Promise<void> {
  if (!shouldHandleUnauthorizedSession({ status: response.status, url })) {
    return;
  }
  await notifyUnauthorizedSession();
}

export async function handleUnauthorizedApiError(error: unknown): Promise<void> {
  if (!isAxiosError(error)) {
    return;
  }

  if (
    !shouldHandleUnauthorizedSession({
      status: error.response?.status,
      url: error.config?.url,
    })
  ) {
    return;
  }

  await notifyUnauthorizedSession();
}
