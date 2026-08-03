"use client";

import { useEffect, useState } from "react";

type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
};

type SessionData = {
  session: {
    token: string;
    expiresAt: string;
    userId: string;
  } | null;
  user: SessionUser | null;
} | null;

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<SessionData>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && json.session) {
          setSession(json.session);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
          if (json.message) {
            setError(json.message);
          }
        }
      } catch {
        if (!isMounted) return;
        setSession(null);
        setStatus("error");
        setError("Network error");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, session, error };
}
