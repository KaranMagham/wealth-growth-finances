"use client";

import { useState } from "react";

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
    const [data, setData] =
        useState<NotificationsResponse>({
            notifications: [],
            unreadCount: 0,
        });
    const [loading, setLoading] = useState(false);

    async function loadNotifications() {
        if (loading) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/notifications?limit=20",
                {
                    credentials: "include",
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load notifications");
            }

            const result =
                (await response.json()) as NotificationsResponse;

            setData(result);
        } catch (error: unknown) {
            console.error(
                "Failed to load notifications",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id: string) {
        const notification =
            data.notifications.find(
                (item) => item._id === id
            );

        if (!notification || notification.isRead) {
            return;
        }

        const response = await fetch(
            `/api/notifications/${id}/read`,
            {
                method: "PATCH",
                credentials: "include",
            }
        );

        if (!response.ok) {
            return;
        }

        setData((current) => ({
            ...current,
            unreadCount: Math.max(
                current.unreadCount - 1,
                0
            ),
            notifications: current.notifications.map(
                (item) =>
                    item._id === id
                        ? {
                            ...item,
                            isRead: true,
                        }
                        : item
            ),
        }));
    }

    async function markAllAsRead() {
        if (data.unreadCount === 0) {
            return;
        }

        const response = await fetch(
            "/api/notifications/read-all",
            {
                method: "PATCH",
                credentials: "include",
            }
        );

        if (!response.ok) {
            return;
        }

        setData((current) => ({
            unreadCount: 0,
            notifications: current.notifications.map(
                (item) => ({
                    ...item,
                    isRead: true,
                })
            ),
        }));
    }

    function togglePanel() {
        const nextOpen = !open;

        setOpen(nextOpen);

        if (nextOpen) {
            void loadNotifications();
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={togglePanel}
                aria-label="Open notifications"
                aria-expanded={open}
                className="relative rounded-full p-2"
            >
                <span aria-hidden="true">🔔</span>

                {data.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">
                        {data.unreadCount > 99
                            ? "99+"
                            : data.unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-96">
                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-700 p-4">
                            <h2 className="font-semibold text-white">
                                Notifications
                            </h2>

                            {data.unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => void markAllAsRead()}
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {loading && (
                                <p className="p-4 text-sm text-slate-400">
                                    Loading...
                                </p>
                            )}

                            {!loading &&
                                data.notifications.length === 0 && (
                                    <p className="p-4 text-sm text-slate-400">
                                        No notifications yet.
                                    </p>
                                )}

                            {!loading &&
                                data.notifications.map((notification) => (
                                    <button
                                        key={notification._id}
                                        type="button"
                                        onClick={() => {
                                            void markAsRead(notification._id);
                                        }}
                                        className={`block w-full border-b border-slate-800 p-4 text-left transition-colors ${notification.isRead
                                                ? "bg-slate-900 hover:bg-slate-800"
                                                : "bg-slate-800 hover:bg-slate-700"
                                            }`}
                                    >
                                        <p className="font-medium text-white">
                                            {notification.title}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-300">
                                            {notification.message}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-500">
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}