"use client";

export type SessionResponse =
  | { success: true; session: { user?: unknown } }
  | { success: false; session: null; message?: string };

let pendingSessionRequest: Promise<SessionResponse> | null = null;

export async function getSessionClient(): Promise<SessionResponse> {
  if (pendingSessionRequest) {
    return pendingSessionRequest;
  }

  const request = fetch("/api/session", {
    method: "GET",
    credentials: "include",
  })
    .then(async (res) => {
      const data = (await res.json()) as SessionResponse;
      return data;
    })
    .catch(
      (): SessionResponse => ({
        success: false,
        session: null,
        message: "Network error",
      })
    );

  pendingSessionRequest = request.finally(() => {
    pendingSessionRequest = null;
  });

  return request;
}
