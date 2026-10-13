"use client";

export type SessionResponse =
  | { success: true; session: { user?: unknown } }
  | { success: false; session: null; message?: string };

let pendingSessionRequest: Promise<SessionResponse> | null = null;

export async function getSessionClient(): Promise<SessionResponse> {
  if (!pendingSessionRequest) {
    pendingSessionRequest = fetch("/api/session", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        const data = (await res.json()) as SessionResponse;
        return data;
      })
      .catch(() => ({
        success: false,
        session: null,
        message: "Network error",
      }))
      .finally(() => {
        pendingSessionRequest = null;
      });
  }

  return pendingSessionRequest;
}
