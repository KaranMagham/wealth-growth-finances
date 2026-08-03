"use client";

export type SessionResponse =
  | { success: true; session: any }
  | { success: false; session: null; message?: string };

export async function getSessionClient(): Promise<SessionResponse> {
  try {
    const res = await fetch("/api/session", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    return data;
  } catch {
    return { success: false, session: null, message: "Network error" };
  }
}
