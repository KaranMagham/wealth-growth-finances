"use client";

import { useState } from "react";

type ChannelPreference = {
  inApp: boolean;
  desktop: boolean;
  email: boolean;
};

type NotificationCategory =
  | "budget"
  | "payment"
  | "transaction"
  | "balance"
  | "goal"
  | "weekly_summary"
  | "monthly_summary"
  | "investment"
  | "ai_insight"
  | "security"
  | "system";

type NotificationPreferences = {
  enabled: boolean;
} & Record<NotificationCategory, ChannelPreference>;

type Channel = keyof ChannelPreference;

const categories: Array<{
  key: NotificationCategory;
  label: string;
}> = [
  { key: "budget", label: "Budget alerts" },
  { key: "payment", label: "Payment reminders" },
  { key: "transaction", label: "Transaction alerts" },
  { key: "balance", label: "Low balance alerts" },
  { key: "goal", label: "Goal updates" },
  { key: "weekly_summary", label: "Weekly summary" },
  { key: "monthly_summary", label: "Monthly summary" },
  { key: "investment", label: "Investment updates" },
  { key: "ai_insight", label: "AI insights" },
  { key: "security", label: "Security alerts" },
  { key: "system", label: "System notifications" },
];

const channels: Array<{
  key: Channel;
  label: string;
}> = [
  { key: "inApp", label: "In-app" },
  { key: "desktop", label: "Desktop" },
  { key: "email", label: "Email" },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  async function loadPreferences() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/notifications/preferences",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result) ||
            "Failed to load preferences"
        );
      }

      if (!isPreferencesResponse(result)) {
        throw new Error(
          "Invalid preferences response"
        );
      }

      setPreferences(result.preferences);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load preferences"
      );
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences(
    updates: Partial<NotificationPreferences>
  ) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/notifications/preferences",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result) ||
            "Failed to save preferences"
        );
      }

      if (!isPreferencesResponse(result)) {
        throw new Error(
          "Invalid preferences response"
        );
      }

      setPreferences(result.preferences);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleMasterSetting() {
    if (!preferences || saving) {
      return;
    }

    void savePreferences({
      enabled: !preferences.enabled,
    });
  }

  function toggleChannel(
    category: NotificationCategory,
    channel: Channel
  ) {
    if (!preferences || saving) {
      return;
    }

    const current = preferences[category];

    void savePreferences({
      [category]: {
        ...current,
        [channel]: !current[channel],
      },
    });
  }

  if (!preferences) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">
            Notification Preferences
          </h1>

          <p className="mt-2 text-slate-400">
            Choose how Wealth Growth should notify you.
          </p>

          {error && (
            <p className="mt-6 rounded-lg bg-red-950 p-4 text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void loadPreferences()}
            disabled={loading}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : "Load preferences"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Notification Preferences
            </h1>

            <p className="mt-2 text-slate-400">
              Choose how Wealth Growth should notify you.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPreferences()}
            disabled={loading || saving}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-red-950 p-4 text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <label className="flex items-center justify-between">
            <span>
              <span className="block font-medium">
                Enable notifications
              </span>

              <span className="mt-1 block text-sm text-slate-400">
                Turn all notification delivery on or off.
              </span>
            </span>

            <input
              type="checkbox"
              checked={preferences.enabled}
              disabled={saving}
              onChange={toggleMasterSetting}
              className="h-5 w-5 accent-blue-500"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[680px]">
            <thead className="bg-slate-900">
              <tr className="border-b border-slate-800">
                <th className="p-4 text-left">
                  Notification type
                </th>

                {channels.map((channel) => (
                  <th
                    key={channel.key}
                    className="p-4 text-center"
                  >
                    {channel.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.key}
                  className="border-b border-slate-800 bg-slate-950"
                >
                  <td className="p-4 text-slate-200">
                    {category.label}
                  </td>

                  {channels.map((channel) => (
                    <td
                      key={channel.key}
                      className="p-4 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={
                          preferences[category.key][
                            channel.key
                          ]
                        }
                        disabled={saving}
                        onChange={() =>
                          toggleChannel(
                            category.key,
                            channel.key
                          )
                        }
                        className="h-5 w-5 accent-blue-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {saving && (
          <p className="mt-4 text-sm text-slate-400">
            Saving preferences...
          </p>
        )}
      </div>
    </main>
  );
}

function getErrorMessage(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return null;
}

function isPreferencesResponse(
  value: unknown
): value is {
  preferences: NotificationPreferences;
} {
  if (
    typeof value !== "object" ||
    value === null ||
    !("preferences" in value)
  ) {
    return false;
  }

  return (
    typeof value.preferences === "object" &&
    value.preferences !== null
  );
}