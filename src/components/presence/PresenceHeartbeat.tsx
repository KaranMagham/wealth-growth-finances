"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";

export default function PresenceHeartbeat() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const sendHeartbeat = () => {
      void fetch("/api/presence/heartbeat", {
        method: "POST",
        credentials: "include",
      });
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 30_000);
    return () => window.clearInterval(interval);
  }, [status]);

  return null;
}