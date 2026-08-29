"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

type NotificationItem = {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

type NotificationsResponse = {
    notifications: NotificationItem[];
    unreadCount: number;
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<NotificationsResponse>({
        notifications: [],
        unreadCount: 0,
    });
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    async function loadNotifications() {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch("/api/notifications?limit=20", {
                credentials: "include",
                cache: "no-store",
            });
            if (!response.ok) throw new Error("Failed to load notifications");
            const result = (await response.json()) as NotificationsResponse;
            setData(result);
        } catch (error: unknown) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id: string) {
        const notification = data.notifications.find((item) => item._id === id);
        if (!notification || notification.isRead) return;

        const response = await fetch(`/api/notifications/${id}/read`, {
            method: "PATCH",
            credentials: "include",
        });
        if (!response.ok) return;

        setData((current) => ({
            ...current,
            unreadCount: Math.max(current.unreadCount - 1, 0),
            notifications: current.notifications.map((item) =>
                item._id === id ? { ...item, isRead: true } : item
            ),
        }));
    }

    async function markAllAsRead() {
        if (data.unreadCount === 0) return;

        const response = await fetch("/api/notifications/read-all", {
            method: "PATCH",
            credentials: "include",
        });
        if (!response.ok) return;

        setData((current) => ({
            unreadCount: 0,
            notifications: current.notifications.map((item) => ({
                ...item,
                isRead: true,
            })),
        }));
    }

    function togglePanel() {
        const nextOpen = !open;
        setOpen(nextOpen);
        if (nextOpen) void loadNotifications();
    }

    // Close on outside click
    useEffect(() => {
        if (!open) return;

        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={togglePanel}
                aria-label="Open notifications"
                aria-expanded={open}
                className="group relative rounded-full p-2 transition-all duration-200 hover:bg-slate-800 active:scale-90"
            >
                <Bell
                    className={`h-5 w-5 text-slate-300 transition-all duration-300 group-hover:text-white ${data.unreadCount > 0
                            ? "group-hover:animate-[wiggle_0.4s_ease-in-out]"
                            : "group-hover:rotate-12"
                        }`}
                />

                {data.unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                        <span className="relative rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
                            {data.unreadCount > 99 ? "99+" : data.unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-96 origin-top-right animate-[panelIn_0.18s_ease-out]">
                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-white shadow-2xl shadow-black/40">
                        <div className="flex items-center justify-between border-b border-slate-700 p-4">
                            <h2 className="font-semibold text-white">Notifications</h2>

                            {data.unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => void markAllAsRead()}
                                    className="relative text-sm text-blue-400 transition-colors hover:text-blue-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-blue-300 after:transition-all after:duration-200 hover:after:w-full"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {loading && (
                                <div className="space-y-3 p-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse space-y-2">
                                            <div className="h-3 w-2/3 rounded bg-slate-800" />
                                            <div className="h-2.5 w-full rounded bg-slate-800" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && data.notifications.length === 0 && (
                                <p className="p-4 text-sm text-slate-400">No notifications yet.</p>
                            )}

                            {!loading &&
                                data.notifications.map((notification, index) => (
                                    <button
                                        key={notification._id}
                                        type="button"
                                        onClick={() => {
                                            void markAsRead(notification._id);
                                        }}
                                        style={{ animationDelay: `${index * 40}ms` }}
                                        className={`group/item relative block w-full animate-[rowIn_0.25s_ease-out_backwards] overflow-hidden border-b border-slate-800 p-4 text-left transition-all duration-200 ${notification.isRead
                                                ? "bg-slate-900 hover:bg-slate-800"
                                                : "bg-slate-800/70 hover:bg-slate-800"
                                            } hover:pl-5`}
                                    >
                                        <span
                                            className={`absolute inset-y-0 left-0 w-[3px] scale-y-0 bg-blue-400 transition-transform duration-200 group-hover/item:scale-y-100 ${!notification.isRead ? "bg-blue-400" : "bg-slate-600"
                                                }`}
                                        />

                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-white transition-colors group-hover/item:text-blue-100">
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <span className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-blue-400" />
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm text-slate-300">{notification.message}</p>

                                        <p className="mt-2 text-xs text-slate-500 transition-colors group-hover/item:text-slate-400">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </button>
                                ))}
                        </div>
                        <Link
                            href="/notifications"
                            onClick={() => setOpen(false)}
                            className="block border-t border-slate-700 p-3 text-center text-sm font-medium text-blue-400 transition-colors hover:bg-slate-800 hover:text-blue-300"
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}

            <style jsx global>{`
        @keyframes panelIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes rowIn {
          from {
            opacity: 0;
            transform: translateX(6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-12deg);
          }
          75% {
            transform: rotate(12deg);
          }
        }
      `}</style>
        </div>
    );
}