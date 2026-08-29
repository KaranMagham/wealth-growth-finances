"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Info,
  Lightbulb,
  WalletCards,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

type Notification = {
  _id: string;
  category: string;
  severity:
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "CRITICAL";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
};

function getNotificationIcon(
  severity: Notification["severity"],
  category: string
) {
  if (category === "ai_insight") {
    return Lightbulb;
  }

  switch (severity) {
    case "CRITICAL":
    case "WARNING":
      return AlertTriangle;

    case "SUCCESS":
      return CheckCircle2;

    case "INFO":
    default:
      return Info;
  }
}

function getNotificationColors(
  severity: Notification["severity"],
  category: string,
  isRead: boolean
) {
  if (isRead) {
    return {
      card: "border-[#334155] bg-[#111827]",
      icon: "border-[#334155] bg-[#1E293B] text-[#94A3B8]",
      dot: "bg-[#64748B]",
    };
  }

  if (category === "ai_insight") {
    return {
      card: "border-violet-400/30 bg-violet-400/10",
      icon:
        "border-violet-300/30 bg-violet-400/20 text-violet-300",
      dot: "bg-violet-300",
    };
  }

  switch (severity) {
    case "CRITICAL":
      return {
        card: "border-red-500/30 bg-red-500/10",
        icon:
          "border-red-400/30 bg-red-500/20 text-red-300",
        dot: "bg-red-400",
      };

    case "WARNING":
      return {
        card: "border-amber-400/30 bg-amber-400/10",
        icon:
          "border-amber-300/30 bg-amber-400/20 text-amber-300",
        dot: "bg-amber-300",
      };

    case "SUCCESS":
      return {
        card: "border-emerald-400/30 bg-emerald-400/10",
        icon:
          "border-emerald-300/30 bg-emerald-400/20 text-emerald-300",
        dot: "bg-emerald-300",
      };

    case "INFO":
    default:
      return {
        card: "border-[#10B981]/30 bg-[#10B981]/10",
        icon:
          "border-[#10B981]/30 bg-[#10B981]/20 text-[#6EE7B7]",
        dot: "bg-[#10B981]",
      };
  }
}

export default function NotificationsPage() {
  const { status, session } = useSession();
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      if (!userId) {
        return;
      }

      try {
        const response = await fetch("/api/notifications", {
  cache: "no-store",
});

        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = await response.json();

        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (userId) {
      loadNotifications();
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function markAsRead(notificationId: string) {
    if (!userId) return;

    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId,
      }),
    });

    if (response.ok) {
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    }
  }

  async function markAllAsRead() {
    if (!userId) return;

    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markAll: true,
      }),
    });

    if (response.ok) {
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0F172A] px-4 py-12 text-[#F8FAFC]">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-[#1E293B]" />
          <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-[#1E293B]" />
          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl border border-[#334155] bg-[#111827]"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 text-[#F8FAFC]">
        <div className="w-full max-w-md rounded-3xl border border-[#334155] bg-[#111827] p-8 text-center shadow-2xl">
          <Bell className="mx-auto h-12 w-12 text-[#10B981]" />
          <h1 className="mt-4 text-2xl font-bold">
            Sign in to view notifications
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Your financial alerts and reminders will appear here.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-8 text-[#F8FAFC] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#111827] p-6 shadow-2xl shadow-[#10B981]/10 sm:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#10B981]/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-[#10B981]/30 bg-[#10B981]/20 p-3">
                <Bell className="h-7 w-7 text-[#6EE7B7]" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6EE7B7]">
                  Wealth updates
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                  Notifications
                </h1>
                <p className="mt-2 text-sm text-[#CBD5E1]">
                  Stay informed about your financial activity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#334155] bg-[#111827]/70 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#6EE7B7]">
                  {unreadCount}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Unread
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm font-semibold text-[#6EE7B7] transition hover:bg-[#10B981]/20"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8">
          {notifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#334155] bg-[#111827] px-6 py-16 text-center">
              <WalletCards className="mx-auto h-12 w-12 text-[#64748B]" />
              <h2 className="mt-4 text-xl font-bold">
                You are all caught up
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#94A3B8]">
                New budget alerts, reminders, and financial insights will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(
                  notification.severity,
                  notification.category
                );

                const colors = getNotificationColors(
                  notification.severity,
                  notification.category,
                  notification.isRead
                );

                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      markAsRead(notification._id)
                    }
                    className={`group w-full rounded-2xl border p-4 text-left shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:p-5 ${colors.card}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-2xl border p-3 ${colors.icon}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                              {notification.category.replaceAll("_", " ")}
                            </p>
                            <h2 className="mt-1 text-base font-bold text-[#F8FAFC]">
                              {notification.title}
                            </h2>
                          </div>

                          {!notification.isRead && (
                            <span
                              className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`}
                            />
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">
                          {notification.message}
                        </p>

                        <p className="mt-3 text-xs text-[#64748B]">
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}